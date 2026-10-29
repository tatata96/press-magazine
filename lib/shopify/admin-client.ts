import "server-only";

// Server-only Shopify Admin API client. Uses the client credentials grant, which Shopify
// only offers when the app and the store belong to the same organization.
// https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant

const ADMIN_API_VERSION = "2026-07";
const MYSHOPIFY_DOMAIN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
// Refresh slightly early so a token never expires mid-request.
const EXPIRY_MARGIN_MS = 60_000;

type CachedToken = {accessToken: string; expiresAt: number};

let cachedToken: CachedToken | null = null;
let pendingToken: Promise<CachedToken> | null = null;

// Carries only safe, user-presentable detail: never credentials, tokens, or raw bodies.
export class ShopifyAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopifyAuthError";
  }
}

function readConfig() {
  const {SHOPIFY_STORE_DOMAIN, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET} = process.env;
  const missing = [
    ["SHOPIFY_STORE_DOMAIN", SHOPIFY_STORE_DOMAIN],
    ["SHOPIFY_CLIENT_ID", SHOPIFY_CLIENT_ID],
    ["SHOPIFY_CLIENT_SECRET", SHOPIFY_CLIENT_SECRET],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
    throw new ShopifyAuthError(`Missing environment variables: ${missing.join(", ")}.`);
  }

  const storeDomain = SHOPIFY_STORE_DOMAIN.trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  if (!MYSHOPIFY_DOMAIN.test(storeDomain)) {
    throw new ShopifyAuthError(
      "SHOPIFY_STORE_DOMAIN must be the store's <name>.myshopify.com domain.",
    );
  }

  return {storeDomain, clientId: SHOPIFY_CLIENT_ID, clientSecret: SHOPIFY_CLIENT_SECRET};
}

async function requestAccessToken(): Promise<CachedToken> {
  const {storeDomain, clientId, clientSecret} = readConfig();

  const response = await fetch(`https://${storeDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded", Accept: "application/json"},
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });

  const body: unknown = await response.json().catch(() => null);
  const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

  if (!response.ok) {
    // Only Shopify's short error code is surfaced; the description may echo request details.
    const code = typeof record.error === "string" ? record.error : "unknown_error";
    throw new ShopifyAuthError(`Token request failed (HTTP ${response.status}, error: ${code}).`);
  }

  const {access_token: accessToken, expires_in: expiresIn} = record;
  if (typeof accessToken !== "string" || typeof expiresIn !== "number") {
    throw new ShopifyAuthError("Token response was missing access_token or expires_in.");
  }

  return {accessToken, expiresAt: Date.now() + expiresIn * 1000};
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - EXPIRY_MARGIN_MS) {
    return cachedToken.accessToken;
  }

  // Share one in-flight request between concurrent callers.
  pendingToken ??= requestAccessToken()
    .then((token) => {
      cachedToken = token;
      return token;
    })
    .finally(() => {
      pendingToken = null;
    });

  return (await pendingToken).accessToken;
}

type GraphQLResponse<Data> = {data?: Data; errors?: {message: string}[]};

export async function adminGraphQL<Data>(query: string): Promise<Data> {
  const {storeDomain} = readConfig();
  const accessToken = await getAccessToken();

  const response = await fetch(
    `https://${storeDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {"Content-Type": "application/json", "X-Shopify-Access-Token": accessToken},
      body: JSON.stringify({query}),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new ShopifyAuthError(`Admin API request failed (HTTP ${response.status}).`);
  }

  const result = (await response.json()) as GraphQLResponse<Data>;
  if (result.errors?.length || !result.data) {
    const messages = result.errors?.map((error) => error.message).join("; ");
    throw new ShopifyAuthError(`Admin API returned errors: ${messages ?? "no data"}.`);
  }

  return result.data;
}
