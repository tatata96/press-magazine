// Browsers always send Origin on cross-origin POSTs, so a missing or foreign one is rejected.
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) {
    return false;
  }
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// The host's proxy sets x-forwarded-for; its first entry is the client address.
export function getClientIpAddress(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

export function hasJsonContentType(request: Request): boolean {
  return Boolean(
    request.headers.get("content-type")?.includes("application/json"),
  );
}

export function createNoStoreJsonResponse(body: unknown, status: number) {
  return Response.json(body, {status, headers: {"Cache-Control": "no-store"}});
}
