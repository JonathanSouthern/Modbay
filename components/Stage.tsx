"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import CompareSlider from "@/components/CompareSlider";
import { MAX_IMAGE_BYTES } from "@/lib/mods";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  imageUrl: string | null;
  resultUrl: string | null;
  isLoading: boolean;
  loadingLabel: string;
  onImage: (dataUrl: string) => void;
  onError: (message: string) => void;
};

function extFromDataUrl(dataUrl: string): string {
  const m = /^data:image\/([a-z0-9.+-]+);/i.exec(dataUrl);
  const type = (m?.[1] || "jpeg").toLowerCase();
  return type === "jpeg" ? "jpg" : type;
}

/** Viewfinder-style corner bracket. */
function Corner({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-5 w-5 border-line-strong ${className}`}
    />
  );
}

export default function Stage({
  imageUrl,
  resultUrl,
  isLoading,
  loadingLabel,
  onImage,
  onError,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED.includes(file.type)) {
        onError("That file type won't work — upload a JPG, PNG, or WEBP.");
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        onError("That photo is over 10MB — export a smaller version and retry.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => onImage(reader.result as string);
      reader.onerror = () => onError("Couldn't read that file — try again.");
      reader.readAsDataURL(file);
    },
    [onImage, onError]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const browse = useCallback(() => inputRef.current?.click(), []);

  return (
    <div className="space-y-2.5">
      {/* The stage */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative aspect-[16/10] w-full overflow-hidden rounded-lg border bg-stage transition-colors ${
          dragging ? "border-accent" : "border-line"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        {!imageUrl ? (
          /* Empty bay — invitation to act */
          <button
            type="button"
            onClick={browse}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-4 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent"
          >
            <Corner className="left-3 top-3 border-l border-t" />
            <Corner className="right-3 top-3 border-r border-t" />
            <Corner className="bottom-3 left-3 border-b border-l" />
            <Corner className="bottom-3 right-3 border-b border-r" />

            <span className="font-display text-2xl font-semibold uppercase tracking-[0.14em] text-foreground">
              Drop your car photo
            </span>
            <span className="rounded border border-line-strong px-4 py-2 text-sm font-medium text-muted transition group-hover:border-accent group-hover:text-foreground">
              Browse files
            </span>
            <span className="font-mono text-[11px] tracking-wide text-muted">
              JPG · PNG · WEBP — up to 10MB
            </span>
          </button>
        ) : resultUrl && !isLoading ? (
          /* Result — before/after reveal */
          <CompareSlider original={imageUrl} result={resultUrl} />
        ) : (
          /* Uploaded preview (and loading overlay) */
          <>
            <Image
              src={imageUrl}
              alt="Your car"
              fill
              unoptimized
              className={`object-contain transition-opacity ${
                isLoading ? "opacity-40" : "opacity-100"
              }`}
              sizes="(max-width: 1024px) 100vw, 720px"
            />
            {isLoading && (
              <div className="absolute inset-0">
                <div className="scan-line absolute left-0 right-0 h-0.5 bg-accent/70" />
                <div className="absolute inset-x-0 bottom-4 flex justify-center">
                  <span
                    role="status"
                    className="rounded bg-stage/85 px-3 py-1.5 font-mono text-xs text-accent"
                  >
                    {loadingLabel}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Replace control — present whenever a photo is loaded */}
        {imageUrl && !isLoading && (
          <button
            type="button"
            onClick={browse}
            className="absolute right-3 bottom-3 rounded border border-line-strong bg-stage/85 px-2.5 py-1 font-mono text-[11px] text-muted transition hover:border-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Replace photo
          </button>
        )}
      </div>

      {/* Toolbar under the stage */}
      {resultUrl && !isLoading && (
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-muted">
            Builds aren&apos;t stored — download to keep this one.
          </p>
          <a
            href={resultUrl}
            download={`automod-build.${extFromDataUrl(resultUrl)}`}
            className="inline-flex shrink-0 items-center gap-2 rounded border border-accent px-3.5 py-1.5 text-sm font-semibold text-accent transition hover:bg-accent hover:text-stage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <svg
              width="14"
              height="14"
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
            Download build
          </a>
        </div>
      )}
    </div>
  );
}
