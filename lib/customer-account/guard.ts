import "server-only";

import {redirect} from "next/navigation";
import {getLoginPath, getRefreshPath} from "./links";
import {getSessionState} from "./session";
import {CustomerSessionExpiredError} from "./types";

type GuardOptions = {locale: string; returnTo: string};

// For pages that need a signed-in customer. Pages cannot set cookies, so a missing session
// goes to sign-in and an expired one to /api/auth/refresh; both come back to `returnTo`.
export async function requireAccessToken({locale, returnTo}: GuardOptions): Promise<string> {
  const session = await getSessionState();

  if (session.status === "signed_out") {
    redirect(getLoginPath({locale, returnTo}));
  }

  if (session.status === "expired") {
    redirect(getRefreshPath({locale, returnTo}));
  }

  return session.accessToken;
}

// Loads data as the customer. Returns null when it cannot be loaded, so the page can show its
// own message; a token Shopify rejects is renewed like an expired one.
export async function loadAsCustomer<Data>(
  options: GuardOptions,
  load: (accessToken: string) => Promise<Data>,
): Promise<Data | null> {
  const accessToken = await requireAccessToken(options);
  let isRejected = false;

  try {
    return await load(accessToken);
  } catch (error) {
    isRejected = error instanceof CustomerSessionExpiredError;

    if (!isRejected) {
      console.error(
        "Could not load account data:",
        error instanceof Error ? error.message : "unknown error",
      );
    }
  }

  if (isRejected) {
    redirect(getRefreshPath(options));
  }

  return null;
}
