"use client";

type Props = {
  remaining: number | null;
  limit: number;
};

export default function UsageBadge({ remaining, limit }: Props) {
  if (remaining === null) return null;

  const used = Math.max(0, limit - remaining);
  const low = remaining <= 2;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        low
          ? "border-amber-300 bg-amber-50 text-amber-700"
          : "border-border bg-card text-muted"
      }`}
      title="Free builds reset daily"
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${
          low ? "bg-amber-500" : "bg-accent"
        }`}
      />
      {used} / {limit} builds today
    </span>
  );
}
