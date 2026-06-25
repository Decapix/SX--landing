import "server-only"
import { NextResponse } from "next/server"
import { redeemChallenge } from "@/lib/cap-stateless"

// Widget calls POST /api/captcha/redeem with { token, solutions } after solving the PoW.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await redeemChallenge(body.token, body.solutions)
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 })
  }
}
