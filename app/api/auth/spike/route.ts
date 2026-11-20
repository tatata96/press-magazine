import {NextResponse} from "next/server";
import {
  associateCartWithCustomer,
  describeSession,
  handleSpike,
} from "@/lib/customer-account/spike";

// THROWAWAY SPIKE: /api/auth/spike reports session, cookie size and cart state (read-only).
// /api/auth/spike?checkout=1 attaches the customer to the cart and opens Shopify checkout.
export async function GET(request: Request) {
  return handleSpike(async () => {
    if (new URL(request.url).searchParams.get("checkout") === "1") {
      return NextResponse.redirect(await associateCartWithCustomer());
    }

    return Response.json(await describeSession(request));
  });
}
