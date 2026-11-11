import "server-only";

import {cookies} from "next/headers";

const CART_COOKIE_NAME = "press_cart_id";
// Shopify expires carts after a period of inactivity; an expired id is handled where the
// cart is read, so this only bounds how long the browser keeps the cookie.
const CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 10;

export async function readCartId(): Promise<string | undefined> {
  return (await cookies()).get(CART_COOKIE_NAME)?.value;
}

// The id lives in an httpOnly cookie so only our server code can read or change the cart.
export async function writeCartId(cartId: string): Promise<void> {
  (await cookies()).set(CART_COOKIE_NAME, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE_SECONDS,
  });
}
