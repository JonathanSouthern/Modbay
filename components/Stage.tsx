"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

// Vercel functions cap request bodies at ~4.5MB, and the photo travels as a
// base64 data URL (~1.37× its binary size). Downscale + recompress in the
// browser so any accepted photo fits: longest edge capped, quality stepped
// down until the payload is comfortably under the limit.
const MAX_EDGE_PX = 2000;
const PASSTHROUGH_BYTES = 1_500_000; // small files skip re-encoding
const TARGET_DATAURL_CHARS = 3_000_000; // ≈2.2MB binary, well under the cap

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

async function prepareImage(file: File): Promise<string> {
  if (file.size <= PASSTHROUGH_BYTES) return readAsDataUrl(file);

  // from-image applies EXIF rotation, so phone photos come out upright.
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  }).catch(() => null);
  if (!bitmap) return readAsDataUrl(file);

  const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return readAsDataUrl(file);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let out = "";
  for (const quality of [0.85, 0.7, 0.55]) {
    out = canvas.toDataURL("image/jpeg", quality);
    if (out.length <= TARGET_DATAURL_CHARS) return out;
  }
  return out; // worst case: smallest attempt
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
  const dragDepth = useRef(0);

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
      prepareImage(file)
        .then(onImage)
        .catch(() => onError("Couldn't read that file — try again."));
    },
    [onImage, onError]
  );

  // Page-wide drag & drop: dragging a file anywhere over the window shows
  // a takeover veil; dropping anywhere loads the photo.
  useEffect(() => {
    const isFileDrag = (e: DragEvent) =>
      Array.from(e.dataTransfer?.types ?? []).includes("Files");

    const onEnter = (e: DragEvent) => {
      if (!isFileDrag(e)) return;
      dragDepth.current += 1;
      setDragging(true);
    };
    const onLeave = (e: DragEvent) => {
      if (!isFileDrag(e)) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    };
    const onOver = (e: DragEvent) => {
      if (isFileDrag(e)) e.preventDefault(); // allow dropping
    };
    const onDrop = (e: DragEvent) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFile(file);
    };

    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("dragover", onOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("drop", onDrop);
    };
  }, [handleFile]);

  const browse = useCallback(() => inputRef.current?.click(), []);

  return (
    <div className="space-y-2.5">
      {/* Full-page drop veil */}
      {dragging && (
        <div className="fade-in pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-stage/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-lg border border-accent px-10 py-8">
            <span className="font-display text-2xl font-semibold uppercase tracking-[0.14em] text-accent">
              Drop to load your ride
            </span>
            <span className="font-mono text-[11px] text-muted">
              JPG · PNG · WEBP — up to 10MB
            </span>
          </div>
        </div>
      )}

      {/* The stage */}
      <div
        className={`relative aspect-[16/10] w-full overflow-hidden rounded-lg border bg-stage transition-colors ${
          dragging ? "border-accent" : "border-line"
        }`}
      >
        {/* Soft vignette for depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.035),transparent_65%)]"
        />
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
            download={`modbay-build.${extFromDataUrl(resultUrl)}`}
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
