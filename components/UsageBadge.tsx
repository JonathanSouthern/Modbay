"use client";

type Props = {
  remaining: number | null;
  limit: number;
};

/** Local time at which the daily counter rolls over (midnight UTC). */
function resetTimeLocal(): string {
  const now = new Date();
  const nextUtcMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  return nextUtcMidnight.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Fuel-gauge usage meter: one segment per build, drains as you use them.
 */
export default function UsageBadge({ remaining, limit }: Props) {
  if (remaining === null) return null;

  const low = remaining <= 2;

  return (
    <div
      className="flex items-center gap-2.5"
      title={`Free builds — resets daily at ${resetTimeLocal()} your time`}
    >
      <div className="flex items-end gap-[3px]" aria-hidden>
        {Array.from({ length: limit }, (_, i) => (
          <span
            key={i}
            className={`h-3 w-1.5 rounded-[1px] ${
              i < remaining
                ? low
                  ? "bg-danger"
                  : "bg-accent"
                : "bg-line-strong"
            }`}
          />
        ))}
      </div>
      <span className="font-mono text-[11px] tracking-wide text-muted">
        {remaining}/{limit} builds left
        {low && ` · resets ${resetTimeLocal()}`}
      </span>
    </div>
  );
}
