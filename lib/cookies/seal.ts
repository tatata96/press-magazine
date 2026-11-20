import "server-only";

import {createCipheriv, createDecipheriv, randomBytes} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const KEY_BYTES = 32;

// A wrong or missing key is a deployment mistake and must not look like "no cookie".
export class SealConfigError extends Error {}

type SealOptions = {
  /** Name of the environment variable holding 32 random bytes, base64-encoded. */
  secretName: string;
  /** Ties a ciphertext to one use (usually the cookie name), so it cannot be replayed as another. */
  purpose: string;
};

function readKey(secretName: string): Buffer {
  const key = Buffer.from(process.env[secretName] ?? "", "base64");

  if (key.length !== KEY_BYTES) {
    throw new SealConfigError(`${secretName} must be 32 random bytes, base64-encoded.`);
  }

  return key;
}

// AES-256-GCM: encrypted and tamper-evident. Output is iv.tag.ciphertext, base64url.
export function sealJson(value: unknown, {secretName, purpose}: SealOptions): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, readKey(secretName), iv);

  cipher.setAAD(Buffer.from(purpose));

  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);

  return [iv, cipher.getAuthTag(), ciphertext]
    .map((part) => part.toString("base64url"))
    .join(".");
}

// Returns null for anything that is not a valid, untampered value from sealJson.
export function openJson(payload: string, {secretName, purpose}: SealOptions): unknown {
  const key = readKey(secretName);
  const parts = payload.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [iv, tag, ciphertext] = parts.map((part) => Buffer.from(part, "base64url"));

  if (iv.length !== IV_BYTES) {
    return null;
  }

  try {
    const decipher = createDecipheriv(ALGORITHM, key, iv);

    decipher.setAAD(Buffer.from(purpose));
    decipher.setAuthTag(tag);

    return JSON.parse(
      Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8"),
    );
  } catch {
    return null;
  }
}
