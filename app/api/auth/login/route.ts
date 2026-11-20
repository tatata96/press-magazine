import {NextResponse} from "next/server";
import {handleSpike, startLogin} from "@/lib/customer-account/spike";

// THROWAWAY SPIKE: /api/auth/login?locale=tr|en&returnTo=/cart
export async function GET(request: Request) {
  return handleSpike(async () => NextResponse.redirect(await startLogin(request)));
}
