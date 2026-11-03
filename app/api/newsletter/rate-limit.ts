// Best-effort, in-memory limiter. On serverless hosting each instance keeps its own
// counters, so this only slows casual abuse; add a shared limit (for example a Vercel WAF
// rate-limit rule) before launch.
const WINDOW_MS = 10 * 60 * 1000; // 10 mins
const MAX_REQUESTS_PER_WINDOW = 5; // maximum 5 requests allowed in 10 mins
const MAX_TRACKED_KEYS = 10000;

const windows = new Map<string, {count: number; resetAt: number}>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();

  if (windows.size >= MAX_TRACKED_KEYS) {
    for (const [trackedKey, entry] of windows) {
      if (entry.resetAt <= now) {
        windows.delete(trackedKey);
      }
    }
    // Still full of live windows: drop the oldest rather than grow without bound.
    if (windows.size >= MAX_TRACKED_KEYS) {
      const oldest = windows.keys().next().value;

      if (oldest !== undefined) {
        windows.delete(oldest);
      }
    }
  }

  const entry = windows.get(key);

  if (!entry || entry.resetAt <= now) {
    windows.set(key, {count: 1, resetAt: now + WINDOW_MS});
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}
