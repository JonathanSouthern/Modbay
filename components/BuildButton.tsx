"use client";

type Props = {
  onBuild: () => void;
  isLoading: boolean;
  canBuild: boolean;
};

export default function BuildButton({ onBuild, isLoading, canBuild }: Props) {
  return (
    <button
      type="button"
      onClick={onBuild}
      disabled={isLoading || !canBuild}
      className="flex w-full items-center justify-center gap-2.5 rounded bg-accent px-4 py-3 font-display text-base font-semibold uppercase tracking-[0.16em] text-stage transition hover:bg-accent-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
    >
      {isLoading ? (
        <>
          <svg
            className="h-4 w-4 motion-safe:animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
            />
          </svg>
          Building
        </>
      ) : (
        "Build it"
      )}
    </button>
  );
}
