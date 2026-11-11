import "server-only";

import {ShopifyError} from "./admin-client";
import type {Money} from "./money";
import {requestShopifyStorefrontGraphQL} from "./storefront-client";

export type CartLine = {
  id: string;
  quantity: number;
  productTitle: string;
  productHandle: string;
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
  merchandise: {product?: {title: string; handle: string}};
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
              handle
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
      productHandle: line.merchandise.product?.handle ?? "",
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

export type CartAddress = {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
  countryCode: string;
};

// Everything the buyer-details and agreement steps need from a cart. Kept apart from
// `Cart` because that object is passed to client components and this one holds personal
// data that should stay on the server.
export type CartCheckoutContext = {
  /** True when any line is a physical product that needs a delivery address. */
  requiresShipping: boolean;
  buyer: {email: string | null; phone: string | null; countryCode: string | null};
  shippingAddress: CartAddress | null;
  /** Shopify's estimate; checkout can still change it. */
  total: Money;
  totalIsEstimated: boolean;
  /** The delivery option Shopify preselected for the address, with its estimated cost. */
  delivery: {title: string; cost: Money} | null;
};

type CheckoutContextNode = {
  buyerIdentity: {
    email: string | null;
    phone: string | null;
    countryCode: string | null;
  };
  cost: {totalAmount: Money; totalAmountEstimated: boolean};
  delivery: {
    addresses: {
      selected: boolean;
      address: {
        firstName?: string | null;
        lastName?: string | null;
        address1?: string | null;
        address2?: string | null;
        city?: string | null;
        zip?: string | null;
        countryCode?: string | null;
      };
    }[];
  };
  deliveryGroups: {
    nodes: {
      selectedDeliveryOption: {title: string; estimatedCost: Money} | null;
    }[];
  };
  shippable: {nodes: {merchandise: {requiresShipping?: boolean}}[]};
};

function toCheckoutContext(node: CheckoutContextNode): CartCheckoutContext {
  const selectedAddress =
    node.delivery.addresses.find((entry) => entry.selected)?.address ?? null;
  const selectedOption =
    node.deliveryGroups.nodes[0]?.selectedDeliveryOption ?? null;

  return {
    requiresShipping: node.shippable.nodes.some(
      (line) => line.merchandise.requiresShipping === true,
    ),
    buyer: node.buyerIdentity,
    shippingAddress: selectedAddress?.address1
      ? {
          firstName: selectedAddress.firstName ?? "",
          lastName: selectedAddress.lastName ?? "",
          address1: selectedAddress.address1,
          address2: selectedAddress.address2 ?? "",
          city: selectedAddress.city ?? "",
          zip: selectedAddress.zip ?? "",
          countryCode: selectedAddress.countryCode ?? "",
        }
      : null,
    total: node.cost.totalAmount,
    totalIsEstimated: node.cost.totalAmountEstimated,
    delivery: selectedOption
      ? {title: selectedOption.title, cost: selectedOption.estimatedCost}
      : null,
  };
}

// Same cart as `getCart`, plus the buyer, delivery and total data for the agreement.
// Returns null when the cart no longer exists.
export async function getCartWithCheckoutContext(
  cartId: string,
): Promise<{cart: Cart; context: CartCheckoutContext} | null> {
  const data = await requestShopifyStorefrontGraphQL<{
    cart: (CartNode & CheckoutContextNode) | null;
  }>(
    `
      query CartWithCheckoutContext($cartId: ID!) {
        cart(id: $cartId) {
          ...CartFields
          buyerIdentity {
            email
            phone
            countryCode
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            totalAmountEstimated
          }
          delivery {
            addresses {
              selected
              address {
                ... on CartDeliveryAddress {
                  firstName
                  lastName
                  address1
                  address2
                  city
                  zip
                  countryCode
                }
              }
            }
          }
          deliveryGroups(first: 1) {
            nodes {
              selectedDeliveryOption {
                title
                estimatedCost {
                  amount
                  currencyCode
                }
              }
            }
          }
          shippable: lines(first: 50) {
            nodes {
              merchandise {
                ... on ProductVariant {
                  requiresShipping
                }
              }
            }
          }
        }
      }
      ${CART_FIELDS}
    `,
    {cartId},
  );

  return data.cart
    ? {cart: toCart(data.cart), context: toCheckoutContext(data.cart)}
    : null;
}

export type CartBuyerInput = {
  email: string;
  phone: string;
  countryCode: string;
  /** null clears any delivery address (digital-only carts). */
  shippingAddress: CartAddress | null;
};

// Puts the buyer on the cart so Shopify's hosted checkout opens prefilled. Uses
// `cartBuyerIdentityUpdate` (email, phone, country) and `cartDeliveryAddressesReplace`
// (idempotent, unlike Add). Shopify has no billing-address field on a cart, so billing is
// never sent. Addresses are one-time use so nothing is saved to a customer account, and
// COUNTRY_CODE_ONLY because we do not collect a province; checkout validates fully.
export async function setCartBuyer(
  cartId: string,
  buyer: CartBuyerInput,
): Promise<void> {
  const identity = await requestShopifyStorefrontGraphQL<{
    cartBuyerIdentityUpdate: {userErrors: UserError[]};
  }>(
    `
      mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
        cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
          userErrors {
            message
            code
          }
        }
      }
    `,
    {
      cartId,
      buyerIdentity: {
        email: buyer.email,
        phone: buyer.phone,
        countryCode: buyer.countryCode,
      },
    },
  );

  assertNoUserErrors(identity.cartBuyerIdentityUpdate.userErrors, "cartBuyerIdentityUpdate");

  const delivery = await requestShopifyStorefrontGraphQL<{
    cartDeliveryAddressesReplace: {userErrors: UserError[]};
  }>(
    `
      mutation CartDeliveryAddressesReplace($cartId: ID!, $addresses: [CartSelectableAddressInput!]!) {
        cartDeliveryAddressesReplace(cartId: $cartId, addresses: $addresses) {
          userErrors {
            message
            code
          }
        }
      }
    `,
    {
      cartId,
      addresses: buyer.shippingAddress
        ? [
            {
              selected: true,
              oneTimeUse: true,
              validationStrategy: "COUNTRY_CODE_ONLY",
              address: {
                deliveryAddress: {
                  firstName: buyer.shippingAddress.firstName,
                  lastName: buyer.shippingAddress.lastName,
                  address1: buyer.shippingAddress.address1,
                  address2: buyer.shippingAddress.address2,
                  city: buyer.shippingAddress.city,
                  zip: buyer.shippingAddress.zip,
                  countryCode: buyer.shippingAddress.countryCode,
                  phone: buyer.phone,
                },
              },
            },
          ]
        : [],
    },
  );

  assertNoUserErrors(delivery.cartDeliveryAddressesReplace.userErrors, "cartDeliveryAddressesReplace");
}

// Only error codes are surfaced, never the submitted values.
function assertNoUserErrors(userErrors: UserError[], operation: string): void {
  if (userErrors.length > 0) {
    const codes = userErrors.map((error) => error.code ?? "UNKNOWN").join(", ");

    throw new ShopifyError(`${operation} failed (${codes}).`);
  }
}
