import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoMod Studio — AI car customization",
  description:
    "Upload a photo of your car and visualize custom mods — paint, rims, body kits, and more — with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <header className="bg-nav text-white">
            <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold tracking-tight"
              >
                <span aria-hidden className="text-xl">
                  🚗
                </span>
                <span className="text-lg">
                  AutoMod<span className="text-accent"> Studio</span>
                </span>
              </Link>
              <div className="flex items-center gap-3">
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className="rounded-md px-3 py-1.5 text-sm font-medium text-white/80 transition hover:text-white">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover">
                      Sign up
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton
                    appearance={{ elements: { avatarBox: "h-8 w-8" } }}
                  />
                </Show>
              </div>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
