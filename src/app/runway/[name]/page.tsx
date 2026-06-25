export const dynamic = "force-dynamic"

import { notFound, permanentRedirect } from "next/navigation"

import { encodeId } from "@/lib/id-hash"
import { getLandingEntities } from "@/lib/runway-api"
import { slugify } from "@/lib/slugify"

export default async function RunwayEntityRedirect({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const targetSlug = slugify(decodeURIComponent(name))

  const entities = await getLandingEntities()

  // First match wins — brands and press offices in the order returned by the API
  const match = entities.find((e) => slugify(e.name) === targetSlug)
  if (!match) notFound()

  const prefix = match.type === "press_officer" ? "press-offices" : "brands"
  permanentRedirect(`/runway/${prefix}/${encodeId(match.id)}`)
}
