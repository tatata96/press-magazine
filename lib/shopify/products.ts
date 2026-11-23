import "server-only";

import {cacheLife} from "next/cache";
import {
  CURRENT_TAG,
  loadPlanProducts,
  type PlanProductsData,
  type PlanProductsResult,
} from "./plan-products";
import {requestShopifyStorefrontGraphQL} from "./storefront-client";

export type {PlanId, PlanProduct, PlanProductsResult} from "./plan-products";

// The Storefront API only returns products published to the Headless channel. The tags are
// requested too so plan-products.ts can re-check them (the `query` search index is
// eventually consistent). 50 is far above the two products expected.
const PLAN_PRODUCTS_QUERY = `
  query PlanProducts($query: String!) {
    products(first: 50, query: $query) {
      nodes {
        tags
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
      pageInfo {
        hasNextPage
      }
    }
  }
`;

// Cached briefly so the Subscribe page can be prerendered and a change of the `current` tag
// in Shopify shows up within minutes. Prices shown here are for display only; the cart always
// carries Shopify's own prices and totals.
export async function getPlanProducts(): Promise<PlanProductsResult> {
  "use cache";

  const result = await loadPlanProducts(() =>
    requestShopifyStorefrontGraphQL<PlanProductsData>(PLAN_PRODUCTS_QUERY, {
      query: `tag:${CURRENT_TAG}`,
    }),
  );

  console.log("result", result);

  // A failure must not be pinned into the prerendered page, so it expires quickly.
  if (result.status === "ok") {
    cacheLife("minutes");
  } else {
    cacheLife("seconds");
  }

  return result;
}
