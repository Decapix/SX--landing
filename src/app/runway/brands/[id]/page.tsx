export const dynamic = "force-dynamic"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PresignedImage } from "@/components/assets/PresignedImage"
import { extractS3Key } from "@/components/assets/s3Utils"
import { RunwayCollectionCard } from "@/components/runway/collection-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/shadcn-button"
import { Card, CardContent } from "@/components/ui/card"
import { getRunwayBrandDetail } from "@/lib/runway-api"
import { decodeId, encodeId } from "@/lib/id-hash"

export default async function RunwayBrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const data = await getRunwayBrandDetail(decodeId(id))
    const { brand } = data

    return (
      <section className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/runway">
            <ArrowLeft className="h-4 w-4" />
            Back to collections
          </Link>
        </Button>

        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-5 p-6">
            <div className="flex items-center gap-4">
              {brand.logo ? (
                <PresignedImage
                  s3Key={extractS3Key(brand.logo.key || brand.logo.url)}
                  alt={brand.name}
                  className="h-20 w-20 rounded-lg border bg-white object-contain p-2"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-muted text-2xl font-semibold">
                  {brand.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Brand</p>
                <h1 className="font-blisstwin text-4xl tracking-tight">{brand.name}</h1>
                {brand.press_office ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Managed by{" "}
                    <Link
                      href={`/runway/press-offices/${encodeId(brand.press_office.id)}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {brand.press_office.name}
                    </Link>
                  </p>
                ) : null}
                <p className="mt-1 text-sm text-muted-foreground">
                  {brand.city ?? "Unknown city"}
                  {brand.country ? `, ${brand.country}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {brand.is_emerging ? <Badge variant="secondary">Emerging brand</Badge> : <Badge variant="outline">Established</Badge>}
              <Badge variant="outline">{data.total} collections</Badge>
            </div>
          </CardContent>
        </Card>

        {data.collections.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-sm text-muted-foreground">No public collection is available for this brand.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.collections.map((collection) => (
              <RunwayCollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </section>
    )
  } catch {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-destructive">This brand is unavailable or could not be loaded.</CardContent>
      </Card>
    )
  }
}
