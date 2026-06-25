import "server-only"
import { NextResponse } from "next/server"
import { createChallenge } from "@/lib/cap-stateless"

// Widget calls POST /api/captcha/challenge to receive a PoW challenge token.
export async function POST() {
  const challenge = createChallenge()
  return NextResponse.json(challenge)
}
