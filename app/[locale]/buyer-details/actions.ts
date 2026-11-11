"use server";

import {refresh} from "next/cache";
import {isLegalContentPublishable} from "@/lib/legal/readiness";
import {ShopifyError} from "@/lib/shopify/admin-client";
import {getCartWithCheckoutContext, setCartBuyer} from "@/lib/shopify/cart";
import {getSellingCountryCodes} from "@/lib/shopify/countries";
import {readCartId} from "../cart/cart-cookie";
import {parseBuyerDetails, type BuyerDetailsErrors} from "./buyer-details";
import {BuyerCookieConfigError} from "./buyer-crypto";
import {writeStoredBuyerDetails} from "./buyer-cookie";

export type SaveBuyerDetailsResult =
  | {ok: true}
  | {ok: false; error: "invalid"; errors: BuyerDetailsErrors}
  | {ok: false; error: "empty_cart" | "unavailable" | "failed"};

// Public endpoint: everything is validated again here, and whether a delivery address is
// needed comes from the cart on Shopify, never from the browser.
export async function saveBuyerDetails(
  formData: FormData,
): Promise<SaveBuyerDetailsResult> {
  if (!(formData instanceof FormData)) {
    return {ok: false, error: "failed"};
  }

  // No personal data is collected for a checkout that cannot open yet.
  if (!isLegalContentPublishable()) {
    return {ok: false, error: "unavailable"};
  }

  try {
    const cartId = await readCartId();
    const current = cartId ? await getCartWithCheckoutContext(cartId) : null;

    if (!cartId || !current || current.cart.lines.length === 0) {
      return {ok: false, error: "empty_cart"};
    }

    const allowedCountryCodes = await getSellingCountryCodes();

    if (!allowedCountryCodes) {
      return {ok: false, error: "failed"};
    }

    const parsed = parseBuyerDetails(formData, {
      requiresShipping: current.context.requiresShipping,
      allowedCountryCodes,
    });

    if (!parsed.ok) {
      return {ok: false, error: "invalid", errors: parsed.errors};
    }

    const {details} = parsed;

    await setCartBuyer(cartId, {
      email: details.email,
      phone: details.phone,
      countryCode: details.countryCode,
      shippingAddress: details.shippingAddress
        ? {
            ...details.shippingAddress,
            firstName: details.firstName,
            lastName: details.lastName,
            countryCode: details.countryCode,
          }
        : null,
    });
    await writeStoredBuyerDetails({
      firstName: details.firstName,
      lastName: details.lastName,
      billingAddress: details.billingAddress,
    });
    refresh();

    return {ok: true};
  } catch (error) {
    // Never log the submitted values; ShopifyError messages only carry error codes.
    console.error(
      "Saving buyer details failed:",
      error instanceof ShopifyError || error instanceof BuyerCookieConfigError
        ? error.message
        : "unexpected error",
    );

    return {ok: false, error: "failed"};
  }
}
