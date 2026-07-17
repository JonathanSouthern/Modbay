"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import UploadZone from "@/components/UploadZone";
import ControlPanel from "@/components/ControlPanel";
import ResultPane from "@/components/ResultPane";
import UsageBadge from "@/components/UsageBadge";
import AuthGate from "@/components/AuthGate";
import {
  DAILY_LIMIT,
  type ColorOption,
  type RimOption,
} from "@/lib/mods";

type Gate = "signin" | "limit" | null;

export default function Studio() {
  const { isSignedIn, isLoaded } = useUser();

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [color, setColor] = useState<ColorOption | null>(null);
  const [rim, setRim] = useState<RimOption | null>(null);
  const [mods, setMods] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gate, setGate] = useState<Gate>(null);

  // Fetch current usage once signed in.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let active = true;
    fetch("/api/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data) setRemaining(data.remaining);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isLoaded, isSignedIn]);

  const toggleMod = useCallback((m: string) => {
    setMods((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  }, []);

  const hasSelections =
    Boolean(color) || Boolean(rim) || mods.length > 0 || freeText.trim() !== "";
  const canBuild = Boolean(uploadedImage) && hasSelections;

  const handleImage = useCallback((dataUrl: string) => {
    setUploadedImage(dataUrl);
    setResultImage(null); // re-upload clears previous result
    setError(null);
  }, []);

  const build = useCallback(async () => {
    setError(null);
    if (!uploadedImage) {
      setError("Please upload a car photo first.");
      return;
    }
    if (!hasSelections) {
      setError("Pick a color, rim, or mod to get started.");
      return;
    }
    if (!isSignedIn) {
      setGate("signin");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadedImage,
          color,
          rim,
          mods,
          freeText,
        }),
      });

      if (res.status === 401) {
        setGate("signin");
        return;
      }
      if (res.status === 429) {
        setRemaining(0);
        setGate("limit");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
        return;
      }

      setResultImage(data.result);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, hasSelections, isSignedIn, color, rim, mods, freeText]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Pimp your ride
          </h1>
          <p className="mt-1 text-sm text-muted">
            Upload a photo, pick your mods, and let AI build it.
          </p>
        </div>
        {isSignedIn && <UsageBadge remaining={remaining} limit={DAILY_LIMIT} />}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Canvas: upload + before/after */}
        <div className="space-y-6">
          <UploadZone
            imageUrl={uploadedImage}
            onImage={handleImage}
            onError={setError}
          />
          <ResultPane
            original={uploadedImage}
            result={resultImage}
            isLoading={isLoading}
          />
        </div>

        {/* Controls */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ControlPanel
            color={color}
            onColor={setColor}
            rim={rim}
            onRim={setRim}
            mods={mods}
            onToggleMod={toggleMod}
            freeText={freeText}
            onFreeText={setFreeText}
            onBuild={build}
            isLoading={isLoading}
            canBuild={canBuild}
          />
        </div>
      </div>

      {gate && <AuthGate variant={gate} onDismiss={() => setGate(null)} />}
    </div>
  );
}
