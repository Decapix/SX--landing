import "server-only"
import { NextResponse } from "next/server"
import { validateToken } from "@/lib/cap-stateless"

// POST /api/captcha — validate a previously redeemed token (for form submissions).
// The widget flow uses /api/captcha/challenge and /api/captcha/redeem instead.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = validateToken(body.token)
    if (!result.success) {
      return NextResponse.json({ success: false }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }
}
