/* ============================================================================
 * In-memory sliding-window rate limiting, shared by the API routes.
 *
 * Serverless instances are recycled and don't share memory, so this is a
 * speed bump rather than a wall: it stops one visitor hammering an endpoint.
 * For a hard global limit, put Vercel's firewall or a Redis counter in front.
 * ==========================================================================*/

export type RateLimiter = {
  /** Records a hit for `key` and returns true when the key is over its limit. */
  limited(key: string): boolean;
};

export function createRateLimiter({
  windowMs,
  max,
}: {
  windowMs: number;
  max: number;
}): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    limited(key) {
      const now = Date.now();
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

      if (recent.length >= max) {
        hits.set(key, recent);
        return true;
      }

      recent.push(now);
      hits.set(key, recent);

      // Keep the map from growing without bound on a long-lived instance.
      if (hits.size > 5000) {
        for (const [k, times] of hits) {
          if (times.every((t) => now - t >= windowMs)) hits.delete(k);
        }
      }
      return false;
    },
  };
}

/** Best-effort client IP from the proxy headers Vercel sets. */
export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Reads a positive integer from the environment, with a default. */
export function envInt(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
