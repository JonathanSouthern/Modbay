"use client";

import { SignInButton } from "@clerk/nextjs";

type Variant = "signin" | "limit";

type Props = {
  variant: Variant;
  onDismiss: () => void;
};

const COPY: Record<Variant, { title: string; body: string }> = {
  signin: {
    title: "Sign in to build",
    body: "A free account gets you 10 builds a day. Your photo stays right here while you sign in.",
  },
  limit: {
    title: "That's all 10 for today",
    body: "Your free builds are used up. The counter resets tomorrow.",
  },
};

export default function AuthGate({ variant, onDismiss }: Props) {
  const { title, body } = COPY[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stage/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-sm rounded-lg border border-line bg-panel p-6">
        <h2 className="font-display text-xl font-semibold uppercase tracking-[0.12em] text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>

        <div className="mt-5 flex flex-col gap-2">
          {variant === "signin" && (
            <SignInButton mode="modal">
              <button className="w-full rounded bg-accent px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.14em] text-stage transition hover:bg-accent-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                Sign in
              </button>
            </SignInButton>
          )}
          <button
            onClick={onDismiss}
            className="w-full rounded border border-line-strong px-4 py-2.5 text-sm font-medium text-muted transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {variant === "signin" ? "Not now" : "Back to the studio"}
          </button>
        </div>
      </div>
    </div>
  );
}
