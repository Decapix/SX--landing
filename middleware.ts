import { NextResponse, type NextRequest } from "next/server"

type Bucket = {
  count: number
  resetAt: number
}

const WINDOW_MS = 60_000
const LIMIT_PER_WINDOW = 90
const buckets = new Map<string, Bucket>()

const blockedAgents = [
  "python-requests",
  "curl/",
  "wget/",
  "scrapy",
  "aiohttp",
  "httpclient",
  "postmanruntime",
  "selenium",
  "playwright",
  "headless",
]

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown"
  }
  return request.headers.get("x-real-ip") || "unknown"
}

function isBlockedUserAgent(request: NextRequest): boolean {
  const ua = (request.headers.get("user-agent") || "").toLowerCase()
  if (!ua) {
    return true
  }
  return blockedAgents.some((token) => ua.includes(token))
}

function isRateLimited(request: NextRequest): boolean {
  const now = Date.now()
  const ip = getClientIp(request)
  const key = `${ip}:runway`
  const current = buckets.get(key)

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  if (current.count >= LIMIT_PER_WINDOW) {
    return true
  }

  current.count += 1
  buckets.set(key, current)
  return false
}

function applyRunwayHeaders(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-Runway-Guard", "enabled")
}

export function middleware(request: NextRequest) {
  // Soft Mode: Collections (/runway) and posts (/discover) are disabled — send
  // any direct hit back to the home page.
  const softMode = process.env.NEXT_PUBLIC_SITE_MODE !== "full"
  const { pathname } = request.nextUrl
  if (softMode && (pathname.startsWith("/runway") || pathname.startsWith("/discover"))) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (isBlockedUserAgent(request)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  if (isRateLimited(request)) {
    const response = NextResponse.json({ message: "Too many requests" }, { status: 429 })
    response.headers.set("Retry-After", "60")
    applyRunwayHeaders(response)
    return response
  }

  const response = NextResponse.next()
  applyRunwayHeaders(response)
  return response
}

export const config = {
  matcher: [
    "/runway",
    "/runway/:path*",
    "/discover",
    "/discover/:path*",
    "/s/:path*",
  ],
}
