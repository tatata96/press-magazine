import "server-only";

import {createRemoteJWKSet} from "jose";
import type {JWTVerifyGetKey} from "jose";
import {readStoreDomain} from "@/lib/shopify/admin-client";
import {getCallbackUrl, readClientCredentials} from "./config";
import {IdTokenError, readSubject, selectSigningAlgorithms, verifyIdToken} from "./id-token";
import {CustomerAccountError, type CustomerSession} from "./types";

type Endpoints = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  endSessionEndpoint: string;
  graphqlApi: string;
  /** The `iss` every ID token must carry. */
  issuer: string;
  /** Where the provider publishes the public keys its ID tokens are signed with. */
  jwksUri: string;
  /** The signing algorithms ID tokens may use. */
  idTokenAlgorithms: string[];
};

// Endpoints change rarely; a few minutes of reuse saves two requests on most calls.
const ENDPOINT_CACHE_MS = 5 * 60 * 1000;
let cachedEndpoints: {endpoints: Endpoints; fetchedAt: number} | null = null;

async function fetchJson(url: string): Promise<Record<string, unknown>> {
  const response = await fetch(url, {cache: "no-store"});

  if (!response.ok) {
    throw new CustomerAccountError(`Discovery request failed (HTTP ${response.status}).`);
  }

  return (await response.json()) as Record<string, unknown>;
}

function requireString(source: Record<string, unknown>, key: string): string {
  const value = source[key];

  if (typeof value !== "string") {
    throw new CustomerAccountError(`Discovery response has no ${key}.`);
  }

  return value;
}

function requireHttpsUrl(source: Record<string, unknown>, key: string): string {
  const value = requireString(source, key);

  // Keys fetched over plain HTTP could be swapped on the way.
  if (new URL(value).protocol !== "https:") {
    throw new CustomerAccountError(`Discovery response ${key} is not an https URL.`);
  }

  return value;
}

function readSigningAlgorithms(openId: Record<string, unknown>): string[] {
  try {
    return selectSigningAlgorithms(openId.id_token_signing_alg_values_supported);
  } catch (error) {
    throw new CustomerAccountError(error instanceof Error ? error.message : "Discovery failed.");
  }
}

// Shopify documents discovery as the way to find these URLs, so none are hardcoded.
export async function discoverEndpoints(): Promise<Endpoints> {
  if (cachedEndpoints && Date.now() - cachedEndpoints.fetchedAt < ENDPOINT_CACHE_MS) {
    return cachedEndpoints.endpoints;
  }

  const host = `https://${readStoreDomain()}`;
  const [openId, account] = await Promise.all([
    fetchJson(`${host}/.well-known/openid-configuration`),
    fetchJson(`${host}/.well-known/customer-account-api`),
  ]);
  const endpoints: Endpoints = {
    authorizationEndpoint: requireString(openId, "authorization_endpoint"),
    tokenEndpoint: requireString(openId, "token_endpoint"),
    endSessionEndpoint: requireString(openId, "end_session_endpoint"),
    graphqlApi: requireString(account, "graphql_api"),
    issuer: requireString(openId, "issuer"),
    jwksUri: requireHttpsUrl(openId, "jwks_uri"),
    idTokenAlgorithms: readSigningAlgorithms(openId),
  };

  cachedEndpoints = {endpoints, fetchedAt: Date.now()};

  return endpoints;
}

export async function buildAuthorizationUrl(params: {
  state: string;
  nonce: string;
  locale: string;
}): Promise<string> {
  const {clientId} = readClientCredentials();
  const {authorizationEndpoint} = await discoverEndpoints();
  const url = new URL(authorizationEndpoint);

  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", getCallbackUrl());
  url.searchParams.set("state", params.state);
  url.searchParams.set("nonce", params.nonce);
  // Language of Shopify's hosted login screen.
  url.searchParams.set("locale", params.locale);

  return url.toString();
}

async function requestTokens(params: Record<string, string>): Promise<Record<string, unknown>> {
  const {clientId, clientSecret} = readClientCredentials();
  const {tokenEndpoint} = await discoverEndpoints();
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // Confidential clients authenticate with the secret in the Authorization header.
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({client_id: clientId, ...params}),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const reason = typeof body.error === "string" ? body.error.slice(0, 60) : "unknown";

    throw new CustomerAccountError(`Token request failed (HTTP ${response.status}, ${reason}).`);
  }

  return body;
}

// One key set per URL, so the keys are fetched once and reused. jose re-fetches when a token
// names a key it does not have yet (a rotation), at most once per cooldown.
const keySets = new Map<string, JWTVerifyGetKey>();

function getKeySet(jwksUri: string): JWTVerifyGetKey {
  let keySet = keySets.get(jwksUri);

  if (!keySet) {
    keySet = createRemoteJWKSet(new URL(jwksUri), {
      timeoutDuration: 5_000,
      cooldownDuration: 30_000,
      cacheMaxAge: 10 * 60 * 1000,
    });
    keySets.set(jwksUri, keySet);
  }

  return keySet;
}

// Verifies an ID token against Shopify's published keys and the claims OpenID Connect requires.
// Any failure throws, so no session is created from an unverified token.
async function verifyShopifyIdToken(
  idToken: unknown,
  binding: {nonce: string} | {subject: string},
): Promise<void> {
  const {clientId} = readClientCredentials();
  const {issuer, jwksUri, idTokenAlgorithms} = await discoverEndpoints();

  try {
    await verifyIdToken(idToken, {
      issuer,
      audience: clientId,
      algorithms: idTokenAlgorithms,
      keys: getKeySet(jwksUri),
      ...binding,
    });
  } catch (error) {
    throw new CustomerAccountError(
      error instanceof IdTokenError ? error.message : "ID token could not be verified.",
    );
  }
}

function toSession(
  body: Record<string, unknown>,
  previous?: Pick<CustomerSession, "refreshToken" | "idToken">,
): CustomerSession {
  if (typeof body.access_token !== "string") {
    throw new CustomerAccountError("Token response has no access token.");
  }

  const expiresIn = typeof body.expires_in === "number" ? body.expires_in : 0;

  return {
    accessToken: body.access_token,
    // A refresh response may omit these; the previous values stay valid.
    refreshToken:
      typeof body.refresh_token === "string" ? body.refresh_token : previous?.refreshToken ?? null,
    idToken: typeof body.id_token === "string" ? body.id_token : previous?.idToken ?? "",
    expiresAt: Date.now() + expiresIn * 1000,
  };
}

export async function exchangeAuthorizationCode(
  code: string,
  expectedNonce: string,
): Promise<CustomerSession> {
  const body = await requestTokens({
    grant_type: "authorization_code",
    redirect_uri: getCallbackUrl(),
    code,
  });

  // Verified before anything is stored. The nonce binds the tokens to the login this browser
  // started.
  await verifyShopifyIdToken(body.id_token, {nonce: expectedNonce});

  return toSession(body);
}

export async function refreshSession(session: CustomerSession): Promise<CustomerSession> {
  if (!session.refreshToken) {
    throw new CustomerAccountError("Session has no refresh token.");
  }

  const body = await requestTokens({
    grant_type: "refresh_token",
    refresh_token: session.refreshToken,
  });

  // A refresh may return a new ID token (OpenID Connect Core 12.2). There is no nonce to check,
  // since none was sent, so it is bound to the original sign-in by its subject instead. Without
  // one, the ID token from sign-in is kept, as it is only used to end the session at logout.
  if (body.id_token !== undefined) {
    const subject = readSubject(session.idToken);

    if (!subject) {
      throw new CustomerAccountError("The stored ID token has no subject to compare against.");
    }

    await verifyShopifyIdToken(body.id_token, {subject});
  }

  return toSession(body, session);
}

// The URL that ends the buyer's session on Shopify; Shopify then redirects to the logout URI.
export async function buildEndSessionUrl(idToken: string): Promise<string> {
  const {endSessionEndpoint} = await discoverEndpoints();
  const url = new URL(endSessionEndpoint);

  url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("post_logout_redirect_uri", `${new URL(getCallbackUrl()).origin}/`);

  return url.toString();
}
