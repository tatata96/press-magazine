import "server-only";

type HttpOnlyCookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
};

// Shared by every cookie that holds state the browser must not read or change.
// `secure` stays a parameter because the cookies currently disagree on it.
export function getHttpOnlyCookieOptions({
  maxAgeSeconds,
  secure,
}: {
  maxAgeSeconds: number;
  secure: boolean;
}): HttpOnlyCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
