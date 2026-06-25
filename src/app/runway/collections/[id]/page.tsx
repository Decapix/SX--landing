export const dynamic = "force-dynamic"

import { CollectionDetailClient } from "@/components/runway/collection-detail-client"
import { Card, CardContent } from "@/components/ui/card"
import { getRunwayCollectionDetail } from "@/lib/runway-api"
import { decodeId } from "@/lib/id-hash"

export default async function RunwayCollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const data = await getRunwayCollectionDetail(decodeId(id))
    return <CollectionDetailClient data={data} />
  } catch {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-destructive">
          This collection is unavailable or could not be loaded.
        </CardContent>
      </Card>
    )
  }
}
