import {ShopifyError} from "../../../lib/shopify/admin-client";
import {
  createNoStoreJsonResponse,
  getClientIpAddress,
  hasJsonContentType,
  isSameOrigin,
} from "@/app/utils/api";
import {isRateLimited} from "./rate-limit";
import {subscribeToNewsletter} from "./subscribe";
import {parseSignup} from "./validation";

const MAX_BODY_BYTES = 4 * 1024;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return createNoStoreJsonResponse({ok: false}, 403);
  }
  if (isRateLimited(getClientIpAddress(request))) {
    return createNoStoreJsonResponse({ok: false}, 429);
  }

  if (!hasJsonContentType(request)) {
    return createNoStoreJsonResponse({ok: false}, 415);
  }

  const raw = await request.text();

  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return createNoStoreJsonResponse({ok: false}, 413);
  }

  let payload: unknown;

  try {
    payload = JSON.parse(raw);
  } catch {
    return createNoStoreJsonResponse({ok: false}, 400);
  }

  const parsed = parseSignup(payload);

  if (parsed.kind === "invalid") {
    return createNoStoreJsonResponse({ok: false, fields: parsed.fields}, 400);
  }
  // Bots get the same answer as everyone else, without touching Shopify.
  if (parsed.kind === "bot") {
    return createNoStoreJsonResponse({ok: true}, 200);
  }

  try {
    await subscribeToNewsletter(parsed.input);
  } catch (error) {
    // Only sanitized messages are logged: no form data, tokens or response bodies.
    console.error(
      "[newsletter] signup failed:",
      error instanceof ShopifyError ? error.message : "unexpected error",
    );
    return createNoStoreJsonResponse({ok: false}, 502);
  }

  return createNoStoreJsonResponse({ok: true}, 200);
}
