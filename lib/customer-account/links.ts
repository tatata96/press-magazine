// Paths of the auth route handlers. Plain strings so server and client code share them; they
// are not locale-prefixed because the callback URL registered with Shopify must be fixed.

const DEFAULT_RETURN_TO = "/cart";
// Only the pages that need a signed-in customer, so the login flow cannot be used as an
// open redirect. Everything after the first segment is limited to URL-safe characters.
const RETURN_TO_PATTERN = /^\/(cart|account)([/?][A-Za-z0-9\-._~%/:@!$&'()*+,;=?]*)?$/;
const MAX_RETURN_TO_LENGTH = 300;

export function parseReturnTo(value: string | null | undefined): string {
  return value && value.length <= MAX_RETURN_TO_LENGTH && RETURN_TO_PATTERN.test(value)
    ? value
    : DEFAULT_RETURN_TO;
}

type AuthPathOptions = {locale: string; returnTo?: string};

export function getLoginPath({locale, returnTo = DEFAULT_RETURN_TO}: AuthPathOptions): string {
  return `/api/auth/login?${new URLSearchParams({locale, returnTo}).toString()}`;
}

export function getRefreshPath({locale, returnTo = DEFAULT_RETURN_TO}: AuthPathOptions): string {
  return `/api/auth/refresh?${new URLSearchParams({locale, returnTo}).toString()}`;
}
