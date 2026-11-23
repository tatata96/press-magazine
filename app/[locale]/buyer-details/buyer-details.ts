import {getTrimmedString} from "@/app/utils/string";
import type {AddressInput} from "@/lib/customer-account/customer";

export type PostalAddress = {
  address1: string;
  address2: string;
  city: string;
  zip: string;
  /** ISO 3166-1 alpha-2. Each address names its own country. */
  countryCode: string;
};

// What the Distance Sales Agreement states about the buyer. Built on the server from the
// signed-in customer's Shopify account and the addresses they picked, never from browser input.
export type BuyerDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Country of the delivery address, or of the billing address for digital-only carts. */
  countryCode: string;
  /** Only for carts with a physical product. */
  shippingAddress: PostalAddress | null;
  /** null means "same as the delivery address", which only exists for physical carts. */
  billingAddress: PostalAddress | null;
};

export type FieldErrorCode = "required" | "invalid";
// Keys are form field names, e.g. "address1" or "firstName".
export type FormErrors = Partial<Record<string, FieldErrorCode>>;

const MAX_NAME_LENGTH = 100;
const MAX_ADDRESS_LENGTH = 200;
const MAX_CITY_LENGTH = 100;
const MAX_ZIP_LENGTH = 20;

// Server-side validation. The browser's `required` attributes are only a convenience.
export function parseNameForm(
  formData: FormData,
): {ok: true; name: {firstName: string; lastName: string}} | {ok: false; errors: FormErrors} {
  const errors: FormErrors = {};
  const name = {
    firstName: getTrimmedString(formData.get("firstName")),
    lastName: getTrimmedString(formData.get("lastName")),
  };

  for (const field of ["firstName", "lastName"] as const) {
    if (!name[field]) {
      errors[field] = "required";
    } else if (name[field].length > MAX_NAME_LENGTH) {
      errors[field] = "invalid";
    }
  }

  return Object.keys(errors).length > 0 ? {ok: false, errors} : {ok: true, name};
}

export function parseAddressForm(
  formData: FormData,
  options: {
    allowedCountryCodes: string[];
    /** The recipient, taken from the customer's profile. */
    name: {firstName: string; lastName: string};
  },
): {ok: true; address: AddressInput} | {ok: false; errors: FormErrors} {
  const errors: FormErrors = {};
  const address: AddressInput = {
    firstName: options.name.firstName,
    lastName: options.name.lastName,
    address1: getTrimmedString(formData.get("address1")),
    address2: getTrimmedString(formData.get("address2")),
    city: getTrimmedString(formData.get("city")),
    zip: getTrimmedString(formData.get("zip")),
    countryCode: getTrimmedString(formData.get("countryCode")),
  };
  const limits = [
    ["address1", MAX_ADDRESS_LENGTH],
    ["address2", MAX_ADDRESS_LENGTH],
    ["city", MAX_CITY_LENGTH],
    ["zip", MAX_ZIP_LENGTH],
  ] as const;

  for (const [field, maxLength] of limits) {
    const value = address[field];

    if (!value && field !== "address2") {
      errors[field] = "required";
    } else if (value.length > maxLength) {
      errors[field] = "invalid";
    }
  }

  if (!address.countryCode) {
    errors.countryCode = "required";
  } else if (!options.allowedCountryCodes.includes(address.countryCode)) {
    errors.countryCode = "invalid";
  }

  return Object.keys(errors).length > 0 ? {ok: false, errors} : {ok: true, address};
}
