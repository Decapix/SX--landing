// Backend not connected yet — coming soon. The redesigned landing is fully
// presentational, so we render it with empty data for now.
// When the backend is ready, uncomment the imports + fetch below and swap the
// final return for the commented one.

// import { getRunwayCollections } from "@/lib/runway-api"
// import { getActiveVoteSession } from "@/lib/vote-api"
// import type { RunwayCollectionCard } from "@/lib/runway-api"
// import type { LandingVoteSession } from "@/lib/vote-api"
import { HomePageClient } from "./landingpage"

export default function Home() {
  // --- Backend wiring (coming soon) ---------------------------------------
  // let collections: RunwayCollectionCard[] = []
  // let voteSession: LandingVoteSession | null = null
  // try {
  //   const data = await getRunwayCollections()
  //   collections = data.items.slice(0, 14)
  // } catch {
  //   // Carousel simply won't render if fetch fails
  // }
  // try {
  //   voteSession = await getActiveVoteSession()
  // } catch {
  //   // Vote section simply won't render if fetch fails
  // }
  // return <HomePageClient collections={collections} voteSession={voteSession} />
  // ------------------------------------------------------------------------

  return <HomePageClient collections={[]} voteSession={null} />
}
