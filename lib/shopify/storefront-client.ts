import "server-only";

import {readStoreDomain, ShopifyError} from "./admin-client";

// Server-only Storefront API client. The Headless channel's public token is still kept
// out of the browser so every Shopify call goes through our own server code.
// https://shopify.dev/docs/api/storefront/latest
const STOREFRONT_API_VERSION = "2026-07";

type GraphQLResponse<Data> = {data?: Data; errors?: {message: string}[]};

// Pass user-supplied values through `variables`; never interpolate them into `query`.
export async function requestShopifyStorefrontGraphQL<Data>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<Data> {
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!accessToken) {
    throw new ShopifyError(
      "Missing environment variables: SHOPIFY_STOREFRONT_ACCESS_TOKEN.",
    );
  }

  const response = await fetch(
    `https://${readStoreDomain()}/api/${STOREFRONT_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": accessToken,
      },
      body: JSON.stringify({query, variables}),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new ShopifyError(
      `Storefront API request failed (HTTP ${response.status}).`,
    );
  }

  const result = (await response.json()) as GraphQLResponse<Data>;

  if (result.errors?.length || !result.data) {
    const messages = result.errors?.map((error) => error.message).join("; ");

    throw new ShopifyError(
      `Storefront API returned errors: ${messages ?? "no data"}.`,
    );
  }

  return result.data;
}
