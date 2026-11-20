export type CustomerSession = {
  accessToken: string;
  /** Null when Shopify issued none; the buyer then signs in again once the token expires. */
  refreshToken: string | null;
  /** Needed as `id_token_hint` to end the session on Shopify at logout. */
  idToken: string;
  /** Epoch milliseconds at which the access token stops working. */
  expiresAt: number;
};

// Messages are safe to log: error codes and HTTP statuses only, never tokens or personal data.
export class CustomerAccountError extends Error {}

// The access token was rejected. Callers send the buyer through /api/auth/refresh.
export class CustomerSessionExpiredError extends CustomerAccountError {}
