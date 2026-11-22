"use server";

import {refresh} from "next/cache";
import {
  type AddressInput,
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomer,
  setDefaultCustomerAddress,
  updateCustomerAddress,
  updateCustomerName,
} from "@/lib/customer-account/customer";
import {getSessionState} from "@/lib/customer-account/session";
import {CustomerAccountError, CustomerSessionExpiredError} from "@/lib/customer-account/types";
import {ShopifyError} from "@/lib/shopify/admin-client";
import {updateCustomerPhone} from "@/lib/shopify/admin-customer";
import {getSellingCountryCodes} from "@/lib/shopify/countries";
import {parseAddressForm, parseNameForm, type FormErrors} from "../buyer-details/buyer-details";
import {isAddressId, isValidPhone, normalizePhone} from "../buyer-details/checkout-selection";

export type AccountActionResult =
  | {ok: true; addressId?: string}
  | {ok: false; error: "invalid"; errors?: FormErrors}
  | {ok: false; error: "login_required" | "session_expired" | "failed"};

// Server Actions are public endpoints: each one checks the session itself, validates its
// arguments, and acts only on the signed-in customer's own data (Shopify enforces that too).
async function runAsCustomer(
  action: (accessToken: string) => Promise<AccountActionResult>,
): Promise<AccountActionResult> {
  const session = await getSessionState();

  if (session.status === "signed_out") {
    return {ok: false, error: "login_required"};
  }

  if (session.status === "expired") {
    return {ok: false, error: "session_expired"};
  }

  try {
    const result = await action(session.accessToken);

    if (result.ok) {
      refresh();
    }

    return result;
  } catch (error) {
    if (error instanceof CustomerSessionExpiredError) {
      return {ok: false, error: "session_expired"};
    }

    // Never log submitted values; these messages only carry codes.
    console.error(
      "Account action failed:",
      error instanceof CustomerAccountError || error instanceof ShopifyError
        ? error.message
        : "unexpected error",
    );

    return {ok: false, error: "failed"};
  }
}

export async function updateName(formData: FormData): Promise<AccountActionResult> {
  if (!(formData instanceof FormData)) {
    return {ok: false, error: "failed"};
  }

  const parsed = parseNameForm(formData);

  if (!parsed.ok) {
    return {ok: false, error: "invalid", errors: parsed.errors};
  }

  return runAsCustomer(async (accessToken) => {
    const result = await updateCustomerName(accessToken, parsed.name);

    return result.ok ? {ok: true} : {ok: false, error: "invalid"};
  });
}

export async function addAddress(formData: FormData): Promise<AccountActionResult> {
  if (!(formData instanceof FormData)) {
    return {ok: false, error: "failed"};
  }

  return runAsCustomer(async (accessToken) => {
    const [customer, allowedCountryCodes] = await Promise.all([
      getCustomer(accessToken),
      getSellingCountryCodes(),
    ]);

    if (!allowedCountryCodes) {
      throw new ShopifyError("Selling countries could not be loaded.");
    }

    const parsed = parseAddressForm(formData, {
      allowedCountryCodes,
      name: {firstName: customer.firstName, lastName: customer.lastName},
    });

    if (!parsed.ok) {
      return {ok: false, error: "invalid", errors: parsed.errors};
    }

    // The first saved address becomes the default, so there is always one to prefill.
    const result = await createCustomerAddress(accessToken, parsed.address, {
      makeDefault: customer.addresses.length === 0,
    });

    return result.ok ? {ok: true, addressId: result.addressId} : {ok: false, error: "invalid"};
  });
}

// Writes the phone to the customer record with the store's Admin credentials (the Customer
// Account API cannot). The customer id comes from the session, never from the browser.
export async function savePhone(phone: string): Promise<AccountActionResult> {
  const normalized = normalizePhone(typeof phone === "string" ? phone : "");

  if (!isValidPhone(normalized)) {
    return {ok: false, error: "invalid", errors: {phone: "invalid"}};
  }

  return runAsCustomer(async (accessToken) => {
    const customer = await getCustomer(accessToken);
    const result = await updateCustomerPhone(customer.id, normalized);

    return result.ok ? {ok: true} : {ok: false, error: "invalid", errors: {phone: "invalid"}};
  });
}

export async function editAddress(
  addressId: string,
  formData: FormData,
): Promise<AccountActionResult> {
  if (!isAddressId(addressId) || !(formData instanceof FormData)) {
    return {ok: false, error: "failed"};
  }

  return runAsCustomer(async (accessToken) => {
    const [customer, allowedCountryCodes] = await Promise.all([
      getCustomer(accessToken),
      getSellingCountryCodes(),
    ]);

    if (!allowedCountryCodes) {
      throw new ShopifyError("Selling countries could not be loaded.");
    }

    if (!customer.addresses.some((address) => address.id === addressId)) {
      return {ok: false, error: "failed"};
    }

    const parsed = parseAddressForm(formData, {
      allowedCountryCodes,
      name: {firstName: customer.firstName, lastName: customer.lastName},
    });

    if (!parsed.ok) {
      return {ok: false, error: "invalid", errors: parsed.errors};
    }

    const result = await updateCustomerAddress(accessToken, addressId, parsed.address);

    return result.ok ? {ok: true} : {ok: false, error: "invalid"};
  });
}

export async function makeDefaultAddress(addressId: string): Promise<AccountActionResult> {
  if (!isAddressId(addressId)) {
    return {ok: false, error: "failed"};
  }

  return runAsCustomer(async (accessToken) => {
    const customer = await getCustomer(accessToken);
    const current = customer.addresses.find((entry) => entry.id === addressId);

    if (!current) {
      return {ok: false, error: "failed"};
    }

    // The API sets the default through the update mutation, so the current values go back.
    const address: AddressInput = {
      firstName: current.firstName,
      lastName: current.lastName,
      address1: current.address1,
      address2: current.address2,
      city: current.city,
      zip: current.zip,
      countryCode: current.countryCode,
    };
    const result = await setDefaultCustomerAddress(accessToken, addressId, address);

    return result.ok ? {ok: true} : {ok: false, error: "invalid"};
  });
}

export async function removeAddress(addressId: string): Promise<AccountActionResult> {
  if (!isAddressId(addressId)) {
    return {ok: false, error: "failed"};
  }

  return runAsCustomer(async (accessToken) => {
    const result = await deleteCustomerAddress(accessToken, addressId);

    return result.ok ? {ok: true} : {ok: false, error: "invalid"};
  });
}
