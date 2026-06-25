import "server-only"

const backendBase = process.env.BACKEND_APP_URL
const communicationToken = process.env.UNIQUE_TOKEN_COMMUNICATION

export function buildLandingBackendUrl(path: string): string {
  if (!backendBase) {
    throw new Error("BACKEND_APP_URL is not configured")
  }

  const normalized = backendBase.endsWith("/") ? backendBase : `${backendBase}/`
  const clean = path.startsWith("/") ? path.slice(1) : path
  return `${normalized}${clean}`
}

export function buildLandingBackendHeaders(request: Request): HeadersInit {
  if (!communicationToken) {
    throw new Error("UNIQUE_TOKEN_COMMUNICATION is not configured")
  }

  const forwardedFor = request.headers.get("x-forwarded-for")

  return {
    Accept: "application/json",
    Authorization: `Bearer ${communicationToken}`,
    "User-Agent": "inside-runway-landing",
    ...(forwardedFor ? { "X-Forwarded-For": forwardedFor } : {}),
  }
}

export function buildLandingBackendStaticHeaders(): HeadersInit {
  if (!communicationToken) {
    throw new Error("UNIQUE_TOKEN_COMMUNICATION is not configured")
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${communicationToken}`,
    "User-Agent": "inside-runway-landing",
  }
}
