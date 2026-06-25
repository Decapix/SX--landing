import { NextResponse } from "next/server"

import { buildLandingBackendStaticHeaders, buildLandingBackendUrl } from "@/lib/landing-backend"
import { isRateLimited } from "@/lib/request-rate-limit"

export async function GET(request: Request) {
  try {
    if (isRateLimited(request, "runway-collections", 100)) {
      return NextResponse.json({ detail: "Too many requests" }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const query = new URLSearchParams()

    for (const key of ["limit", "offset", "season", "genre", "brand_id", "country", "is_emerging", "language"]) {
      const value = searchParams.get(key)
      if (value) {
        query.set(key, value)
      }
    }

    const upstream = await fetch(
      buildLandingBackendUrl(`api/landing-page/runway/collections?${query.toString()}`),
      {
        method: "GET",
        headers: buildLandingBackendStaticHeaders(),
        cache: "no-store",
      },
    )

    const payload = await upstream.text()
    return new NextResponse(payload, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
        "Cache-Control": "public, max-age=30, s-maxage=60",
      },
    })
  } catch {
    return NextResponse.json({ detail: "Internal error" }, { status: 500 })
  }
}
