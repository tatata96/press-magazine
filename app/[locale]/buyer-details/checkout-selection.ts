import type {CustomerAddress} from "@/lib/customer-account/customer";
import type {BuyerDetails, PostalAddress} from "./buyer-details";

// No runtime imports on purpose: this is the checkout's business rule for "who is buying and
// where", and it is covered by tests/checkout-selection.test.mjs.

// What the buyer chose on the cart page. Addresses are ids of the customer's saved addresses,
// so the browser can never inject an address: the server looks each one up on Shopify.
export type CheckoutSelection = {
  phone: string;
  /** Required for carts with a physical product, ignored otherwise. */
  shippingAddressId: string | null;
  /** null means "same as the delivery address", which only exists for physical carts. */
  billingAddressId: string | null;
};

const ADDRESS_ID_PATTERN = /^gid:\/\/shopify\/CustomerAddress\/[^\s]{1,200}$/;
// E.164: Shopify expects the country calling code, so a national number is rejected
// rather than guessed at.
const PHONE_PATTERN = /^\+[1-9][0-9]{6,14}$/;

export function normalizePhone(value: string): string {
  return value.replace(/[\s().-]/g, "");
}

export function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test(normalizePhone(value));
}

export function isAddressId(value: unknown): value is string {
  return typeof value === "string" && ADDRESS_ID_PATTERN.test(value);
}

function parseAddressId(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }

  return typeof value === "string" && ADDRESS_ID_PATTERN.test(value) ? value : undefined;
}

// Server Actions are public endpoints, so the selection is validated like a request body.
export function parseCheckoutSelection(input: unknown): CheckoutSelection | null {
  const candidate = input as Partial<Record<keyof CheckoutSelection, unknown>> | null;

  if (typeof candidate !== "object" || candidate === null || typeof candidate.phone !== "string") {
    return null;
  }

  const phone = normalizePhone(candidate.phone);
  const shippingAddressId = parseAddressId(candidate.shippingAddressId);
  const billingAddressId = parseAddressId(candidate.billingAddressId);

  if (!PHONE_PATTERN.test(phone) || shippingAddressId === undefined || billingAddressId === undefined) {
    return null;
  }

  return {phone, shippingAddressId, billingAddressId};
}

export type BuyerResolutionFailure =
  | "needs_name"
  | "needs_email"
  | "needs_shipping_address"
  | "needs_billing_address"
  | "unsupported_country";

export type BuyerResolution =
  | {ok: true; details: BuyerDetails}
  | {ok: false; reason: BuyerResolutionFailure};

function toPostalAddress(address: CustomerAddress): PostalAddress {
  return {
    address1: address.address1,
    address2: address.address2,
    city: address.city,
    zip: address.zip,
    countryCode: address.countryCode,
  };
}

// Turns the signed-in customer plus the buyer's selection into the details the agreement
// states. Only information the customer account already holds is used; anything missing is
// reported so the buyer is asked for exactly that and nothing more.
export function resolveBuyerDetails(input: {
  profile: {firstName: string; lastName: string; email: string | null};
  addresses: CustomerAddress[];
  selection: CheckoutSelection;
  requiresShipping: boolean;
  allowedCountryCodes: string[];
}): BuyerResolution {
  const {profile, addresses, selection, requiresShipping, allowedCountryCodes} = input;
  const firstName = profile.firstName.trim();
  const lastName = profile.lastName.trim();

  if (!firstName || !lastName) {
    return {ok: false, reason: "needs_name"};
  }

  if (!profile.email) {
    return {ok: false, reason: "needs_email"};
  }

  const findAddress = (id: string | null) => addresses.find((address) => address.id === id);
  const shipping = requiresShipping ? findAddress(selection.shippingAddressId) : undefined;

  if (requiresShipping && !shipping) {
    return {ok: false, reason: "needs_shipping_address"};
  }

  // "Same as delivery" needs a delivery address to point at.
  const billing = selection.billingAddressId === null ? undefined : findAddress(selection.billingAddressId);

  if (selection.billingAddressId === null ? !requiresShipping : !billing) {
    return {ok: false, reason: "needs_billing_address"};
  }

  const countryAddress = shipping ?? billing;

  if (!countryAddress) {
    return {ok: false, reason: "needs_billing_address"};
  }

  // The delivery address must be somewhere the shop sells to; so must the billing country.
  const countries = [shipping?.countryCode, billing?.countryCode].filter(Boolean) as string[];

  if (countries.some((code) => !allowedCountryCodes.includes(code))) {
    return {ok: false, reason: "unsupported_country"};
  }

  return {
    ok: true,
    details: {
      firstName,
      lastName,
      email: profile.email,
      phone: selection.phone,
      countryCode: countryAddress.countryCode,
      shippingAddress: shipping ? toPostalAddress(shipping) : null,
      billingAddress: billing ? toPostalAddress(billing) : null,
    },
  };
}
