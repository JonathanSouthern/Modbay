"use client";

import Image from "next/image";

type Props = {
  original: string | null;
  result: string | null;
  isLoading: boolean;
};

function extFromDataUrl(dataUrl: string): string {
  const m = /^data:image\/([a-z0-9.+-]+);/i.exec(dataUrl);
  const type = (m?.[1] || "jpeg").toLowerCase();
  return type === "jpeg" ? "jpg" : type;
}

export default function ResultPane({ original, result, isLoading }: Props) {
  if (!original) return null;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <figure className="space-y-1.5">
          <figcaption className="text-xs font-medium uppercase tracking-wide text-muted">
            Original
          </figcaption>
          <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-card">
            <Image
              src={original}
              alt="Original car"
              fill
              unoptimized
              className="object-contain"
              sizes="(max-width: 640px) 100vw, 400px"
            />
          </div>
        </figure>

        <figure className="space-y-1.5">
          <figcaption className="text-xs font-medium uppercase tracking-wide text-muted">
            AutoMod result
          </figcaption>
          <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-card">
            {result ? (
              <Image
                src={result}
                alt="Modified car"
                fill
                unoptimized
                className="object-contain"
                sizes="(max-width: 640px) 100vw, 400px"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
                {isLoading ? (
                  <>
                    <svg
                      className="h-6 w-6 animate-spin text-accent"
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
                    <span className="text-xs">Editing your build…</span>
                  </>
                ) : (
                  <>
                    <span aria-hidden className="text-2xl">
                      ✨
                    </span>
                    <span className="text-xs">Your result will appear here</span>
                  </>
                )}
              </div>
            )}
          </div>
        </figure>
      </div>

      {result && (
        <a
          href={result}
          download={`automod-build.${extFromDataUrl(result)}`}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent/60"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download result
        </a>
      )}
    </div>
  );
}
