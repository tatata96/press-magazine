import {decodeJwt, decodeProtectedHeader, errors, jwtVerify} from "jose";
import type {JWTVerifyGetKey} from "jose";

// No imports besides `jose` on purpose: this is the sign-in's security check, and it is covered
// by tests/id-token.test.mjs, which loads it directly.

// OpenID Connect Core 3.1.3.7 (ID Token validation) and 12.2 (ID Token after a refresh).

// A token that fails any check is rejected with this. The message carries a code and the name
// of the failing claim, never the token or its contents, so it is safe to log.
export class IdTokenError extends Error {}

// Seconds of clock drift tolerated between Shopify and this server.
const CLOCK_TOLERANCE_SECONDS = 60;

// Asymmetric signature algorithms only. "none" would accept an unsigned token, and the HMAC
// family would let anyone who knows a public key forge a token ("algorithm confusion").
const ACCEPTED_ALGORITHMS = [
  "RS256",
  "RS384",
  "RS512",
  "PS256",
  "PS384",
  "PS512",
  "ES256",
  "ES384",
  "ES512",
  "EdDSA",
];

// The algorithms to accept: what the provider's discovery document says it signs with, narrowed
// to the list above. A document that names none defaults to RS256, as OpenID Connect Discovery
// specifies.
export function selectSigningAlgorithms(advertised: unknown): string[] {
  const names =
    advertised === undefined
      ? ["RS256"]
      : Array.isArray(advertised)
        ? advertised.filter((name): name is string => typeof name === "string")
        : [];
  const accepted = names.filter((name) => ACCEPTED_ALGORITHMS.includes(name));

  if (accepted.length === 0) {
    throw new IdTokenError("Provider advertises no acceptable ID token signing algorithm.");
  }

  return accepted;
}

export type IdTokenExpectations = {
  /** From the provider's discovery document. */
  issuer: string;
  /** This application's client id. */
  audience: string;
  /** See selectSigningAlgorithms. */
  algorithms: string[];
  /** Verification keys, normally the provider's JWKS. */
  keys: JWTVerifyGetKey;
  /** Sign-in: the nonce sent with the authorization request, which the token must echo. */
  nonce?: string;
  /** Refresh: the subject of the ID token from sign-in, which the new one must keep. */
  subject?: string;
  /** For tests. */
  now?: Date;
};

export type IdTokenClaims = {sub: string; nonce?: string};

function rejection(error: unknown): IdTokenError {
  if (error instanceof IdTokenError) {
    return error;
  }

  if (error instanceof errors.JWTClaimValidationFailed) {
    return new IdTokenError(`ID token rejected (${error.code}: ${error.claim}).`);
  }

  if (error instanceof errors.JOSEError) {
    return new IdTokenError(`ID token rejected (${error.code}).`);
  }

  return new IdTokenError("ID token could not be verified.");
}

export async function verifyIdToken(
  token: unknown,
  expected: IdTokenExpectations,
): Promise<IdTokenClaims> {
  if (typeof token !== "string" || token === "") {
    throw new IdTokenError("ID token is missing.");
  }

  if (token.split(".").length !== 3) {
    throw new IdTokenError("ID token is malformed.");
  }

  const now = expected.now ?? new Date();

  try {
    decodeProtectedHeader(token);

    // jose checks the signature against the keys, the algorithm against the allow-list, and
    // iss, aud, exp and nbf. It rejects "none" because it is not in the list.
    const {payload} = await jwtVerify(token, expected.keys, {
      issuer: expected.issuer,
      audience: expected.audience,
      algorithms: expected.algorithms,
      requiredClaims: ["iss", "sub", "aud", "exp", "iat"],
      clockTolerance: CLOCK_TOLERANCE_SECONDS,
      currentDate: now,
    });
    const nowSeconds = Math.floor(now.getTime() / 1000);

    // jose only checks iat when asked for a maximum age, so a token "issued in the future" is
    // refused here.
    if (typeof payload.iat !== "number" || payload.iat > nowSeconds + CLOCK_TOLERANCE_SECONDS) {
      throw new IdTokenError("ID token rejected (iat).");
    }

    // OpenID Connect Core 3.1.3.7 (item 3 and 4): with several audiences, the client must be
    // the authorized party.
    if (Array.isArray(payload.aud) && payload.aud.length > 1 && payload.azp !== expected.audience) {
      throw new IdTokenError("ID token rejected (azp).");
    }

    if (typeof payload.sub !== "string" || payload.sub === "") {
      throw new IdTokenError("ID token rejected (sub).");
    }

    if (expected.subject !== undefined && payload.sub !== expected.subject) {
      throw new IdTokenError("ID token rejected (sub changed).");
    }

    if (expected.nonce !== undefined && payload.nonce !== expected.nonce) {
      throw new IdTokenError("ID token rejected (nonce).");
    }

    return {
      sub: payload.sub,
      nonce: typeof payload.nonce === "string" ? payload.nonce : undefined,
    };
  } catch (error) {
    throw rejection(error);
  }
}

// Reads the subject of a token that was verified when it was stored (the session cookie is
// encrypted and authenticated). Used to bind a refreshed ID token to the original sign-in.
export function readSubject(verifiedToken: string): string | null {
  try {
    const {sub} = decodeJwt(verifiedToken);

    return typeof sub === "string" && sub !== "" ? sub : null;
  } catch {
    return null;
  }
}
