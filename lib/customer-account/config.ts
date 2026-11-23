import "server-only";

import {CustomerAccountError} from "./types";

export function readClientCredentials(): {clientId: string; clientSecret: string} {
  const {
    SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID: clientId,
    SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET: clientSecret,
  } = process.env;

  if (!clientId || !clientSecret) {
    throw new CustomerAccountError(
      "Missing environment variables: SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID, SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET.",
    );
  }

  return {clientId, clientSecret};
}

// The single source of the origin used for the OAuth redirect_uri and for redirects after
// login and logout. It deliberately has no fallback to the request or VERCEL_URL: those are
// deployment-specific hosts that Shopify has not registered, and a silent fallback turns a
// missing variable into a redirect_uri mismatch.
export function getOrigin(): string {
  const configured = process.env.APP_ORIGIN?.trim();

  if (!configured) {
    throw new CustomerAccountError(
      "Missing environment variable: APP_ORIGIN. Vercel applies variables only to deployments built after they were added.",
    );
  }

  try {
    const url = new URL(configured);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("unsupported protocol");
    }

    return url.origin;
  } catch {
    throw new CustomerAccountError("APP_ORIGIN must be an origin such as https://example.com.");
  }
}

export function getCallbackUrl(): string {
  return `${getOrigin()}/api/auth/callback`;
}
