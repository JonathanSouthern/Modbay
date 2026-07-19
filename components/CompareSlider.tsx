"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

type Props = {
  original: string;
  result: string;
};

/**
 * Before/after reveal: the build is clipped to the right of a draggable
 * divider. Pointer-driven, keyboard-accessible (arrow keys on the handle).
 */
export default function CompareSlider({ original, result }: Props) {
  const [pos, setPos] = useState(50); // divider position, % from left
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(97, Math.max(3, pct)));
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      updateFromClientX(e.clientX);
    },
    [updateFromClientX]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragging.current) updateFromClientX(e.clientX);
    },
    [updateFromClientX]
  );

  const endDrag = useCallback(() => {
    dragging.current = false;
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPos((p) => Math.max(3, p - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPos((p) => Math.min(97, p + 5));
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* Original (base layer) */}
      <Image
        src={original}
        alt="Original car"
        fill
        unoptimized
        draggable={false}
        className="object-contain"
        sizes="(max-width: 1024px) 100vw, 720px"
      />

      {/* Build, clipped to the right of the divider */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
      >
        <Image
          src={result}
          alt="Modified car"
          fill
          unoptimized
          draggable={false}
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 720px"
        />
      </div>

      {/* Corner labels */}
      <span className="pointer-events-none absolute left-3 top-3 rounded-[3px] bg-stage/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        Original
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-[3px] bg-stage/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
        Build
      </span>

      {/* Divider + handle */}
      <div
        className="absolute bottom-0 top-0 w-px bg-accent"
        style={{ left: `${pos}%` }}
        aria-hidden
      />
      <button
        type="button"
        role="slider"
        aria-label="Compare original and build"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={onKeyDown}
        className="absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-accent bg-stage/90 text-accent shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        style={{ left: `${pos}%` }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="9 18 3 12 9 6" />
          <polyline points="15 6 21 12 15 18" />
        </svg>
      </button>
    </div>
  );
}
