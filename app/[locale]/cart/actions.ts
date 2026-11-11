"use server";

import {refresh} from "next/cache";
import {ShopifyError} from "@/lib/shopify/admin-client";
import {
  addCartLine,
  createCart,
  getCart,
  removeCartLine,
  updateCartLineQuantity,
} from "@/lib/shopify/cart";
import {readCartId, writeCartId} from "./cart-cookie";

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
