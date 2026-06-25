import "server-only"

const buckets = new Map<string, number[]>()
const WINDOW_MS = 60_000

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown"
  }
  return "unknown"
}

export function isRateLimited(request: Request, scope: string, limit: number): boolean {
  const now = Date.now()
  const key = `${scope}:${getClientIp(request)}`
  const bucket = buckets.get(key) ?? []
  const fresh = bucket.filter((timestamp) => now - timestamp <= WINDOW_MS)

  if (fresh.length >= limit) {
    buckets.set(key, fresh)
    return true
  }

  fresh.push(now)
  buckets.set(key, fresh)
  return false
}
