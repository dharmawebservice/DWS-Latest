// Tiny in-memory sliding-window rate limiter.
// Per server instance only (good enough to blunt bots / brute force on a small site).
const hits = new Map(); // key -> number[] (timestamps)
let lastPrune = 0;

export function rateLimit(key, { limit = 5, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now();

  // Prune stale keys at most once a minute
  if (now - lastPrune > 60_000) {
    lastPrune = now;
    for (const [k, arr] of hits) {
      if (!arr.length || now - arr[arr.length - 1] > 60 * 60 * 1000) hits.delete(k);
    }
  }

  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    hits.set(key, arr);
    return false;
  }
  arr.push(now);
  hits.set(key, arr);
  return true;
}

export function clientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
