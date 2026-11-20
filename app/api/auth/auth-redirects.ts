import "server-only";

import {NextResponse} from "next/server";
import {hasLocale} from "next-intl";
import {routing} from "@/i18n/routing";
import {SealConfigError} from "@/lib/cookies/seal";
import {CustomerAccountError} from "@/lib/customer-account/types";

export function parseLocale(value: string | null): string {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}

export function redirectTo(request: Request, path: string, status = 307): NextResponse {
  return NextResponse.redirect(new URL(path, request.url), status);
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
