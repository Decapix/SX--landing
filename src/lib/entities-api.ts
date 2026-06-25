import "server-only"

import { buildLandingBackendStaticHeaders } from "@/lib/landing-backend"
import type { RunwayImage } from "@/lib/runway-api"

export type LandingEntityItem = {
  id: string
  name: string
  type: "brand" | "press_officer"
  profile_image: RunwayImage | null
}

const backendBase = process.env.BACKEND_APP_URL

function buildBackendUrl(path: string): string {
  if (!backendBase) {
    throw new Error("BACKEND_APP_URL is not configured")
  }
  const normalized = backendBase.endsWith("/") ? backendBase : `${backendBase}/`
  const clean = path.startsWith("/") ? path.slice(1) : path
  return `${normalized}${clean}`
}

async function fetchEntities(path: string): Promise<LandingEntityItem[]> {
  const url = buildBackendUrl(path)
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: buildLandingBackendStaticHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Entities API request failed (${response.status})`)
  }

  return (await response.json()) as LandingEntityItem[]
}

export async function getLandingEntities(): Promise<LandingEntityItem[]> {
  try {
    return await fetchEntities("api/landing-page/entities")
  } catch {
    // Backward compatibility if entities is still nested under runway.
    return fetchEntities("api/landing-page/runway/entities")
  }
}
