import "server-only";

import {cookies} from "next/headers";
import {decryptJson, encryptJson} from "./buyer-crypto";
import type {PostalAddress, StoredBuyerDetails} from "./buyer-details";

const BUYER_COOKIE_NAME = "press_buyer_details";
// Personal data, so it expires much sooner than the cart cookie. Once it lapses the buyer
// is sent back to the details step, which is prefilled from the cart.
const BUYER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 48;

function isPostalAddress(value: unknown): value is PostalAddress {
  const address = value as Partial<PostalAddress> | null;

  return (
    typeof address?.address1 === "string" &&
    typeof address.address2 === "string" &&
    typeof address.city === "string" &&
    typeof address.zip === "string"
  );
}

// The cookie is user-controlled input, so it is decrypted and validated like a request body.
export async function readStoredBuyerDetails(): Promise<StoredBuyerDetails | null> {
  const raw = (await cookies()).get(BUYER_COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  // Decrypting also authenticates: a forged or edited cookie comes back as null.
  const value = decryptJson(raw) as Partial<StoredBuyerDetails> | null;

  if (
    typeof value?.firstName !== "string" ||
    typeof value.lastName !== "string" ||
    (value.billingAddress !== null && !isPostalAddress(value.billingAddress))
  ) {
    return null;
  }

  return {
    firstName: value.firstName,
    lastName: value.lastName,
    billingAddress: value.billingAddress,
  };
}

// Encrypted and httpOnly, so neither scripts nor the browser's owner can read it. Holds only
// what Shopify's cart has no field for (name, billing address); email, phone and the
// delivery address stay on the cart. There is no database.
export async function writeStoredBuyerDetails(
  details: StoredBuyerDetails,
): Promise<void> {
  (await cookies()).set(BUYER_COOKIE_NAME, encryptJson(details), {
    httpOnly: true,
    sameSite: "lax",
    // Always Secure: browsers treat localhost as secure, but Safari over plain http does not.
    secure: true,
    path: "/",
    maxAge: BUYER_COOKIE_MAX_AGE_SECONDS,
  });
}
