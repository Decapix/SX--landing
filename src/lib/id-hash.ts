/**
 * URL-safe base64 encoding of entity ID strings for public-facing URLs.
 * Prevents exposing raw MongoDB ObjectIds (which encode creation timestamps).
 * Works in both Node.js (18+) and browser environments.
 *
 * encodeId("507f1f77bcf86cd799439011") → "NTA3ZjFmNzdiY2Y4NmNkNzk5NDM5MDEx" (32 chars)
 * decodeId("NTA3ZjFmNzdiY2Y4NmNkNzk5NDM5MDEx") → "507f1f77bcf86cd799439011"
 */

const OBJECT_ID_RE = /^[0-9a-f]{24}$/i

export function encodeId(id: string): string {
  return btoa(id).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

export function decodeId(encoded: string): string {
  // Already a raw MongoDB ObjectId — skip decoding
  if (OBJECT_ID_RE.test(encoded)) return encoded.toLowerCase()

  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/")
    const pad = base64.length % 4
    const padded = base64 + (pad === 2 ? "==" : pad === 3 ? "=" : "")
    const decoded = atob(padded)
    // Only return if the result is a valid ObjectId
    if (OBJECT_ID_RE.test(decoded)) return decoded
  } catch {
    // fall through
  }

  return encoded
}
