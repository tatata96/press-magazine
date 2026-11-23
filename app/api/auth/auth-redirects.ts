import "server-only";

import {NextResponse} from "next/server";
import {hasLocale} from "next-intl";
import {routing} from "@/i18n/routing";
import {getOrigin} from "@/lib/customer-account/config";
import {SealConfigError} from "@/lib/cookies/seal";
import {CustomerAccountError} from "@/lib/customer-account/types";

export function parseLocale(value: string | null): string {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}

// Redirects stay on the configured origin: behind a tunnel or proxy `request.url` can hold the
// dev server's own address (http://localhost:3000), which the browser can't use there.
export function redirectTo(request: Request, path: string, status = 307): NextResponse {
  let base = request.url;

  try {
    base = getOrigin();
  } catch {
    // APP_ORIGIN missing or invalid: fall back to the request, the failure page still works.
  }

  return NextResponse.redirect(new URL(path, base), status);
}

export function redirectToFailure(request: Request, locale: string): NextResponse {
  return redirectTo(request, `/${locale}/sign-in-failed`);
}

// Only our own error types carry messages that are safe to log; anything else could hold
// tokens or personal data.
export function logAuthFailure(context: string, error: unknown): void {
  const isSafe = error instanceof CustomerAccountError || error instanceof SealConfigError;

  console.error(`${context}:`, isSafe ? error.message : "unexpected error");
}
