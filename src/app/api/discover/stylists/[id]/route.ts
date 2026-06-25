import { NextResponse } from "next/server"

import { buildLandingBackendHeaders, buildLandingBackendUrl } from "@/lib/landing-backend"
import { decodeId } from "@/lib/id-hash"
import { isRateLimited } from "@/lib/request-rate-limit"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (isRateLimited(request, "discover-stylist-detail", 90)) {
      return NextResponse.json({ detail: "Too many requests" }, { status: 429 })
    }

    const { id } = await params
    const decodedId = decodeId(id)
    const upstream = await fetch(
      buildLandingBackendUrl(`api/landing-page/discover/stylists/${decodedId}`),
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
