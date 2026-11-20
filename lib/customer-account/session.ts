import "server-only";

import {cookies} from "next/headers";
import {getHttpOnlyCookieOptions} from "@/lib/cookies/cookie-options";
import {openJson, sealJson} from "@/lib/cookies/seal";
import {CustomerAccountError, type CustomerSession} from "./types";

const SESSION_COOKIE = "press_customer_session";
const TRANSACTION_COOKIE = "press_auth_tx";
const SECRET_NAME = "CUSTOMER_SESSION_SECRET";
const TRANSACTION_MAX_AGE_SECONDS = 60 * 10;
// Bounds how long the browser keeps the cookie. The tokens inside decide whether it still works.
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
// Browsers drop cookies above ~4096 bytes without any error, which would look like a login loop.
const MAX_COOKIE_BYTES = 3800;
// Treat a token that is about to expire as expired, so a request never fails halfway.
const EXPIRY_MARGIN_MS = 60 * 1000;

export type LoginTransaction = {
  state: string;
  nonce: string;
  locale: string;
  returnTo: string;
};

export type SessionState =
  | {status: "signed_out"}
  | {status: "expired"}
  | {status: "active"; accessToken: string};

function cookieOptions(maxAgeSeconds: number) {
  return getHttpOnlyCookieOptions({
    maxAgeSeconds,
    secure: process.env.NODE_ENV === "production",
  });
}

async function readSealed(name: string): Promise<unknown> {
  const raw = (await cookies()).get(name)?.value;

  return raw ? openJson(raw, {secretName: SECRET_NAME, purpose: name}) : null;
}

async function writeSealed(name: string, value: unknown, maxAgeSeconds: number): Promise<void> {
  const sealed = sealJson(value, {secretName: SECRET_NAME, purpose: name});

  if (name.length + sealed.length > MAX_COOKIE_BYTES) {
    throw new CustomerAccountError("Value is too large to store in a cookie.");
  }

  (await cookies()).set(name, sealed, cookieOptions(maxAgeSeconds));
}

function isSession(value: unknown): value is CustomerSession {
  const session = value as Partial<CustomerSession> | null;

  return (
    typeof session?.accessToken === "string" &&
    typeof session.idToken === "string" &&
    typeof session.expiresAt === "number" &&
    (session.refreshToken === null || typeof session.refreshToken === "string")
  );
}

export async function readSession(): Promise<CustomerSession | null> {
  const value = await readSealed(SESSION_COOKIE);

  return isSession(value) ? value : null;
}

// Read-only, so Server Components can use it. Renewing a session needs to set a cookie, which
// only a Route Handler or Server Action may do; callers send "expired" through /api/auth/refresh.
export async function getSessionState(): Promise<SessionState> {
  const session = await readSession();

  if (!session) {
    return {status: "signed_out"};
  }

  return session.expiresAt - Date.now() > EXPIRY_MARGIN_MS
    ? {status: "active", accessToken: session.accessToken}
    : {status: "expired"};
}

// Whether the stored session still has time left, used to detect a refresh that did not help.
export function hasUsableLifetime(session: CustomerSession): boolean {
  return session.expiresAt - Date.now() > EXPIRY_MARGIN_MS;
}

export async function writeSession(session: CustomerSession): Promise<void> {
  await writeSealed(SESSION_COOKIE, session, SESSION_MAX_AGE_SECONDS);
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function writeLoginTransaction(transaction: LoginTransaction): Promise<void> {
  await writeSealed(TRANSACTION_COOKIE, transaction, TRANSACTION_MAX_AGE_SECONDS);
}

export async function readLoginTransaction(): Promise<LoginTransaction | null> {
  const value = (await readSealed(TRANSACTION_COOKIE)) as Partial<LoginTransaction> | null;

  return typeof value?.state === "string" &&
    typeof value.nonce === "string" &&
    typeof value.locale === "string" &&
    typeof value.returnTo === "string"
    ? (value as LoginTransaction)
    : null;
}

export async function clearLoginTransaction(): Promise<void> {
  (await cookies()).delete(TRANSACTION_COOKIE);
}
