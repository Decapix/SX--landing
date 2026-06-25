# Security: Rate Limiting + Captcha + Bot Detection Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harden the Discover and Runway public pages against scraping and bots by adding rate limiting, proof-of-work captcha, and multi-layer bot detection.

**Architecture:** Rate limiting is added at both the FastAPI layer (per-IP token bucket) and the Next.js proxy layer (in-memory bucket). A Cap PoW captcha gates page entry on Discover and Runway. BotD detects headless browsers globally; a DELBOT-style mouse-movement analyser silently blocks non-human interactions on Discover and Runway.

**Tech Stack:** FastAPI (Python), Next.js 15 App Router, `@cap.js/widget`, `@cap.js/server`, `@fingerprintjs/botd`, custom mouse-movement scorer

---

## Task 1: FastAPI — add rate limiting to all runway endpoints

**Files:**
- Modify: `code-style/fastapi-app/app/landing_page/routes.py`

The seven runway handlers (countries, collections list, collections search, collection detail, collection looks, brands list, brand detail) plus two presigned-URL handlers and the season-config handler are **missing `request: Request` parameters and `_enforce_rate_limit` calls**. The discover handlers already have both — use them as the reference pattern.

**Step 1: Add `request: Request` and rate-limit call to `list_public_runway_countries`**

Find (line ≈363):
```python
async def list_public_runway_countries(
    authorization: str = Header(...),
    hp: str | None = Query(None, description="Honeypot field. Keep empty."),
) -> list[RunwayCountryFilterItem]:
    """Countries of brands with visible collections, for landing runway filter dropdowns."""
    _verify_communication_token(authorization)
    _validate_honeypot(hp)
```

Replace with:
```python
async def list_public_runway_countries(
    request: Request,
    authorization: str = Header(...),
    hp: str | None = Query(None, description="Honeypot field. Keep empty."),
) -> list[RunwayCountryFilterItem]:
    """Countries of brands with visible collections, for landing runway filter dropdowns."""
    _verify_communication_token(authorization)
    _validate_honeypot(hp)
    _enforce_rate_limit(request, "runway-countries", 100)
```

**Step 2: Add `request: Request` and rate-limit call to `list_public_runway_collections`**

Find (line ≈374):
```python
async def list_public_runway_collections(
    response: Response,
    authorization: str = Header(...),
    ...
) -> RunwayCollectionListResponse:
    """Public runway collections list for the landing page."""
    _verify_communication_token(authorization)
    _validate_honeypot(hp)
    _set_public_runway_headers(response)
```

Replace with:
```python
async def list_public_runway_collections(
    request: Request,
    response: Response,
    authorization: str = Header(...),
    ...
) -> RunwayCollectionListResponse:
    """Public runway collections list for the landing page."""
    _verify_communication_token(authorization)
    _validate_honeypot(hp)
    _enforce_rate_limit(request, "runway-collections", 100)
    _set_public_runway_headers(response)
```

**Step 3: Same pattern for `search_public_runway_collections`**

Add `request: Request` as first param (before `response`), add `_enforce_rate_limit(request, "runway-collections-search", 100)` after `_validate_honeypot`.

**Step 4: Same for `get_public_runway_collection`**

Add `request: Request` as first param, add `_enforce_rate_limit(request, "runway-collection-detail", 100)`.

**Step 5: Same for `list_public_runway_collection_looks`**

Add `request: Request` as first param, add `_enforce_rate_limit(request, "runway-collection-looks", 100)`.

**Step 6: Same for `list_public_runway_brands`**

Add `request: Request` as first param (before `authorization`), add `_enforce_rate_limit(request, "runway-brands", 100)`.

**Step 7: Same for `get_public_runway_brand`**

Add `request: Request` as first param, add `_enforce_rate_limit(request, "runway-brand-detail", 100)`.

**Step 8: Add rate limit to presigned-URL endpoints**

Both `get_public_presigned_url` (line ≈159) and `get_public_runway_presigned_url` (line ≈172): add `request: Request`, add `_enforce_rate_limit(request, "runway-presigned-url", 100)`.

**Step 9: Add rate limit to `get_public_runway_seasons`**

Add `request: Request`, add `_enforce_rate_limit(request, "runway-season-config", 200)` (higher limit since it's a config lookup).

**Step 10: Verify by grepping**

```bash
grep -n "_enforce_rate_limit" code-style/fastapi-app/app/landing_page/routes.py
```

Expected: 10+ occurrences covering all runway + discover + vote handlers.

---

## Task 2: Next.js — add rate limiting to all runway API routes

**Files:**
- Modify: `src/app/api/runway/collections/route.ts`
- Modify: `src/app/api/runway/search/route.ts`
- Modify: `src/app/api/runway/brands/route.ts`
- Modify: `src/app/api/runway/countries/route.ts`
- Modify: `src/app/api/runway/config/season/route.ts`
- Modify: `src/app/api/runway/assets/presigned-url/route.ts`

Pattern to follow: `src/app/api/discover/posts/route.ts` — it imports `isRateLimited` and returns 429 before proxying.

**Step 1: Update `runway/collections/route.ts`**

Add import:
```ts
import { isRateLimited } from "@/lib/request-rate-limit"
```

Add after `export async function GET(request: Request) {` / `try {`:
```ts
if (isRateLimited(request, "runway-collections", 100)) {
  return NextResponse.json({ detail: "Too many requests" }, { status: 429 })
}
```

**Step 2: Update `runway/search/route.ts`**

Same import. Add:
```ts
if (isRateLimited(request, "runway-search", 100)) {
  return NextResponse.json({ detail: "Too many requests" }, { status: 429 })
}
```

**Step 3: Update `runway/brands/route.ts`**

Note: currently `export async function GET()` (no argument). Change to `GET(request: Request)`.

Add import and check:
```ts
if (isRateLimited(request, "runway-brands", 100)) {
  return NextResponse.json([], { status: 429 })
}
```

**Step 4: Update `runway/countries/route.ts`**

Same as brands — change `GET()` to `GET(request: Request)`, add import and check:
```ts
if (isRateLimited(request, "runway-countries", 100)) {
  return NextResponse.json([], { status: 429 })
}
```

**Step 5: Update `runway/config/season/route.ts`**

Already has `request: Request`. Add import and check:
```ts
if (isRateLimited(request, "runway-season", 200)) {
  return NextResponse.json({ items: [] }, { status: 429 })
}
```

**Step 6: Update `runway/assets/presigned-url/route.ts`**

Already has `request: Request`. Add import and check:
```ts
if (isRateLimited(request, "runway-presigned", 100)) {
  return NextResponse.json({ detail: "Too many requests" }, { status: 429 })
}
```

**Step 7: Verify**

```bash
grep -rn "isRateLimited" landingpage-code/new-landing-ir/src/app/api/
```

Expected: 10 occurrences (6 runway + 4 discover).

---

## Task 3: Cap captcha — install packages and create verify API route

Cap (https://github.com/tiagozip/cap) is a self-hosted proof-of-work captcha. The widget runs a CPU challenge in the browser; the server verifies the solution token.

**Step 1: Install cap packages**

```bash
cd landingpage-code/new-landing-ir
npm install @cap.js/widget @cap.js/server
```

**Step 2: Add environment variables**

In `.env.local` (and your production env), add:
```
CAP_SECRET=<generate with: openssl rand -hex 32>
NEXT_PUBLIC_CAP_API_URL=http://localhost:3000/api/captcha
```

`CAP_SECRET` is a shared secret for HMAC-signing challenges. `NEXT_PUBLIC_CAP_API_URL` is the URL the browser widget calls to retrieve/verify challenges — it points to your own Next.js API.

**Step 3: Create `src/app/api/captcha/route.ts`**

Create: `src/app/api/captcha/route.ts`

```ts
import "server-only"
import { NextResponse } from "next/server"
import { createChallenge, verifySolution } from "@cap.js/server"

const SECRET = process.env.CAP_SECRET
if (!SECRET) throw new Error("CAP_SECRET env var is required")

// GET — browser widget fetches a new challenge
export async function GET() {
  const challenge = await createChallenge({ secret: SECRET! })
  return NextResponse.json(challenge)
}

// POST — browser widget submits solved challenge
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const valid = await verifySolution({ secret: SECRET!, ...body })
    if (!valid) {
      return NextResponse.json({ success: false }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }
}
```

**Step 4: Verify the route exists and imports compile**

```bash
cd landingpage-code/new-landing-ir && npx tsc --noEmit 2>&1 | grep captcha
```

Expected: no errors on captcha route.

---

## Task 4: Cap captcha — CaptchaGate component + wire to layouts

**Files:**
- Create: `src/components/security/captcha-gate.tsx`
- Modify: `src/app/discover/layout.tsx`
- Modify: `src/app/runway/layout.tsx`

**Step 1: Create `src/components/security/captcha-gate.tsx`**

```tsx
"use client"

import { useEffect, useState } from "react"
import Cap from "@cap.js/widget"

export function CaptchaGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Skip gate if already solved this session
    if (sessionStorage.getItem("cap_verified") === "1") {
      setVerified(true)
      setReady(true)
      return
    }
    setReady(true)
  }, [])

  function handleSolved() {
    sessionStorage.setItem("cap_verified", "1")
    setVerified(true)
  }

  if (!ready) return null

  if (verified) return <>{children}</>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-white p-8 shadow-lg">
        <p className="text-sm text-zinc-500">Verifying you&apos;re human…</p>
        <Cap
          apiEndpoint={process.env.NEXT_PUBLIC_CAP_API_URL!}
          onSuccess={handleSolved}
        />
      </div>
    </div>
  )
}
```

**Step 2: Wrap `DiscoverLayout` children with `CaptchaGate`**

In `src/app/discover/layout.tsx`, add the import and wrap `{children}`:

```tsx
import { CaptchaGate } from "@/components/security/captcha-gate"

// inside JSX, change:
<main ...>{children}</main>
// to:
<main ...>
  <CaptchaGate>{children}</CaptchaGate>
</main>
```

**Step 3: Same for `RunwayLayout`**

Same import and same wrapping in `src/app/runway/layout.tsx`.

**Step 4: Verify no TypeScript errors**

```bash
cd landingpage-code/new-landing-ir && npx tsc --noEmit 2>&1 | grep -E "captcha|CaptchaGate"
```

Expected: no errors.

---

## Task 5: BotD — install and add global bot detection provider

BotD (`@fingerprintjs/botd`) detects headless browsers (Puppeteer, Playwright, etc.) purely client-side. Run it in the root layout so it covers all pages — detection is fast (~50 ms) and cheap.

**Files:**
- Create: `src/components/security/bot-detection-provider.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Install BotD**

```bash
cd landingpage-code/new-landing-ir && npm install @fingerprintjs/botd
```

**Step 2: Create `src/components/security/bot-detection-provider.tsx`**

```tsx
"use client"

import { useEffect } from "react"
import { load } from "@fingerprintjs/botd"

// Singleton flag — only run once per page load
let botdChecked = false

export function BotDetectionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (botdChecked) return
    botdChecked = true

    load()
      .then((botd) => botd.detect())
      .then((result) => {
        if (result.bot) {
          // Silent block: mark session and suppress all future API calls
          sessionStorage.setItem("bot_blocked", "1")
        }
      })
      .catch(() => {
        // BotD failure is non-fatal — do not block on error
      })
  }, [])

  return <>{children}</>
}
```

**Step 3: Modify `src/lib/request-rate-limit.ts` — add bot block helper**

Add the following export at the bottom of `src/lib/request-rate-limit.ts`:

> Note: This is a server-side file (`import "server-only"`). The bot check for client-side fetch is handled separately in the fetch wrapper (Task 6). This file change is not needed — skip to Step 4.

**Step 4: Create `src/lib/bot-guard.ts` — client-side fetch guard**

Create: `src/lib/bot-guard.ts`

```ts
/**
 * Returns true if the current session has been flagged as a bot.
 * Call this before any client-side fetch to silently suppress it.
 */
export function isBotBlocked(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem("bot_blocked") === "1"
}
```

**Step 5: Add `BotDetectionProvider` to root layout**

In `src/app/layout.tsx`:

```tsx
import { BotDetectionProvider } from "@/components/security/bot-detection-provider"

// Wrap children in RootLayout:
<LangProvider>
  <BotDetectionProvider>
    {children}
  </BotDetectionProvider>
</LangProvider>
```

**Step 6: Verify TypeScript**

```bash
cd landingpage-code/new-landing-ir && npx tsc --noEmit 2>&1 | grep -E "botd|BotDetection"
```

Expected: no errors.

---

## Task 6: DELBOT-Mouse — mouse-movement bot scorer + silent block on Discover/Runway

DELBOT-Mouse (https://github.com/chrisgdt/DELBOT-Mouse) identifies bots by analysing mouse movement features: velocity, acceleration, angle changes, and straightness. We collect events for 5 seconds after first mouse move, compute the same features used in the DELBOT paper, score them with a simple heuristic classifier, and silently block if the score exceeds the threshold.

**Files:**
- Create: `src/lib/mouse-bot-scorer.ts`
- Create: `src/components/security/mouse-bot-detector.tsx`
- Modify: `src/app/discover/layout.tsx`
- Modify: `src/app/runway/layout.tsx`

**Step 1: Create `src/lib/mouse-bot-scorer.ts`**

```ts
export interface MouseSample {
  x: number
  y: number
  t: number
}

export interface MouseFeatures {
  meanVelocity: number
  stdVelocity: number
  meanAcceleration: number
  straightness: number   // displacement / path-length  (1 = perfectly straight)
  angleChanges: number   // mean absolute direction change in radians
}

export function extractFeatures(samples: MouseSample[]): MouseFeatures | null {
  if (samples.length < 5) return null

  const velocities: number[] = []
  const accelerations: number[] = []
  const angles: number[] = []

  for (let i = 1; i < samples.length; i++) {
    const dx = samples[i].x - samples[i - 1].x
    const dy = samples[i].y - samples[i - 1].y
    const dt = Math.max(samples[i].t - samples[i - 1].t, 1)
    const dist = Math.hypot(dx, dy)
    velocities.push(dist / dt)
    angles.push(Math.atan2(dy, dx))
  }

  for (let i = 1; i < velocities.length; i++) {
    accelerations.push(Math.abs(velocities[i] - velocities[i - 1]))
  }

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
  const std = (arr: number[], m: number) =>
    Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length)

  const mv = mean(velocities)

  const angleChanges = angles.slice(1).map((a, i) => {
    let delta = Math.abs(a - angles[i])
    if (delta > Math.PI) delta = 2 * Math.PI - delta
    return delta
  })

  const first = samples[0]
  const last = samples[samples.length - 1]
  const displacement = Math.hypot(last.x - first.x, last.y - first.y)
  const pathLength = velocities.reduce((a, b, i) => {
    const dt = Math.max(samples[i + 1].t - samples[i].t, 1)
    return a + b * dt
  }, 0)
  const straightness = pathLength > 0 ? Math.min(displacement / pathLength, 1) : 1

  return {
    meanVelocity: mv,
    stdVelocity: std(velocities, mv),
    meanAcceleration: accelerations.length ? mean(accelerations) : 0,
    straightness,
    angleChanges: angleChanges.length ? mean(angleChanges) : 0,
  }
}

/**
 * Returns a bot probability score in [0, 1].
 * Threshold for blocking: >= 0.7 (configurable via BOT_SCORE_THRESHOLD).
 *
 * Heuristics based on DELBOT-Mouse paper features:
 *  - Real users have varied velocity (high std) and irregular angle changes
 *  - Bots move in straight lines at constant speed
 */
export function scoreBotProbability(f: MouseFeatures): number {
  let score = 0

  // Very high straightness → bot-like
  if (f.straightness > 0.97) score += 0.35

  // Near-zero velocity variance → constant speed → bot-like
  const velocityCV = f.meanVelocity > 0 ? f.stdVelocity / f.meanVelocity : 0
  if (velocityCV < 0.1) score += 0.35

  // Very low angle changes → straight-line movement → bot-like
  if (f.angleChanges < 0.05) score += 0.20

  // Near-zero acceleration → no natural hesitation → bot-like
  if (f.meanAcceleration < 0.01) score += 0.10

  return Math.min(score, 1)
}

export const BOT_SCORE_THRESHOLD = 0.7
```

**Step 2: Create `src/components/security/mouse-bot-detector.tsx`**

```tsx
"use client"

import { useEffect, useRef } from "react"
import { extractFeatures, scoreBotProbability, BOT_SCORE_THRESHOLD, type MouseSample } from "@/lib/mouse-bot-scorer"

const COLLECTION_WINDOW_MS = 5000  // collect 5 seconds of events
const MIN_SAMPLES = 20             // need at least 20 points to score

export function MouseBotDetector() {
  const samples = useRef<MouseSample[]>([])
  const startTime = useRef<number | null>(null)
  const done = useRef(false)

  useEffect(() => {
    // Already blocked by BotD or a previous DELBOT check
    if (sessionStorage.getItem("bot_blocked") === "1") return

    function onMove(e: MouseEvent) {
      if (done.current) return

      const now = Date.now()

      if (startTime.current === null) {
        startTime.current = now
      }

      samples.current.push({ x: e.clientX, y: e.clientY, t: now })

      if (now - startTime.current >= COLLECTION_WINDOW_MS) {
        done.current = true
        analyse()
      }
    }

    function analyse() {
      window.removeEventListener("mousemove", onMove)

      if (samples.current.length < MIN_SAMPLES) return

      const features = extractFeatures(samples.current)
      if (!features) return

      const score = scoreBotProbability(features)
      if (score >= BOT_SCORE_THRESHOLD) {
        sessionStorage.setItem("bot_blocked", "1")
      }
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  return null
}
```

**Step 3: Add `MouseBotDetector` to Discover layout**

In `src/app/discover/layout.tsx`:

```tsx
import { MouseBotDetector } from "@/components/security/mouse-bot-detector"

// Inside DiscoverLayout JSX, add before or after CaptchaGate:
<>
  <MouseBotDetector />
  <Header />
  <main ...>
    <CaptchaGate>{children}</CaptchaGate>
  </main>
  <Footer />
</>
```

**Step 4: Same for Runway layout**

Same import and add `<MouseBotDetector />` inside `RunwayLayout`.

**Step 5: Guard client-side fetch calls against bot block**

In any client component that calls the Next.js API routes directly (e.g. `discover-page-client.tsx`, `runway-page-client.tsx`), import `isBotBlocked` and guard the fetch:

```ts
import { isBotBlocked } from "@/lib/bot-guard"

// Before any fetch:
if (isBotBlocked()) return  // silently abort
```

Find the fetch calls in:
- `src/components/discover/discover-page-client.tsx`
- `src/components/runway/runway-page-client.tsx`
- `src/components/runway/collection-detail-client.tsx`

Add the guard at the top of each function that calls fetch.

**Step 6: Verify TypeScript**

```bash
cd landingpage-code/new-landing-ir && npx tsc --noEmit 2>&1 | grep -E "mouse|bot|scorer"
```

Expected: no errors.

---

## Environment variables summary

Add to `.env.local` and your production secrets:

```
# Cap captcha
CAP_SECRET=<openssl rand -hex 32>
NEXT_PUBLIC_CAP_API_URL=https://yourdomain.com/api/captcha
```

`CAP_SECRET` must never be committed. `NEXT_PUBLIC_CAP_API_URL` should point to your deployed Next.js instance (same origin works fine since the route is `/api/captcha`).

---

## Commit order

```
feat: add rate limiting to FastAPI runway endpoints (Task 1)
feat: add rate limiting to Next.js runway API routes (Task 2)
feat: add cap captcha verify API route (Task 3)
feat: add CaptchaGate component to discover and runway layouts (Task 4)
feat: add BotD global bot detection provider (Task 5)
feat: add DELBOT-style mouse movement bot scorer (Task 6)
```
