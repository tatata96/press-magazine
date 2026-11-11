import "server-only";

import {createCipheriv, createDecipheriv, randomBytes} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const KEY_BYTES = 32;
// Ties a ciphertext to this use, so it cannot be replayed as another kind of cookie.
const ASSOCIATED_DATA = Buffer.from("press_buyer_details:v1");

export class BuyerCookieConfigError extends Error {}

function readKey(): Buffer {
  const key = Buffer.from(process.env.BUYER_COOKIE_SECRET ?? "", "base64");

  if (key.length !== KEY_BYTES) {
    throw new BuyerCookieConfigError(
      "BUYER_COOKIE_SECRET must be 32 random bytes, base64-encoded.",
    );
  }

  return key;
}

// AES-256-GCM: encrypted and tamper-evident. Output is iv.tag.ciphertext, base64url.
export function encryptJson(value: unknown): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, readKey(), iv);

  cipher.setAAD(ASSOCIATED_DATA);

  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);

  return [iv, cipher.getAuthTag(), ciphertext]
    .map((part) => part.toString("base64url"))
    .join(".");
}

// Returns null for anything that is not a valid, untampered value from encryptJson.
export function decryptJson(payload: string): unknown {
  const [iv, tag, ciphertext] = payload
    .split(".")
    .map((part) => Buffer.from(part, "base64url"));

  if (payload.split(".").length !== 3 || iv?.length !== IV_BYTES) {
    return null;
  }

  try {
    const decipher = createDecipheriv(ALGORITHM, readKey(), iv);

    decipher.setAAD(ASSOCIATED_DATA);
    decipher.setAuthTag(tag);

    return JSON.parse(
      Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8"),
    );
  } catch (error) {
    // A wrong or missing key is a deployment mistake and must not look like "no cookie".
    if (error instanceof BuyerCookieConfigError) {
      throw error;
    }

    return null;
  }
}
