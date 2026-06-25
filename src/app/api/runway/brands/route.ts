import { NextResponse } from "next/server"

import { buildLandingBackendStaticHeaders, buildLandingBackendUrl } from "@/lib/landing-backend"
import { isRateLimited } from "@/lib/request-rate-limit"

export async function GET(request: Request) {
  try {
    if (isRateLimited(request, "runway-brands", 100)) {
      return NextResponse.json([], { status: 429 })
    }

    const upstream = await fetch(
      buildLandingBackendUrl("api/landing-page/runway/brands"),
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
        "Cache-Control": "public, max-age=60, s-maxage=120",
      },
    })
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
