import "server-only";

import {cacheLife} from "next/cache";
import type {Money} from "./money";
import {requestShopifyStorefrontGraphQL} from "./storefront-client";

// Maps each plan on the Subscribe page to its Shopify product. Both products have a
// single default variant, so the first variant is the one that gets purchased.
export const PLAN_PRODUCT_HANDLES = {
  digital: "press-digital",
  print: "press-print-digital",
} as const;

export type PlanId = keyof typeof PLAN_PRODUCT_HANDLES;

export type PlanProduct = {
  variantId: string;
  price: Money;
  availableForSale: boolean;
  /** Product's featured image in Shopify; null until one is uploaded. */
  imageUrl: string | null;
};

export type PlanProductsResult =
  | {status: "ok"; products: Record<PlanId, PlanProduct | null>}
  | {status: "error"};

type VariantNode = {
  id: string;
  availableForSale: boolean;
  price: Money;
};

type ProductNode = {
  featuredImage: {url: string} | null;
  variants: {nodes: VariantNode[]};
} | null;

type PlanProductsData = Record<PlanId, ProductNode>;

const PLAN_PRODUCTS_QUERY = `
  query PlanProducts($digital: String!, $print: String!) {
    digital: product(handle: $digital) {
      ...PlanProductFields
    }
    print: product(handle: $print) {
      ...PlanProductFields
    }
  }

  fragment PlanProductFields on Product {
    featuredImage {
      url
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        price {
          amount
          currencyCode
        }
      }
    }
  }
`;

function toPlanProduct(product: ProductNode): PlanProduct | null {
  const variant = product?.variants.nodes[0];

  if (!variant) {
    return null;
  }

  return {
    variantId: variant.id,
    price: variant.price,
    availableForSale: variant.availableForSale,
    imageUrl: product.featuredImage?.url ?? null,
  };
}

// Cached briefly so the Subscribe page can be prerendered. Prices shown here are for
// display only; the cart always carries Shopify's own prices and totals.
export async function getPlanProducts(): Promise<PlanProductsResult> {
  "use cache";

  try {
    const data = await requestShopifyStorefrontGraphQL<PlanProductsData>(
      PLAN_PRODUCTS_QUERY,
      {
        digital: PLAN_PRODUCT_HANDLES.digital,
        print: PLAN_PRODUCT_HANDLES.print,
      },
    );

    cacheLife("minutes");

    return {
      status: "ok",
      products: {
        digital: toPlanProduct(data.digital),
        print: toPlanProduct(data.print),
      },
    };
  } catch (error) {
    // A failure must not be pinned into the prerendered page, so it expires quickly.
    cacheLife("seconds");
    console.error(
      "Could not load plan products:",
      error instanceof Error ? error.message : "unknown error",
    );

    return {status: "error"};
  }
}
