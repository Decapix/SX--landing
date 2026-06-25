import { StylistDetailClient } from "@/components/discover/stylist-detail-client"

export default async function DiscoverStylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <StylistDetailClient encodedId={id} />
}
