// Next.js 16 renamed the "middleware" convention to "proxy".
// clerkMiddleware runs here so `auth()` works inside route handlers and
// server components. We do NOT force-redirect protected routes here — the
// /api/generate and /api/usage handlers self-enforce auth and return a proper
// 401 JSON response (see the API contract in the README).
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
