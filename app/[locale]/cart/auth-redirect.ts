import {getLoginPath, getRefreshPath} from "@/lib/customer-account/links";

// Server Actions answer "login_required" or "session_expired" instead of redirecting, so the
// browser sends the buyer through the auth routes and brings them back to the same page.
// Returns true when a redirect has started and the caller should stop.
export function redirectForAuthError(
  error: string,
  options: {locale: string; returnTo?: string},
): boolean {
  if (error === "login_required") {
    window.location.assign(getLoginPath(options));

    return true;
  }

  if (error === "session_expired") {
    window.location.assign(getRefreshPath(options));

    return true;
  }

  return false;
}
