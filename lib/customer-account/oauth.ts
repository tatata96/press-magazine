import "server-only";

import {readStoreDomain} from "@/lib/shopify/admin-client";
import {getCallbackUrl, readClientCredentials} from "./config";
import {CustomerAccountError, type CustomerSession} from "./types";

type Endpoints = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  endSessionEndpoint: string;
  graphqlApi: string;
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

function readJwtPayload(token: string): Record<string, unknown> {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"));
  } catch {
    return {};
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
  const idToken = typeof body.id_token === "string" ? body.id_token : "";

  // Binds the tokens to the login this browser started.
  if (readJwtPayload(idToken).nonce !== expectedNonce) {
    throw new CustomerAccountError("Token response nonce did not match.");
  }

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
