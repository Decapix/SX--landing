import "server-only"

import { buildLandingBackendStaticHeaders, buildLandingBackendUrl } from "@/lib/landing-backend"

export type LandingVoteOption = {
  id: string
  title: string
  link: string | null
  images: Array<{
    key: string
    url: string
    expires_in: number
  }>
}

export type LandingVoteSession = {
  id: string
  title: string
  description: string | null
  starts_at: string | null
  ends_at: string | null
  options: LandingVoteOption[]
}

export async function getActiveVoteSession(): Promise<LandingVoteSession | null> {
  const response = await fetch(
    buildLandingBackendUrl("api/landing-page/vote-session/active"),
    {
      method: "GET",
      headers: buildLandingBackendStaticHeaders(),
      cache: "no-store",
    },
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Vote API request failed (${response.status})`)
  }

  return response.json()
}
