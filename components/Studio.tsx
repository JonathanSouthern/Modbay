"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Stage from "@/components/Stage";
import ControlPanel from "@/components/ControlPanel";
import UsageBadge from "@/components/UsageBadge";
import AuthGate from "@/components/AuthGate";
import BuildButton from "@/components/BuildButton";
import {
  DAILY_LIMIT,
  EMPTY_OPTIONS,
  type ModOptions,
  type PresetOption,
} from "@/lib/mods";

type Gate = "signin" | "limit" | null;

// Narrates the pipeline while a build renders (~10–30s), advancing on a
// timer so the wait reads as progress instead of a stall.
const LOADING_STAGES: { at: number; label: string }[] = [
  { at: 0, label: "Reading your photo" },
  { at: 4_000, label: "Writing the edit plan" },
  { at: 10_000, label: "Applying your mods" },
  { at: 20_000, label: "Rendering the final shot" },
];

function specHasSelections(spec: ModOptions): boolean {
  return Object.values(spec).some((v) =>
    Array.isArray(v)
      ? v.length > 0
      : typeof v === "string"
        ? v.trim().length > 0
        : v !== null
  );
}

export default function Studio() {
  const { isSignedIn, isLoaded } = useUser();

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [spec, setSpec] = useState<ModOptions>(EMPTY_OPTIONS);
  const [presetId, setPresetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState(LOADING_STAGES[0].label);
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

  // Advance the loading narration while a build is in flight. The label is
  // reset in build() when the request starts.
  useEffect(() => {
    if (!isLoading) return;
    const timers = LOADING_STAGES.slice(1).map((stage) =>
      setTimeout(() => setLoadingLabel(stage.label), stage.at)
    );
    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

  // Manual edits to any control turn the spec back into a "Custom" build.
  const patchSpec = useCallback((patch: Partial<ModOptions>) => {
    setSpec((prev) => ({ ...prev, ...patch }));
    setPresetId(null);
  }, []);

  // A preset fills the whole sheet at once.
  const applyPreset = useCallback((p: PresetOption) => {
    setSpec(p.spec);
    setPresetId(p.id);
  }, []);

  const hasSelections = specHasSelections(spec);
  const canBuild = Boolean(uploadedImage) && hasSelections;

  const handleImage = useCallback((dataUrl: string) => {
    setUploadedImage(dataUrl);
    setResultImage(null); // re-upload clears previous result
    setError(null);
  }, []);

  const build = useCallback(async () => {
    setError(null);
    if (!uploadedImage) {
      setError("Add a photo of your car first.");
      return;
    }
    if (!hasSelections) {
      setError("Pick a paint, rim, or mod to build.");
      return;
    }
    if (!isSignedIn) {
      setGate("signin");
      return;
    }

    setLoadingLabel(LOADING_STAGES[0].label);
    setIsLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: uploadedImage, ...spec }),
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
        setError(data?.error || "The build failed — try again.");
        return;
      }

      setResultImage(data.result);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
    } catch {
      setError("Connection dropped — check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, hasSelections, isSignedIn, spec]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 lg:pb-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-[0.06em] sm:text-4xl">
            Your car, modified<span className="text-accent">.</span>
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Upload a photo, spec the build, and see it on your actual car.
          </p>
        </div>
        {isSignedIn && <UsageBadge remaining={remaining} limit={DAILY_LIMIT} />}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-foreground"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Stage
          imageUrl={uploadedImage}
          resultUrl={resultImage}
          isLoading={isLoading}
          loadingLabel={loadingLabel}
          onImage={handleImage}
          onError={setError}
        />

        <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto">
          <ControlPanel
            spec={spec}
            onPatch={patchSpec}
            presetId={presetId}
            onPreset={applyPreset}
            onBuild={build}
            isLoading={isLoading}
            canBuild={canBuild}
          />
        </div>
      </div>

      {/* Mobile: sticky build bar so the CTA is always reachable */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel/95 px-4 py-3 backdrop-blur lg:hidden">
        <BuildButton onBuild={build} isLoading={isLoading} canBuild={canBuild} />
        {!canBuild && (
          <p className="mt-1.5 text-center font-mono text-[11px] text-muted">
            Add a photo and pick at least one mod
          </p>
        )}
      </div>

      {gate && <AuthGate variant={gate} onDismiss={() => setGate(null)} />}
    </div>
  );
}
