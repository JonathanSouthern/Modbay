"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { MAX_IMAGE_BYTES } from "@/lib/mods";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  imageUrl: string | null;
  onImage: (dataUrl: string) => void;
  onError: (message: string) => void;
};

export default function UploadZone({ imageUrl, onImage, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED.includes(file.type)) {
        onError("Please upload a JPG, PNG, or WEBP image.");
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        onError("Image is larger than 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => onImage(reader.result as string);
      reader.onerror = () => onError("Could not read that file.");
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

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={`group relative flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition ${
        dragging
          ? "border-accent bg-accent/5"
          : "border-border bg-card hover:border-accent/60"
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

      {imageUrl ? (
        <>
          {/* Uploaded preview */}
          <Image
            src={imageUrl}
            alt="Uploaded car"
            fill
            unoptimized
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, 600px"
          />
          <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
            Click to replace
          </div>
        </>
      ) : (
        <div className="px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">
            Drag & drop your car photo
          </p>
          <p className="mt-1 text-xs text-muted">
            or click to browse · JPG, PNG, WEBP · up to 10MB
          </p>
        </div>
      )}
    </div>
  );
}
