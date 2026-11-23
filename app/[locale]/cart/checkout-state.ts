import "server-only";

import {createHash} from "node:crypto";
import {readCartId} from "@/lib/cookies/cart-cookie";
import {getCustomer} from "@/lib/customer-account/customer";
import {getSessionState, type SessionState} from "@/lib/customer-account/session";
import {CustomerSessionExpiredError} from "@/lib/customer-account/types";
import {LEGAL_DOCUMENTS_VERSION} from "@/lib/legal/consent";
import {ShopifyError} from "@/lib/shopify/admin-client";
import type {Cart, CartCheckoutContext} from "@/lib/shopify/cart";
import {getCartWithCheckoutContext, setCartForCustomer} from "@/lib/shopify/cart";
import {getSellingCountryCodes} from "@/lib/shopify/countries";
import type {Money} from "@/lib/shopify/money";
import type {PlanId} from "@/lib/shopify/plan-products";
import type {BuyerDetails} from "../buyer-details/buyer-details";
import {resolveBuyerDetails, type CheckoutSelection} from "../buyer-details/checkout-selection";

// Everything the personalized Distance Sales Agreement states. It is built on the server
// from Shopify's cart and the signed-in customer's account, never from browser input.
export type AgreementSnapshot = {
  documentsVersion: string;
  buyer: BuyerDetails;
  lines: {
    title: string;
    planId: PlanId | null;
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
  | {status: "empty" | "login_required" | "session_expired" | "invalid_details"}
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

export type CheckoutInputs = {cartId: string | undefined; session: SessionState};

// Cookies are read here and not in prepareCheckoutState so callers can keep this outside any
// try/catch: Next signals "this render is dynamic" by rejecting cookies(), and catching
// that would hide it.
export async function readCheckoutInputs(): Promise<CheckoutInputs> {
  const [cartId, session] = await Promise.all([readCartId(), getSessionState()]);

  return {cartId, session};
}

function buildSnapshot(
  cart: Cart,
  context: CartCheckoutContext,
  buyer: BuyerDetails,
): AgreementSnapshot {
  return {
    documentsVersion: LEGAL_DOCUMENTS_VERSION,
    buyer,
    lines: cart.lines.map((line) => ({
      title: line.productTitle,
      planId: line.planId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      totalPrice: line.totalPrice,
    })),
    subtotal: cart.subtotal,
    delivery: context.delivery,
    total: context.total,
    totalIsEstimated: context.totalIsEstimated,
  };
}

// Single source for the agreement shown to the buyer and for the checkout handoff, so the
// agreement they accepted is compared against exactly what the server would show right now.
// It also writes the buyer onto the Shopify cart (customer, phone, delivery address), so the
// cart, and with it the delivery estimate and total, always matches the agreement.
export async function prepareCheckoutState(
  {cartId, session}: CheckoutInputs,
  selection: CheckoutSelection,
): Promise<CheckoutState> {
  if (session.status === "signed_out") {
    return {status: "login_required"};
  }

  if (session.status === "expired") {
    return {status: "session_expired"};
  }

  let customer: Awaited<ReturnType<typeof getCustomer>>;

  try {
    customer = await getCustomer(session.accessToken);
  } catch (error) {
    if (error instanceof CustomerSessionExpiredError) {
      return {status: "session_expired"};
    }

    throw error;
  }

  const [current, allowedCountryCodes] = await Promise.all([
    cartId ? getCartWithCheckoutContext(cartId) : null,
    getSellingCountryCodes(),
  ]);

  if (!current || current.cart.lines.length === 0) {
    return {status: "empty"};
  }

  if (!allowedCountryCodes) {
    throw new ShopifyError("Selling countries could not be loaded.");
  }

  const resolution = resolveBuyerDetails({
    profile: customer,
    addresses: customer.addresses,
    selection,
    requiresShipping: current.context.requiresShipping,
    allowedCountryCodes,
  });

  if (!resolution.ok) {
    return {status: "invalid_details"};
  }

  const {details} = resolution;

  await setCartForCustomer(current.cart.id, {
    customerAccessToken: session.accessToken,
    phone: details.phone,
    countryCode: details.countryCode,
    shippingAddress: details.shippingAddress
      ? {
          ...details.shippingAddress,
          firstName: details.firstName,
          lastName: details.lastName,
        }
      : null,
  });

  // Re-read Shopify after saving: delivery estimates and totals may have changed.
  const updated = await getCartWithCheckoutContext(current.cart.id);

  if (!updated || updated.cart.lines.length === 0) {
    return {status: "empty"};
  }

  const snapshot = buildSnapshot(updated.cart, updated.context, details);

  return {
    status: "ready",
    cart: updated.cart,
    snapshot,
    fingerprint: fingerprintAgreement(snapshot),
  };
}
