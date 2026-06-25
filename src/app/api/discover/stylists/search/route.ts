import { NextResponse } from "next/server"

import { buildLandingBackendHeaders, buildLandingBackendUrl } from "@/lib/landing-backend"
import { isRateLimited } from "@/lib/request-rate-limit"

export async function GET(request: Request) {
  try {
    if (isRateLimited(request, "discover-stylist-search", 60)) {
      return NextResponse.json({ detail: "Too many requests" }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json([], { status: 200 })
    }

    const upstream = await fetch(
      buildLandingBackendUrl(`api/landing-page/discover/stylists/search?q=${encodeURIComponent(query)}`),
      {
        method: "GET",
        headers: buildLandingBackendHeaders(request),
        cache: "no-store",
      },
    )

    const payload = await upstream.text()
    return new NextResponse(payload, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "Cache-Control": "private, no-store, max-age=0",
      },
    })
  } catch {
    return NextResponse.json({ detail: "Internal error" }, { status: 500 })
  }
}
