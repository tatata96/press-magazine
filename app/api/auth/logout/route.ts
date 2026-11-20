import {NextResponse} from "next/server";
import {handleSpike, startLogout} from "@/lib/customer-account/spike";

// THROWAWAY SPIKE: clears the session and ends it on Shopify.
export async function GET(request: Request) {
  return handleSpike(async () => NextResponse.redirect(await startLogout(request)));
}
