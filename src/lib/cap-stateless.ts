import "server-only"
import crypto from "node:crypto"

const SECRET = process.env.CAP_SECRET ?? "dev-secret-change-in-production"

const CHALLENGE_COUNT = 50
const CHALLENGE_SIZE = 32
const CHALLENGE_DIFFICULTY = 4
const CHALLENGE_TTL_MS = 600_000 // 10 minutes

// ── PRNG ─────────────────────────────────────────────────────────────────────
// Exact copy of Cap's prng so widget and server agree on salts/targets.
function prng(seed: string, length: number): string {
  function fnv1a(str: string) {
    let hash = 2166136261
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i)
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
    }
    return hash >>> 0
  }

  let state = fnv1a(seed)
  let result = ""

  function next() {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return state >>> 0
  }

  while (result.length < length) {
    result += next().toString(16).padStart(8, "0")
  }
  return result.substring(0, length)
}

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str))
  return Buffer.from(buf).toString("hex")
}

// ── Token helpers ─────────────────────────────────────────────────────────────

function sign(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("hex")
}

function encodeToken(payload: object): string {
  const json = JSON.stringify(payload)
  return Buffer.from(json).toString("base64url") + "." + sign(json)
}

function decodeToken<T>(token: string): T | null {
  const dot = token.indexOf(".")
  if (dot === -1) return null

  const b64 = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  let json: string
  try {
    json = Buffer.from(b64, "base64url").toString()
  } catch {
    return null
  }

  const expected = sign(json)
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return null
    }
  } catch {
    return null
  }

  try {
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

interface ChallengeParams { c: number; s: number; d: number }

export function createChallenge() {
  const nonce = crypto.randomBytes(16).toString("hex")
  const params: ChallengeParams = {
    c: CHALLENGE_COUNT,
    s: CHALLENGE_SIZE,
    d: CHALLENGE_DIFFICULTY,
  }
  const expires = Date.now() + CHALLENGE_TTL_MS

  // The token is a self-contained signed blob. The widget echoes it back unchanged,
  // so we derive all challenge data from it without any server-side storage.
  const token = encodeToken({ nonce, ...params, expires })

  return { challenge: params, token, expires }
}

export async function redeemChallenge(
  token: string,
  solutions: unknown,
): Promise<{ success: boolean; error?: string; token?: string; expires?: number }> {
  // 1. Validate inputs
  if (
    !token ||
    typeof token !== "string" ||
    !Array.isArray(solutions) ||
    (solutions as unknown[]).some((s) => typeof s !== "number")
  ) {
    return { success: false, error: "Invalid body" }
  }

  // 2. Verify signed token
  const payload = decodeToken<ChallengeParams & { nonce: string; expires: number }>(token)
  if (!payload) return { success: false, error: "Invalid token" }
  if (payload.expires < Date.now()) return { success: false, error: "Challenge expired" }

  // 3. Reconstruct challenges — identical formula to Cap + widget
  let i = 0
  const challenges = Array.from({ length: payload.c }, () => {
    i++
    return [prng(`${token}${i}`, payload.s), prng(`${token}${i}d`, payload.d)] as [string, string]
  })

  // 4. Verify solutions
  const nums = solutions as number[]
  const hashes = await Promise.all(
    challenges.map(([salt, target], idx) =>
      sha256(salt + nums[idx]).then((h) => [h, target] as [string, string]),
    ),
  )
  const isValid = hashes.every(([h, target]) => h.startsWith(target))
  if (!isValid) return { success: false, error: "Invalid solution" }

  // 5. Issue a verified token (signed, stateless — no DB needed)
  const verNonce = crypto.randomBytes(15).toString("hex")
  const verExpires = Date.now() + 20 * 60 * 1000
  const verToken = encodeToken({ nonce: verNonce, expires: verExpires })

  return { success: true, token: verToken, expires: verExpires }
}

export function validateToken(token: unknown): { success: boolean } {
  if (!token || typeof token !== "string") return { success: false }
  const payload = decodeToken<{ nonce: string; expires: number }>(token)
  if (!payload || payload.expires < Date.now()) return { success: false }
  return { success: true }
}
