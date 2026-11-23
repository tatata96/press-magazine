import {connection, NextResponse, type NextRequest} from "next/server";
import {getOrigin} from "@/lib/customer-account/config";
import {parseReturnTo} from "@/lib/customer-account/links";
import {exchangeAuthorizationCode} from "@/lib/customer-account/oauth";
import {
  clearLoginTransaction,
  readLoginTransaction,
  writeSession,
} from "@/lib/customer-account/session";
import {CustomerAccountError} from "@/lib/customer-account/types";
import {logAuthFailure, parseLocale, redirectToFailure} from "../auth-redirects";

// The callback URL registered in the Customer Account API settings. Shopify sends the buyer
// here with a one-time code, which is exchanged for tokens on the server.
export async function GET(request: NextRequest) {
  await connection();

  const {searchParams} = request.nextUrl;
  const transaction = await readLoginTransaction();
  const locale = parseLocale(transaction?.locale ?? null);

  try {
    const code = searchParams.get("code");
    const providerError = searchParams.get("error");

    if (providerError) {
      throw new CustomerAccountError(`Shopify returned an error: ${providerError.slice(0, 60)}.`);
    }

    if (!transaction || !code || searchParams.get("state") !== transaction.state) {
      throw new CustomerAccountError("Sign-in state was missing or did not match.");
    }

    await writeSession(await exchangeAuthorizationCode(code, transaction.nonce));
    await clearLoginTransaction();

    return NextResponse.redirect(
      `${getOrigin()}/${locale}${parseReturnTo(transaction.returnTo)}`,
    );
  } catch (error) {
    logAuthFailure("Completing sign-in failed", error);
    await clearLoginTransaction();

    return redirectToFailure(request, locale);
  }
}
