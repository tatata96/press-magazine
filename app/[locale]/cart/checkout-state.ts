import "server-only";

import {createHash} from "node:crypto";
import type {Cart, CartCheckoutContext} from "@/lib/shopify/cart";
import {getCartWithCheckoutContext} from "@/lib/shopify/cart";
import type {Money} from "@/lib/shopify/money";
import {LEGAL_DOCUMENTS_VERSION} from "@/lib/legal/consent";
import {
  assembleBuyerDetails,
  type BuyerDetails,
} from "../buyer-details/buyer-details";
import {readStoredBuyerDetails} from "../buyer-details/buyer-cookie";
import {readCartId} from "./cart-cookie";

// Everything the personalized Distance Sales Agreement states. It is built on the server
// from Shopify's cart and the saved buyer details, never from browser input.
export type AgreementSnapshot = {
  documentsVersion: string;
  buyer: BuyerDetails;
  lines: {
    title: string;
    quantity: number;
    unitPrice: Money;
    totalPrice: Money;
  }[];
  subtotal: Money;
  delivery: CartCheckoutContext["delivery"];
  total: Money;
  totalIsEstimated: boolean;
};

export type CheckoutState =
  | {status: "empty"}
  | {status: "needs_details"}
  | {
      status: "ready";
      cart: Cart;
      snapshot: AgreementSnapshot;
      /** Changes whenever anything the agreement states changes. */
      fingerprint: string;
    };

// Stable because the snapshot is always built with the same key order.
function fingerprintAgreement(snapshot: AgreementSnapshot): string {
  return createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
}

// Cookies are read here and not in loadCheckoutState so callers can keep this outside any
// try/catch: Next signals "this render is dynamic" by rejecting cookies(), and catching
// that would hide it.
export async function readCheckoutCookies() {
  const [cartId, storedBuyer] = await Promise.all([
    readCartId(),
    readStoredBuyerDetails(),
  ]);

  return {cartId, storedBuyer};
}

// Single source for the cart page and for the checkout handoff, so the agreement the buyer
// accepted is compared against exactly what the server would show right now.
export async function loadCheckoutState({
  cartId,
  storedBuyer,
}: Awaited<ReturnType<typeof readCheckoutCookies>>): Promise<CheckoutState> {
  const current = cartId ? await getCartWithCheckoutContext(cartId) : null;

  if (!current || current.cart.lines.length === 0) {
    return {status: "empty"};
  }

  const buyer = assembleBuyerDetails(storedBuyer, current.context);

  if (!buyer) {
    return {status: "needs_details"};
  }

  const {cart, context} = current;
  const snapshot: AgreementSnapshot = {
    documentsVersion: LEGAL_DOCUMENTS_VERSION,
    buyer,
    lines: cart.lines.map((line) => ({
      title: line.productTitle,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      totalPrice: line.totalPrice,
    })),
    subtotal: cart.subtotal,
    delivery: context.delivery,
    total: context.total,
    totalIsEstimated: context.totalIsEstimated,
  };

  return {
    status: "ready",
    cart,
    snapshot,
    fingerprint: fingerprintAgreement(snapshot),
  };
}
