import "server-only";

// THROWAWAY SPIKE (Phase 0). Answers: does Shopify checkout recognise the signed-in customer,
// what gets prefilled, does the cart survive login, do tokens fit in a cookie. Phase 1 replaces
// this with proper modules. Every route using it answers 404 unless AUTH_SPIKE_ENABLED=true,
// and the checkout step deliberately skips our legal consent gate, so never enable it in production.

import {createCipheriv, createDecipheriv, randomBytes} from "node:crypto";
import {cookies} from "next/headers";
import {connection} from "next/server";
import {hasLocale} from "next-intl";
import {routing} from "@/i18n/routing";
import {getHttpOnlyCookieOptions} from "@/lib/cookies/cookie-options";
import {SITE_URL} from "@/lib/seo";
import {readCartId} from "@/lib/cookies/cart-cookie";
import {getCart} from "@/lib/shopify/cart";
import {readStoreDomain} from "@/lib/shopify/admin-client";
import {requestShopifyStorefrontGraphQL} from "@/lib/shopify/storefront-client";

const TRANSACTION_COOKIE = "press_auth_tx";
const SESSION_COOKIE = "press_customer_session";
const TRANSACTION_MAX_AGE_SECONDS = 60 * 10;
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
const COOKIE_VALUE_LIMIT_BYTES = 4096;

type Transaction = {state: string; nonce: string; locale: string; returnTo: string};

type Session = {
  accessToken: string;
  refreshToken: string | null;
  idToken: string;
  expiresAt: number;
};

// Messages are written to be safe to show: error codes and HTTP statuses only, never values.
export class SpikeError extends Error {}

function isProductionHost(origin: string | undefined): boolean {
  try {
    const bareHost = (value: string) => new URL(value).host.replace(/^www\./, "");

    return Boolean(origin) && bareHost(origin as string) === bareHost(SITE_URL);
  } catch {
    return false;
  }
}

// Three independent locks, all of which must pass, so a leaked flag cannot expose the routes:
// the flag itself, a runtime that is not production, and an origin that is not the live site.
export function isSpikeEnabled(): boolean {
  if (process.env.AUTH_SPIKE_ENABLED !== "true") {
    return false;
  }

  // Vercel production deployments never run it, whatever the flag says.
  if (process.env.VERCEL_ENV === "production") {
    return false;
  }

  // Elsewhere only a development server or a Vercel preview may run it, so a self-hosted
  // production build (NODE_ENV=production without VERCEL_ENV=preview) stays closed.
  const isSafeRuntime =
    process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";

  return isSafeRuntime && !isProductionHost(process.env.APP_ORIGIN);
}

export async function handleSpike(run: () => Promise<Response>): Promise<Response> {
  // With Cache Components a GET handler is prerendered at build time unless it reads
  // request-time data. This runs before the flag check, so a disabled build does not bake
  // the 404 in and the flag is read on every request.
  await connection();

  if (!isSpikeEnabled()) {
    return new Response(null, {status: 404});
  }

  try {
    return await run();
  } catch (error) {
    const message = error instanceof SpikeError ? error.message : "Unexpected error.";

    console.error("Auth spike failed:", message);

    return Response.json({ok: false, error: message}, {status: 500});
  }
}

// The redirect URI must match a registered callback exactly, so it comes from configuration
// and not from the incoming request, which can differ behind a proxy.
export function getOrigin(request: Request): string {
  return process.env.APP_ORIGIN?.trim().replace(/\/+$/, "") || new URL(request.url).origin;
}

function readConfig() {
  const {
    SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID: clientId,
    SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET: clientSecret,
    CUSTOMER_SESSION_SECRET: sessionSecret,
  } = process.env;

  if (!clientId || !clientSecret || !sessionSecret) {
    throw new SpikeError("Missing customer account environment variables.");
  }

  const key = Buffer.from(sessionSecret, "base64");

  if (key.length !== 32) {
    throw new SpikeError("CUSTOMER_SESSION_SECRET must be 32 random bytes, base64-encoded.");
  }

  return {clientId, clientSecret, key};
}

// AES-256-GCM, same shape as the buyer cookie: iv.tag.ciphertext in base64url.
function seal(value: unknown, purpose: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", readConfig().key, iv);

  cipher.setAAD(Buffer.from(purpose));

  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);

  return [iv, cipher.getAuthTag(), ciphertext]
    .map((part) => part.toString("base64url"))
    .join(".");
}

function open<Value>(payload: string, purpose: string): Value | null {
  const parts = payload.split(".");
  const {key} = readConfig();

  if (parts.length !== 3) {
    return null;
  }

  const [iv, tag, ciphertext] = parts.map((part) => Buffer.from(part, "base64url"));

  try {
    const decipher = createDecipheriv("aes-256-gcm", key, iv);

    decipher.setAAD(Buffer.from(purpose));
    decipher.setAuthTag(tag);

    return JSON.parse(
      Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8"),
    ) as Value;
  } catch {
    return null;
  }
}

async function writeSealedCookie(
  name: string,
  value: unknown,
  maxAgeSeconds: number,
): Promise<void> {
  (await cookies()).set(
    name,
    seal(value, name),
    getHttpOnlyCookieOptions({
      maxAgeSeconds,
      secure: process.env.NODE_ENV === "production",
    }),
  );
}

async function readSealedCookie<Value>(name: string): Promise<Value | null> {
  const raw = (await cookies()).get(name)?.value;

  return raw ? open<Value>(raw, name) : null;
}

type Discovery = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  endSessionEndpoint: string;
  graphqlApi: string;
};

async function fetchJson(url: string): Promise<Record<string, unknown>> {
  const response = await fetch(url, {cache: "no-store"});

  if (!response.ok) {
    throw new SpikeError(`Discovery request failed (HTTP ${response.status}).`);
  }

  return (await response.json()) as Record<string, unknown>;
}

function requireString(source: Record<string, unknown>, key: string): string {
  const value = source[key];

  if (typeof value !== "string") {
    throw new SpikeError(`Discovery response has no ${key}.`);
  }

  return value;
}

async function discover(): Promise<Discovery> {
  const host = `https://${readStoreDomain()}`;
  const [openId, account] = await Promise.all([
    fetchJson(`${host}/.well-known/openid-configuration`),
    fetchJson(`${host}/.well-known/customer-account-api`),
  ]);

  return {
    authorizationEndpoint: requireString(openId, "authorization_endpoint"),
    tokenEndpoint: requireString(openId, "token_endpoint"),
    endSessionEndpoint: requireString(openId, "end_session_endpoint"),
    graphqlApi: requireString(account, "graphql_api"),
  };
}

function parseLocale(value: string | null): string {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}

// Only same-site paths, so the login flow cannot be used as an open redirect.
function parseReturnTo(value: string | null): string {
  return value && /^\/[a-z0-9\-/]*$/i.test(value) && !value.startsWith("//")
    ? value
    : "/cart";
}

export async function startLogin(request: Request): Promise<string> {
  const {clientId} = readConfig();
  const {searchParams} = new URL(request.url);
  const transaction: Transaction = {
    state: randomBytes(16).toString("base64url"),
    nonce: randomBytes(16).toString("base64url"),
    locale: parseLocale(searchParams.get("locale")),
    returnTo: parseReturnTo(searchParams.get("returnTo")),
  };
  const {authorizationEndpoint} = await discover();
  const url = new URL(authorizationEndpoint);

  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", `${getOrigin(request)}/api/auth/callback`);
  url.searchParams.set("state", transaction.state);
  url.searchParams.set("nonce", transaction.nonce);
  // Sets the language of Shopify's hosted login screen.
  url.searchParams.set("locale", transaction.locale);

  await writeSealedCookie(TRANSACTION_COOKIE, transaction, TRANSACTION_MAX_AGE_SECONDS);

  return url.toString();
}

function readJwtPayload(token: string): Record<string, unknown> {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"));
  } catch {
    return {};
  }
}

// Returns the path to send the browser to once the session cookie is written.
export async function finishLogin(request: Request): Promise<string> {
  const {searchParams} = new URL(request.url);
  const providerError = searchParams.get("error");

  if (providerError) {
    throw new SpikeError(`Shopify returned an error: ${providerError.slice(0, 60)}.`);
  }

  const transaction = await readSealedCookie<Transaction>(TRANSACTION_COOKIE);
  const code = searchParams.get("code");

  if (!transaction || !code || searchParams.get("state") !== transaction.state) {
    throw new SpikeError("Login state did not match. Start again from /api/auth/login.");
  }

  const {clientId, clientSecret} = readConfig();
  const {tokenEndpoint} = await discover();
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // Confidential clients authenticate with the secret in the Authorization header.
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: `${getOrigin(request)}/api/auth/callback`,
      code,
    }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const reason = typeof body.error === "string" ? body.error.slice(0, 60) : "unknown";

    throw new SpikeError(`Token exchange failed (HTTP ${response.status}, ${reason}).`);
  }

  const idToken = typeof body.id_token === "string" ? body.id_token : "";

  if (typeof body.access_token !== "string" || readJwtPayload(idToken).nonce !== transaction.nonce) {
    throw new SpikeError("Token response was incomplete or the nonce did not match.");
  }

  const expiresIn = typeof body.expires_in === "number" ? body.expires_in : 0;

  await writeSealedCookie(
    SESSION_COOKIE,
    {
      accessToken: body.access_token,
      refreshToken: typeof body.refresh_token === "string" ? body.refresh_token : null,
      idToken,
      expiresAt: Date.now() + expiresIn * 1000,
    } satisfies Session,
    SESSION_MAX_AGE_SECONDS,
  );
  (await cookies()).delete(TRANSACTION_COOKIE);

  return `${getOrigin(request)}/${transaction.locale}${transaction.returnTo}`;
}

// Returns the URL that ends the session on Shopify, which then redirects to the origin.
export async function startLogout(request: Request): Promise<string> {
  const session = await readSealedCookie<Session>(SESSION_COOKIE);

  (await cookies()).delete(SESSION_COOKIE);

  if (!session) {
    return `${getOrigin(request)}/`;
  }

  const {endSessionEndpoint} = await discover();
  const url = new URL(endSessionEndpoint);

  url.searchParams.set("id_token_hint", session.idToken);
  url.searchParams.set("post_logout_redirect_uri", `${getOrigin(request)}/`);

  return url.toString();
}

type CustomerSummary = {
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    emailAddress: {emailAddress: string} | null;
    phoneNumber: {phoneNumber: string} | null;
    defaultAddress: {territoryCode: string | null} | null;
    addresses: {nodes: {id: string}[]};
  };
};

async function fetchCustomer(accessToken: string): Promise<CustomerSummary["customer"]> {
  const {graphqlApi} = await discover();
  const response = await fetch(graphqlApi, {
    method: "POST",
    headers: {"Content-Type": "application/json", Authorization: accessToken},
    body: JSON.stringify({
      query: `
        query SpikeCustomer {
          customer {
            id
            firstName
            lastName
            emailAddress { emailAddress }
            phoneNumber { phoneNumber }
            defaultAddress { id address1 city zip territoryCode }
            addresses(first: 10) { nodes { id } }
          }
        }
      `,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new SpikeError(`Customer Account API request failed (HTTP ${response.status}).`);
  }

  const result = (await response.json()) as {data?: CustomerSummary; errors?: unknown[]};

  if (!result.data?.customer) {
    throw new SpikeError("Customer Account API returned no customer.");
  }

  return result.data.customer;
}

// Read-only report: answers the cookie-size, token-shape, saved-data and cart questions
// without exposing any value (only presence, counts and sizes).
export async function describeSession() {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = raw ? open<Session>(raw, SESSION_COOKIE) : null;
  const cartId = await readCartId();
  const cart = cartId ? await getCart(cartId) : null;
  const cartReport = {
    cookiePresent: Boolean(cartId),
    existsOnShopify: Boolean(cart),
    lineCount: cart?.lines.length ?? 0,
  };

  if (!session) {
    return {signedIn: false, cart: cartReport};
  }

  const customer = await fetchCustomer(session.accessToken);
  const cookieBytes = SESSION_COOKIE.length + 1 + (raw?.length ?? 0);

  return {
    signedIn: true,
    cookie: {
      nameAndValueBytes: cookieBytes,
      limitBytes: COOKIE_VALUE_LIMIT_BYTES,
      fits: cookieBytes <= COOKIE_VALUE_LIMIT_BYTES,
      tokenChars: {
        access: session.accessToken.length,
        refresh: session.refreshToken?.length ?? 0,
        id: session.idToken.length,
      },
    },
    tokens: {
      hasRefreshToken: session.refreshToken !== null,
      accessExpiresInSeconds: Math.round((session.expiresAt - Date.now()) / 1000),
    },
    customer: {
      hasFirstName: Boolean(customer.firstName),
      hasLastName: Boolean(customer.lastName),
      hasEmail: Boolean(customer.emailAddress?.emailAddress),
      hasPhone: Boolean(customer.phoneNumber?.phoneNumber),
      hasDefaultAddress: Boolean(customer.defaultAddress),
      defaultAddressCountry: customer.defaultAddress?.territoryCode ?? null,
      savedAddressCount: customer.addresses.nodes.length,
    },
    cart: cartReport,
  };
}

// Attaches the signed-in customer to the existing cart and returns Shopify's checkout URL.
// Skips the legal consent gate on purpose: this only exists to observe Shopify's checkout.
export async function associateCartWithCustomer(): Promise<string> {
  const session = await readSealedCookie<Session>(SESSION_COOKIE);
  const cartId = await readCartId();

  if (!session || !cartId) {
    throw new SpikeError("Need a signed-in session and a cart. Add an item first.");
  }

  const data = await requestShopifyStorefrontGraphQL<{
    cartBuyerIdentityUpdate: {
      cart: {checkoutUrl: string} | null;
      userErrors: {code: string | null}[];
    };
  }>(
    `
      mutation SpikeAssociate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
        cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
          cart {
            checkoutUrl
            buyerIdentity { customer { id } }
          }
          userErrors { code message }
        }
      }
    `,
    {cartId, buyerIdentity: {customerAccessToken: session.accessToken}},
  );
  const {cart, userErrors} = data.cartBuyerIdentityUpdate;

  if (userErrors.length > 0 || !cart) {
    const codes = userErrors.map((error) => error.code ?? "UNKNOWN").join(", ");

    throw new SpikeError(`cartBuyerIdentityUpdate failed (${codes || "no cart"}).`);
  }

  return cart.checkoutUrl;
}
