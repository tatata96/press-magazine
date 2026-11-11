import type {CartAddress, CartCheckoutContext} from "@/lib/shopify/cart";
import {getTrimmedString} from "@/app/utils/string";

export type PostalAddress = {
  address1: string;
  address2: string;
  city: string;
  zip: string;
};

export type BuyerDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  /** Only for carts with a physical product. */
  shippingAddress: PostalAddress | null;
  /** null means "same as the delivery address", which only exists for physical carts. */
  billingAddress: PostalAddress | null;
};

// The part of the buyer details Shopify's cart cannot hold: it has no buyer name and no
// billing address. Kept in an httpOnly cookie (see buyer-cookie.ts).
export type StoredBuyerDetails = {
  firstName: string;
  lastName: string;
  billingAddress: PostalAddress | null;
};

export type FieldErrorCode = "required" | "invalid";
// Keys are form field names, e.g. "email" or "shipping.city".
export type BuyerDetailsErrors = Partial<Record<string, FieldErrorCode>>;

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_ADDRESS_LENGTH = 200;
const MAX_CITY_LENGTH = 100;
const MAX_ZIP_LENGTH = 20;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// E.164: Shopify expects the country calling code, so a national number is rejected
// rather than guessed at.
const PHONE_PATTERN = /^\+[1-9][0-9]{6,14}$/;

export function normalizePhone(value: string): string {
  return value.replace(/[\s().-]/g, "");
}

function readAddress(
  formData: FormData,
  prefix: "shipping" | "billing",
  errors: BuyerDetailsErrors,
): PostalAddress {
  const address: PostalAddress = {
    address1: getTrimmedString(formData.get(`${prefix}.address1`)),
    address2: getTrimmedString(formData.get(`${prefix}.address2`)),
    city: getTrimmedString(formData.get(`${prefix}.city`)),
    zip: getTrimmedString(formData.get(`${prefix}.zip`)),
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
      errors[`${prefix}.${field}`] = "required";
    } else if (value.length > maxLength) {
      errors[`${prefix}.${field}`] = "invalid";
    }
  }

  return address;
}

// Server-side validation. The browser's `required` attributes are only a convenience.
export function parseBuyerDetails(
  formData: FormData,
  options: {requiresShipping: boolean; allowedCountryCodes: string[]},
): {ok: true; details: BuyerDetails} | {ok: false; errors: BuyerDetailsErrors} {
  const errors: BuyerDetailsErrors = {};
  const firstName = getTrimmedString(formData.get("firstName"));
  const lastName = getTrimmedString(formData.get("lastName"));
  const email = getTrimmedString(formData.get("email"));
  const phone = normalizePhone(getTrimmedString(formData.get("phone")));
  const countryCode = getTrimmedString(formData.get("countryCode"));

  if (!firstName) {
    errors.firstName = "required";
  } else if (firstName.length > MAX_NAME_LENGTH) {
    errors.firstName = "invalid";
  }

  if (!lastName) {
    errors.lastName = "required";
  } else if (lastName.length > MAX_NAME_LENGTH) {
    errors.lastName = "invalid";
  }

  if (!email) {
    errors.email = "required";
  } else if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    errors.email = "invalid";
  }

  if (!phone) {
    errors.phone = "required";
  } else if (!PHONE_PATTERN.test(phone)) {
    errors.phone = "invalid";
  }

  if (!countryCode) {
    errors.countryCode = "required";
  } else if (!options.allowedCountryCodes.includes(countryCode)) {
    errors.countryCode = "invalid";
  }

  const shippingAddress = options.requiresShipping
    ? readAddress(formData, "shipping", errors)
    : null;
  // Same-as-delivery is only an option when there is a delivery address.
  const billingIsSameAsShipping =
    options.requiresShipping && formData.get("billingSameAsShipping") === "on";
  const billingAddress = billingIsSameAsShipping
    ? null
    : readAddress(formData, "billing", errors);

  if (Object.keys(errors).length > 0) {
    return {ok: false, errors};
  }

  return {
    ok: true,
    details: {
      firstName,
      lastName,
      email,
      phone,
      countryCode,
      shippingAddress,
      billingAddress,
    },
  };
}

// Combines the cart (email, phone, country, delivery address) with the stored name and
// billing address. Returns null when anything the cart's contents require is missing, which
// sends the buyer back to the details step.
export function assembleBuyerDetails(
  stored: StoredBuyerDetails | null,
  context: CartCheckoutContext,
): BuyerDetails | null {
  const {email, phone, countryCode} = context.buyer;

  if (!stored || !email || !phone || !countryCode) {
    return null;
  }

  const shippingAddress = toPostalAddress(context.shippingAddress);

  if (context.requiresShipping && !shippingAddress) {
    return null;
  }

  // Without a delivery address there is nothing for "same as delivery" to point at.
  if (!stored.billingAddress && !shippingAddress) {
    return null;
  }

  return {
    firstName: stored.firstName,
    lastName: stored.lastName,
    email,
    phone,
    countryCode,
    shippingAddress: context.requiresShipping ? shippingAddress : null,
    billingAddress: stored.billingAddress,
  };
}

function toPostalAddress(address: CartAddress | null): PostalAddress | null {
  return address
    ? {
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        zip: address.zip,
      }
    : null;
}
