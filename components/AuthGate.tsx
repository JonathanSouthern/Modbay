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
    body: "Create a free account to start customizing your ride. You get 10 builds per day.",
  },
  limit: {
    title: "You've used all 10 builds today",
    body: "Your free builds reset tomorrow. Thanks for trying AutoMod Studio!",
  },
};

export default function AuthGate({ variant, onDismiss }: Props) {
  const { title, body } = COPY[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-2xl">
          {variant === "limit" ? "🏁" : "🔑"}
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1.5 text-sm text-muted">{body}</p>

        <div className="mt-5 flex flex-col gap-2">
          {variant === "signin" && (
            <SignInButton mode="modal">
              <button className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover">
                Sign in / Sign up
              </button>
            </SignInButton>
          )}
          <button
            onClick={onDismiss}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition hover:text-foreground"
          >
            {variant === "signin" ? "Maybe later" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}
