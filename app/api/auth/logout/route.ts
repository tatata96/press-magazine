import {connection, NextResponse, type NextRequest} from "next/server";
import {isSameOrigin} from "@/app/utils/api";
import {getOrigin} from "@/lib/customer-account/config";
import {buildEndSessionUrl} from "@/lib/customer-account/oauth";
import {clearSession, readSession} from "@/lib/customer-account/session";
import {logAuthFailure} from "../auth-redirects";

// POST so a link or an image on another site cannot sign the buyer out. The cart cookie stays,
// so a guest keeps their cart.
export async function POST(request: NextRequest) {
  await connection();

  if (!isSameOrigin(request)) {
    return new Response(null, {status: 403});
  }

  const session = await readSession();

  await clearSession();

  try {
    // Ending the session on Shopify too means the next sign-in asks for a code again.
    const target = session ? await buildEndSessionUrl(session.idToken) : `${getOrigin()}/`;

    return NextResponse.redirect(target, 303);
  } catch (error) {
    logAuthFailure("Ending the Shopify session failed", error);

    return NextResponse.redirect(new URL("/", request.url), 303);
  }
}
