import {NextResponse} from "next/server";
import {finishLogin, handleSpike} from "@/lib/customer-account/spike";

// THROWAWAY SPIKE: the callback URL registered in the Customer Account API settings.
export async function GET(request: Request) {
  return handleSpike(async () => NextResponse.redirect(await finishLogin(request)));
}
