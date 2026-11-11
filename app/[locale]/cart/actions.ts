"use server";

import {refresh} from "next/cache";
import {getLocale} from "next-intl/server";
import {CONSENT_ATTRIBUTE_KEYS, LEGAL_DOCUMENTS_VERSION} from "@/lib/legal/consent";
import {isLegalContentPublishable} from "@/lib/legal/readiness";
import {ShopifyError} from "@/lib/shopify/admin-client";
import {
  addCartLine,
  createCart,
  getCart,
  removeCartLine,
  setCartAttributesForCheckout,
  updateCartLineQuantity,
} from "@/lib/shopify/cart";
import {readCartId, writeCartId} from "./cart-cookie";
import {loadCheckoutState, readCheckoutCookies} from "./checkout-state";

export type CartActionResult = {ok: true} | {ok: false; error: "invalid" | "failed"};

const VARIANT_ID_PATTERN = /^gid:\/\/shopify\/ProductVariant\/\d+$/;
const CART_LINE_ID_PATTERN = /^gid:\/\/shopify\/CartLine\/[^\s]{1,200}$/;
// Sanity cap on a single line, not a business rule; Shopify enforces real stock limits.
const MAX_LINE_QUANTITY = 99;

// Server Actions are public endpoints, so every argument is validated again here.
function isValidQuantity(quantity: unknown): quantity is number {
  return (
    typeof quantity === "number" &&
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= MAX_LINE_QUANTITY
  );
}

async function runCartAction(
  action: () => Promise<void>,
): Promise<CartActionResult> {
  try {
    await action();
    refresh();

    return {ok: true};
  } catch (error) {
    // ShopifyError messages are safe by construction: no tokens, bodies or cart contents.
    console.error(
      "Cart action failed:",
      error instanceof ShopifyError ? error.message : "unexpected error",
    );

    return {ok: false, error: "failed"};
  }
}

export async function addToCart(variantId: string): Promise<CartActionResult> {
  if (typeof variantId !== "string" || !VARIANT_ID_PATTERN.test(variantId)) {
    return {ok: false, error: "invalid"};
  }

  return runCartAction(async () => {
    const cartId = await readCartId();
    const existingCart = cartId ? await getCart(cartId) : null;

    // A missing cart (expired or checked out) is replaced rather than treated as an error.
    const cart = existingCart
      ? await addCartLine(existingCart.id, variantId, 1)
      : await createCart(variantId, 1);

    await writeCartId(cart.id);
  });
}

export async function updateCartLine(
  lineId: string,
  quantity: number,
): Promise<CartActionResult> {
  if (
    typeof lineId !== "string" ||
    !CART_LINE_ID_PATTERN.test(lineId) ||
    !isValidQuantity(quantity)
  ) {
    return {ok: false, error: "invalid"};
  }

  return runCartAction(async () => {
    const cartId = await readCartId();

    if (!cartId) {
      throw new ShopifyError("No cart to update.");
    }

    await updateCartLineQuantity(cartId, lineId, quantity);
  });
}

export async function removeFromCart(
  lineId: string,
): Promise<CartActionResult> {
  if (typeof lineId !== "string" || !CART_LINE_ID_PATTERN.test(lineId)) {
    return {ok: false, error: "invalid"};
  }

  return runCartAction(async () => {
    const cartId = await readCartId();

    if (!cartId) {
      throw new ShopifyError("No cart to update.");
    }

    await removeCartLine(cartId, lineId);
  });
}

export type CheckoutActionResult =
  | {ok: true; checkoutUrl: string}
  | {
      ok: false;
      error:
        | "consent_required"
        | "empty_cart"
        | "needs_details"
        | "agreement_changed"
        | "unavailable"
        | "failed";
    };

// The only place the Shopify checkout URL is read. It is handed to the browser only when
// the fingerprint of the agreement the buyer accepted still matches the agreement the
// server builds right now, and the acceptance is recorded on the cart first. So the checkbox
// is not just a UI state, and a changed cart or detail cannot ride on an old acceptance.
// Limit: this guards our own flow. Shopify's hosted checkout can still change the delivery
// address, option and total afterwards, and cannot be gated from this repo.
export async function proceedToCheckout(
  acceptedFingerprint: string,
): Promise<CheckoutActionResult> {
  // Placeholder legal text must never reach a real checkout; see lib/legal/readiness.ts.
  if (!isLegalContentPublishable()) {
    return {ok: false, error: "unavailable"};
  }

  if (typeof acceptedFingerprint !== "string" || acceptedFingerprint === "") {
    return {ok: false, error: "consent_required"};
  }

  const cookies = await readCheckoutCookies();

  try {
    const state = await loadCheckoutState(cookies);

    if (state.status === "empty") {
      return {ok: false, error: "empty_cart"};
    }

    if (state.status === "needs_details") {
      return {ok: false, error: "needs_details"};
    }

    if (state.fingerprint !== acceptedFingerprint) {
      return {ok: false, error: "agreement_changed"};
    }

    const handoff = await setCartAttributesForCheckout(state.cart.id, {
      [CONSENT_ATTRIBUTE_KEYS.accepted]: "accepted",
      [CONSENT_ATTRIBUTE_KEYS.documentsVersion]: LEGAL_DOCUMENTS_VERSION,
      [CONSENT_ATTRIBUTE_KEYS.acceptedAt]: new Date().toISOString(),
      [CONSENT_ATTRIBUTE_KEYS.locale]: await getLocale(),
      [CONSENT_ATTRIBUTE_KEYS.agreementFingerprint]: state.fingerprint,
      [CONSENT_ATTRIBUTE_KEYS.cartReference]: state.cart.id.split("?")[0],
      [CONSENT_ATTRIBUTE_KEYS.agreedTotal]: `${state.snapshot.total.amount} ${state.snapshot.total.currencyCode}`,
    });

    if (
      handoff.totalQuantity < 1 ||
      !handoff.checkoutUrl.startsWith("https://")
    ) {
      return {ok: false, error: "empty_cart"};
    }

    return {ok: true, checkoutUrl: handoff.checkoutUrl};
  } catch (error) {
    console.error(
      "Checkout handoff failed:",
      error instanceof ShopifyError ? error.message : "unexpected error",
    );

    return {ok: false, error: "failed"};
  }
}
