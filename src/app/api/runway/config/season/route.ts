import { NextResponse } from "next/server"

import { buildLandingBackendStaticHeaders, buildLandingBackendUrl } from "@/lib/landing-backend"
import { isRateLimited } from "@/lib/request-rate-limit"

export async function GET(request: Request) {
  try {
    if (isRateLimited(request, "runway-season", 200)) {
      return NextResponse.json({ items: [] }, { status: 429 })
    }
    const { searchParams } = new URL(request.url)
    const language = searchParams.get("language") || "en"

    const response = await fetch(buildLandingBackendUrl(`api/landing-page/runway/config/season?language=${encodeURIComponent(language)}`), {
      method: "GET",
      headers: buildLandingBackendStaticHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    const payload = await response.json()
    return NextResponse.json(payload)
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 })
  }
}
