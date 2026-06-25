import { NextResponse } from "next/server"

import { buildLandingBackendHeaders, buildLandingBackendUrl } from "@/lib/landing-backend"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params
    const body = await request.json()

    if (!body?.optionId) {
      return NextResponse.json(
        { success: false, message: "Missing optionId" },
        { status: 400 },
      )
    }

    const upstream = await fetch(
      buildLandingBackendUrl(`api/landing-page/vote-session/${sessionId}/vote`),
      {
        method: "POST",
        headers: {
          ...buildLandingBackendHeaders(request),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          option_id: body.optionId,
          client: body.client ?? {},
        }),
        cache: "no-store",
      },
    )

    const payload = await upstream.text()
    return new NextResponse(payload, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return NextResponse.json({ detail: "Internal error" }, { status: 500 })
  }
}
