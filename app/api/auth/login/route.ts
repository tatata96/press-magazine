import {randomBytes} from "node:crypto";
import {connection, NextResponse, type NextRequest} from "next/server";
import {getOrigin} from "@/lib/customer-account/config";
import {CustomerAccountError} from "@/lib/customer-account/types";
import {parseReturnTo} from "@/lib/customer-account/links";
import {buildAuthorizationUrl} from "@/lib/customer-account/oauth";
import {writeLoginTransaction} from "@/lib/customer-account/session";
import {logAuthFailure, parseLocale, redirectToFailure} from "../auth-redirects";

// Starts the Shopify sign-in. The cart cookie is not touched, so the cart survives login.
export async function GET(request: NextRequest) {
  // Runs at request time: it sets a cookie, so it must never be prerendered.
  await connection();

  const {searchParams, pathname, search} = request.nextUrl;
  // The dev server reports its own address in nextUrl, not the public one it was reached
  // through (e.g. a tunnel), so the browser's Host header is the reliable value.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const locale = parseLocale(searchParams.get("locale"));

  try {
    const origin = getOrigin();

    // Cookies are host-specific and Shopify returns to the registered host, so the flow has to
    // start there. Hosts other than the configured one are sent over, never trusted.
    if (host !== new URL(origin).host) {
      // Redirecting from a dev server would send the buyer to a deployed site that may not have
      // these routes; say what to fix instead.
      if (process.env.NODE_ENV === "development") {
        throw new CustomerAccountError(
          `Open the site at APP_ORIGIN (${origin}) to sign in; got ${host}. Shopify only redirects to the registered origin.`,
        );
      }

      return NextResponse.redirect(`${origin}${pathname}${search}`);
    }

    const transaction = {
      state: randomBytes(16).toString("base64url"),
      nonce: randomBytes(16).toString("base64url"),
      locale,
      returnTo: parseReturnTo(searchParams.get("returnTo")),
    };
    const authorizationUrl = await buildAuthorizationUrl(transaction);

    await writeLoginTransaction(transaction);

    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    logAuthFailure("Starting sign-in failed", error);

    return redirectToFailure(request, locale);
  }
}
