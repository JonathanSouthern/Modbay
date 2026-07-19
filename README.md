# 🚗 Pimp My Vehicle

AI-powered car customization. Upload a photo of your car, pick your mods (paint,
rims, body kits, spoilers, tint…), and AI visualizes the build on your actual photo.

**Pipeline:** upload → **Claude** turns your selections into a precise editing
instruction → **Gemini** edits the photo → before/after result you can download.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Auth | Clerk |
| Rate limiting | Vercel KV / Upstash Redis (10 builds/user/day) |
| Prompt engineering | Anthropic Claude API |
| Image editing | Google Gemini API (`gemini-2.5-flash-image`) |
| Hosting | Vercel |

> Requires Node.js 20+ — [`.nvmrc`](.nvmrc) pins Node 24 (`nvm use`). Next.js 16
> renames the `middleware` convention to `proxy` — auth runs from [`proxy.ts`](proxy.ts).

## Setup

### 1. Node version + install

The repo pins Node 24 via [`.nvmrc`](.nvmrc):

```bash
nvm use        # activates Node 24 (nvm install 24 first if missing)
npm install
```

### 2. Environment variables

Copy the template and fill in real values:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
| --- | --- |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com |
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | https://dashboard.clerk.com |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Vercel → Storage → create a Redis (Upstash) store |

`.env.local` is **gitignored** and must never be committed. Only `.env.example`
(placeholders, no secrets) is tracked. See [Secrets & git](#secrets--git) below.

> Optional overrides: `CLAUDE_MODEL` (default `claude-sonnet-4-5`) and
> `GEMINI_MODEL` (default `gemini-2.5-flash-image`).

### 3. Run

```bash
npm run dev      # http://localhost:3000
```

Clerk runs in **keyless mode** without keys, so the app boots for local UI work
before you add credentials. Generation needs the Anthropic + Gemini keys; rate
limiting is skipped (allow-all with a warning) until KV is configured.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start local dev server |
| `npm run build` | Production build + type check |
| `npm run lint` | ESLint |
| `vercel` | Deploy to Vercel from the CLI |

## API

### `POST /api/generate` (auth required)

```jsonc
// request
{ "image": "data:image/jpeg;base64,…",
  "color":  { "name": "Midnight black", "hex": "#1a1a1a" },
  "finish": { "id": "matte", "label": "Matte" },
  "rim":    { "id": "sport", "label": "Sport spoke" },
  "tint":   { "id": "dark", "label": "Dark", "vlt": 20 },
  "mods":   ["Lowered stance", "Diffuser"],
  "freeText": "Also add a subtle racing stripe" }

// 200
{ "result": "data:image/…;base64,…", "remaining": 7 }
```

| Status | Meaning |
| --- | --- |
| 401 | Not signed in |
| 429 | Daily limit reached (10 builds) |
| 400 | Missing image or no mods selected |
| 500 | Claude/Gemini error |

### `GET /api/usage` (auth required)

```json
{ "used": 3, "limit": 10, "remaining": 7 }
```

## Project structure

```
app/
  layout.tsx                     Root layout + Clerk provider + nav
  page.tsx                       Home — renders <Studio />
  sign-in/[[...sign-in]]/        Clerk sign-in
  sign-up/[[...sign-up]]/        Clerk sign-up
  api/generate/route.ts          Claude → Gemini pipeline
  api/usage/route.ts             Current usage
components/                      Studio, Stage, CompareSlider, ControlPanel,
                                 BuildButton, UsageBadge, AuthGate
lib/
  prompt.ts                      Claude prompt engineering
  gemini.ts                      Gemini image editing
  ratelimit.ts                   KV read/increment/check
  mods.ts                        Shared colors/rims/mods + types
  image.ts                       data-URL helpers
proxy.ts                         Clerk auth (Next 16 "middleware")
```

## Secrets & git

- `.env` / `.env.*` are gitignored — real keys never enter the repo.
- `.env.example` is the **only** committed env file and holds placeholders only.
- Set production values in the Vercel dashboard (Project → Settings → Environment
  Variables), not in code.

## Deploy

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add all env vars in Vercel → Settings → Environment Variables.
4. Create a Redis (Upstash) store under Storage; copy `KV_REST_API_URL` /
   `KV_REST_API_TOKEN` into the env vars.
5. In Clerk, add your production domain and (optionally) enable Google OAuth.
6. Deploy.
