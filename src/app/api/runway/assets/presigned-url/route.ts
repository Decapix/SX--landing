import { NextResponse } from "next/server"

import { buildLandingBackendStaticHeaders, buildLandingBackendUrl } from "@/lib/landing-backend"
import { isRateLimited } from "@/lib/request-rate-limit"

export async function GET(request: Request) {
  try {
    if (isRateLimited(request, "runway-presigned", 100)) {
      return NextResponse.json({ detail: "Too many requests" }, { status: 429 })
    }
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")
    const expiration = searchParams.get("expiration") || "600"

    if (!key) {
      return NextResponse.json({ detail: "Missing key" }, { status: 400 })
    }

    const headers = buildLandingBackendStaticHeaders()
    const query = `key=${encodeURIComponent(key)}&expiration=${encodeURIComponent(expiration)}`
    const primary = buildLandingBackendUrl(`api/landing-page/runway/assets/presigned-url?${query}`)
    const legacy = buildLandingBackendUrl(`api/landing-page/assets/presigned-url?${query}`)

    let response = await fetch(primary, { method: "GET", headers, cache: "no-store" })
    if (response.status === 404) {
      response = await fetch(legacy, { method: "GET", headers, cache: "no-store" })
    }

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ detail: text || "Unable to sign URL" }, { status: response.status })
    }

    const payload = await response.json()
    return NextResponse.json(payload)
  } catch {
    return NextResponse.json({ detail: "Internal error" }, { status: 500 })
  }
}
