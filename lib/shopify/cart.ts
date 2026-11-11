import "server-only";

import {ShopifyError} from "./admin-client";
import type {Money} from "./money";
import {requestShopifyStorefrontGraphQL} from "./storefront-client";

export type CartLine = {
  id: string;
  quantity: number;
  productTitle: string;
  unitPrice: Money;
  totalPrice: Money;
};

export type Cart = {
  id: string;
  totalQuantity: number;
  subtotal: Money;
  lines: CartLine[];
};

type CartLineNode = {
  id: string;
  quantity: number;
  cost: {amountPerQuantity: Money; totalAmount: Money};
  merchandise: {product?: {title: string}};
};

type CartNode = {
  id: string;
  totalQuantity: number;
  cost: {subtotalAmount: Money};
  lines: {nodes: CartLineNode[]};
};

type UserError = {message: string; code?: string | null};

// Shopify carts are small here (two products), so one page of lines is enough.
const CART_FIELDS = `
  fragment CartFields on Cart {
    id
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      nodes {
        id
        quantity
        cost {
          amountPerQuantity {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            product {
              title
            }
          }
        }
      }
    }
  }
`;

function toCart(node: CartNode): Cart {
  return {
    id: node.id,
    totalQuantity: node.totalQuantity,
    subtotal: node.cost.subtotalAmount,
    lines: node.lines.nodes.map((line) => ({
      id: line.id,
      quantity: line.quantity,
      productTitle: line.merchandise.product?.title ?? "",
      unitPrice: line.cost.amountPerQuantity,
      totalPrice: line.cost.totalAmount,
    })),
  };
}

// Mutations answer with a cart plus userErrors. Only error codes are surfaced, never the
// request values.
function readMutationCart(
  payload: {cart: CartNode | null; userErrors: UserError[]},
  operation: string,
): Cart {
  if (payload.userErrors.length > 0 || !payload.cart) {
    const codes = payload.userErrors
      .map((error) => error.code ?? "UNKNOWN")
      .join(", ");

    throw new ShopifyError(`${operation} failed (${codes || "no cart"}).`);
  }

  return toCart(payload.cart);
}

// Returns null when the cart no longer exists (expired or already checked out).
export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await requestShopifyStorefrontGraphQL<{cart: CartNode | null}>(
    `
      query Cart($cartId: ID!) {
        cart(id: $cartId) {
          ...CartFields
        }
      }
      ${CART_FIELDS}
    `,
    {cartId},
  );

  return data.cart ? toCart(data.cart) : null;
}

export async function createCart(
  variantId: string,
  quantity: number,
): Promise<Cart> {
  const data = await requestShopifyStorefrontGraphQL<{
    cartCreate: {cart: CartNode | null; userErrors: UserError[]};
  }>(
    `
      mutation CartCreate($lines: [CartLineInput!]!) {
        cartCreate(input: {lines: $lines}) {
          cart {
            ...CartFields
          }
          userErrors {
            message
            code
          }
        }
      }
      ${CART_FIELDS}
    `,
    {lines: [{merchandiseId: variantId, quantity}]},
  );

  return readMutationCart(data.cartCreate, "cartCreate");
}

export async function addCartLine(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<Cart> {
  const data = await requestShopifyStorefrontGraphQL<{
    cartLinesAdd: {cart: CartNode | null; userErrors: UserError[]};
  }>(
    `
      mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFields
          }
          userErrors {
            message
            code
          }
        }
      }
      ${CART_FIELDS}
    `,
    {cartId, lines: [{merchandiseId: variantId, quantity}]},
  );

  return readMutationCart(data.cartLinesAdd, "cartLinesAdd");
}

export async function updateCartLineQuantity(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<Cart> {
  const data = await requestShopifyStorefrontGraphQL<{
    cartLinesUpdate: {cart: CartNode | null; userErrors: UserError[]};
  }>(
    `
      mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFields
          }
          userErrors {
            message
            code
          }
        }
      }
      ${CART_FIELDS}
    `,
    {cartId, lines: [{id: lineId, quantity}]},
  );

  return readMutationCart(data.cartLinesUpdate, "cartLinesUpdate");
}

export async function removeCartLine(
  cartId: string,
  lineId: string,
): Promise<Cart> {
  const data = await requestShopifyStorefrontGraphQL<{
    cartLinesRemove: {cart: CartNode | null; userErrors: UserError[]};
  }>(
    `
      mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ...CartFields
          }
          userErrors {
            message
            code
          }
        }
      }
      ${CART_FIELDS}
    `,
    {cartId, lineIds: [lineId]},
  );

  return readMutationCart(data.cartLinesRemove, "cartLinesRemove");
}

export type CheckoutHandoff = {checkoutUrl: string; totalQuantity: number};

// Writes attributes onto the cart and returns where to send the buyer to pay. The checkout
// URL is deliberately not part of `Cart`: that object is passed to client components, and
// the URL must only reach the browser once consent has been verified on the server.
export async function setCartAttributesForCheckout(
  cartId: string,
  attributes: Record<string, string>,
): Promise<CheckoutHandoff> {
  const data = await requestShopifyStorefrontGraphQL<{
    cartAttributesUpdate: {
      cart: {checkoutUrl: string; totalQuantity: number} | null;
      userErrors: UserError[];
    };
  }>(
    `
      mutation CartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
        cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
          cart {
            checkoutUrl
            totalQuantity
          }
          userErrors {
            message
            code
          }
        }
      }
    `,
    {
      cartId,
      attributes: Object.entries(attributes).map(([key, value]) => ({
        key,
        value,
      })),
    },
  );
  const {cart, userErrors} = data.cartAttributesUpdate;

  if (userErrors.length > 0 || !cart) {
    const codes = userErrors.map((error) => error.code ?? "UNKNOWN").join(", ");

    throw new ShopifyError(`cartAttributesUpdate failed (${codes || "no cart"}).`);
  }

  return {checkoutUrl: cart.checkoutUrl, totalQuantity: cart.totalQuantity};
}
