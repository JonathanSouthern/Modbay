import { kv } from "@vercel/kv";
import { DAILY_LIMIT } from "@/lib/mods";

const TTL_SECONDS = 60 * 60 * 25; // 25 hours — auto-expires without a cron

export type RateResult = { allowed: boolean; remaining: number };
export type Usage = { used: number; limit: number; remaining: number };

function isKvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function todayKey(userId: string): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  return `user:${userId}:count:${today}`;
}

/**
 * Read the user's count, and increment it if they are under the daily limit.
 * When KV is not configured (e.g. local dev before a store exists) this
 * degrades to "always allowed" and logs a warning instead of failing.
 */
export async function checkAndIncrement(userId: string): Promise<RateResult> {
  if (!isKvConfigured()) {
    console.warn("[ratelimit] KV not configured — skipping rate limit");
    return { allowed: true, remaining: DAILY_LIMIT };
  }

  const key = todayKey(userId);
  const current = Number((await kv.get<number>(key)) ?? 0);

  if (current >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  const next = current + 1;
  await kv.set(key, next, { ex: TTL_SECONDS });
  return { allowed: true, remaining: DAILY_LIMIT - next };
}

/** Read-only view of the user's usage for today. */
export async function getUsage(userId: string): Promise<Usage> {
  if (!isKvConfigured()) {
    return { used: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT };
  }

  const current = Number((await kv.get<number>(todayKey(userId))) ?? 0);
  return {
    used: current,
    limit: DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - current),
  };
}
