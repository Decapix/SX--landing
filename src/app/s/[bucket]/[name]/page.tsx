export const dynamic = "force-dynamic"

import { notFound, permanentRedirect } from "next/navigation"

import { resolveStylistByShortUrl } from "@/lib/runway-api"

const BUCKET_RE = /^(\d{4})-(.+)$/

export default async function ShortStylistRedirect({
  params,
}: {
  params: Promise<{ bucket: string; name: string }>
}) {
  const { bucket, name } = await params

  const match = BUCKET_RE.exec(bucket)
  if (!match) notFound()
  const yearStr = match[1] as string
  const citySlug = match[2] as string
  const year = Number(yearStr)
  if (!Number.isFinite(year)) notFound()

  const result = await resolveStylistByShortUrl(year, citySlug, name)
  if (!result) notFound()

  permanentRedirect(`/discover/stylist/${result.encoded_id}`)
}
