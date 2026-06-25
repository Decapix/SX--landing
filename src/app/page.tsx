import { getRunwayCollections } from "@/lib/runway-api"
import { getActiveVoteSession } from "@/lib/vote-api"
import { HomePageClient } from "./landingpage"
import type { RunwayCollectionCard } from "@/lib/runway-api"
import type { LandingVoteSession } from "@/lib/vote-api"

export default async function Home() {
  let collections: RunwayCollectionCard[] = []
  let voteSession: LandingVoteSession | null = null

  try {
    const data = await getRunwayCollections()
    collections = data.items.slice(0, 14)
  } catch {
    // Carousel simply won't render if fetch fails
  }

  try {
    voteSession = await getActiveVoteSession()
  } catch {
    // Vote section simply won't render if fetch fails
  }

  return <HomePageClient collections={collections} voteSession={voteSession} />
}
