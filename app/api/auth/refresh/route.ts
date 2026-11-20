import {connection, type NextRequest} from "next/server";
import {getLoginPath, parseReturnTo} from "@/lib/customer-account/links";
import {refreshSession} from "@/lib/customer-account/oauth";
import {
  clearSession,
  hasUsableLifetime,
  readSession,
  writeSession,
} from "@/lib/customer-account/session";
import {logAuthFailure, parseLocale, redirectTo} from "../auth-redirects";

// Pages cannot set cookies while rendering, so an expired access token sends the buyer here
// to be renewed and returned. When renewal is not possible they sign in again.
export async function GET(request: NextRequest) {
  await connection();

  const {searchParams} = request.nextUrl;
  const locale = parseLocale(searchParams.get("locale"));
  const returnTo = parseReturnTo(searchParams.get("returnTo"));

  try {
    const session = await readSession();

    if (session?.refreshToken) {
      const renewed = await refreshSession(session);

      // A token that is already near expiry would bounce straight back here; sign in instead.
      if (hasUsableLifetime(renewed)) {
        await writeSession(renewed);

        return redirectTo(request, `/${locale}${returnTo}`);
      }
    }
  } catch (error) {
    logAuthFailure("Refreshing the session failed", error);
  }

  await clearSession();

  return redirectTo(request, getLoginPath({locale, returnTo}));
}
