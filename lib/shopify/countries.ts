import "server-only";

import {cacheLife} from "next/cache";
import {requestShopifyStorefrontGraphQL} from "./storefront-client";

// Countries the store can sell to (its Markets). Returns null when Shopify cannot be
// reached, so callers can tell "unknown" from "no countries".
export async function getSellingCountryCodes(): Promise<string[] | null> {
  "use cache";

  try {
    const data = await requestShopifyStorefrontGraphQL<{
      localization: {availableCountries: {isoCode: string}[]};
    }>(`
      query SellingCountries {
        localization {
          availableCountries {
            isoCode
          }
        }
      }
    `);

    cacheLife("hours");

    return data.localization.availableCountries.map((country) => country.isoCode);
  } catch (error) {
    cacheLife("seconds");
    console.error(
      "Could not load selling countries:",
      error instanceof Error ? error.message : "unknown error",
    );

    return null;
  }
}
