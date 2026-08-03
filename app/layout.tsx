import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://modbay.vercel.app"),
  title: "Modbay — see mods on your own car",
  description:
    "Upload a photo of your car, spec the build — paint, rims, body kit — and see it rendered on your actual car.",
  openGraph: {
    title: "Modbay — see mods on your own car",
    description:
      "Upload a photo of your car, spec the build — paint, rims, stance, tint — and see it rendered on your actual car.",
    siteName: "Modbay",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
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
        className={`${barlow.variable} ${barlowCondensed.variable} ${plexMono.variable} h-full`}
      >
        <body className="flex min-h-full flex-col bg-background text-foreground">
          <header className="sticky top-0 z-50 border-b border-line bg-background/80 backdrop-blur-md">
            <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
              <Link href="/" className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="block h-3.5 w-3.5 rounded-[2px] bg-accent"
                />
                <span className="font-display text-lg font-semibold uppercase tracking-[0.18em]">
                  Mod<span className="text-muted">bay</span>
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className="rounded px-3 py-1.5 text-sm font-medium text-muted transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded bg-accent px-3.5 py-1.5 text-sm font-semibold text-stage transition hover:bg-accent-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
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
