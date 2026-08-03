import { kv } from "@vercel/kv";
import { DAILY_LIMIT } from "@/lib/mods";

const TTL_SECONDS = 60 * 60 * 25; // 25 hours — auto-expires without a cron

export type RateResult = { allowed: boolean; remaining: number };
export type Usage = { used: number; limit: number; remaining: number };

/** Thrown when the rate-limit store is unavailable in production. */
export class RateLimitUnavailableError extends Error {
  constructor() {
    super("Rate-limit store (KV) is not configured");
    this.name = "RateLimitUnavailableError";
  }
}

function isKvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// On Vercel, a missing store must block builds (fail closed) — otherwise
// every user gets unlimited paid generations. Locally it just warns.
function isDeployed(): boolean {
  return Boolean(process.env.VERCEL);
}

function todayKey(userId: string): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  return `user:${userId}:count:${today}`;
}

/**
 * Atomically increment the user's daily count and report whether they are
 * within the limit. Uses INCR so concurrent requests can't slip past the cap.
 */
export async function checkAndIncrement(userId: string): Promise<RateResult> {
  if (!isKvConfigured()) {
    if (isDeployed()) throw new RateLimitUnavailableError();
    console.warn("[ratelimit] KV not configured — skipping rate limit (local dev only)");
    return { allowed: true, remaining: DAILY_LIMIT };
  }

  const key = todayKey(userId);
  const next = await kv.incr(key);
  if (next === 1) {
    await kv.expire(key, TTL_SECONDS);
  }

  if (next > DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: DAILY_LIMIT - next };
}

/** Read-only view of the user's usage for today. */
export async function getUsage(userId: string): Promise<Usage> {
  if (!isKvConfigured()) {
    // Display-only endpoint: show a full gauge rather than erroring the UI.
    return { used: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT };
  }

  const current = Number((await kv.get<number>(todayKey(userId))) ?? 0);
  return {
    used: current,
    limit: DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - current),
  };
}
