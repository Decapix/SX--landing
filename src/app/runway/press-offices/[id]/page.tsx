export const dynamic = "force-dynamic"

import Link from "next/link"
import { ArrowLeft, Building2 } from "lucide-react"

import { PresignedImage } from "@/components/assets/PresignedImage"
import { extractS3Key } from "@/components/assets/s3Utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/shadcn-button"
import { Card, CardContent } from "@/components/ui/card"
import { decodeId, encodeId } from "@/lib/id-hash"
import { getRunwayPressOfficeDetail } from "@/lib/runway-api"

export default async function RunwayPressOfficeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const data = await getRunwayPressOfficeDetail(decodeId(id))

    return (
      <section className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/runway">
            <ArrowLeft className="h-4 w-4" />
            Back to runway
          </Link>
        </Button>

        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-5 p-6">
            <div className="flex items-center gap-4">
              {data.logo ? (
                <PresignedImage
                  s3Key={extractS3Key(data.logo.key || data.logo.url)}
                  alt={data.name}
                  className="h-20 w-20 rounded-lg border bg-white object-contain p-2"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-muted">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Press office
                </p>
                <h1 className="font-blisstwin text-4xl tracking-tight">{data.name}</h1>
              </div>
            </div>
            <Badge variant="outline">{data.brands_count} brands managed</Badge>
          </CardContent>
        </Card>

        {data.brands.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-sm text-muted-foreground">
              This press office has not published any brands yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/runway/brands/${encodeId(brand.id)}`}
                className="group block"
              >
                <Card className="transition-all hover:shadow-md group-hover:scale-[1.01]">
                  <CardContent className="p-5">
                    <div className="mb-4 flex h-24 items-center justify-center rounded-md bg-muted">
                      {brand.logo ? (
                        <PresignedImage
                          s3Key={extractS3Key(brand.logo.key || brand.logo.url)}
                          alt={brand.name}
                          className="max-h-full max-w-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-3xl font-semibold text-muted-foreground">
                          {brand.name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium group-hover:underline">
                      {brand.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {brand.city ?? "Unknown city"}
                      {brand.country ? `, ${brand.country}` : ""}
                    </p>
                    <Badge variant="outline" className="mt-3 text-xs">
                      {brand.collections_count} collections
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    )
  } catch {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-destructive">
          This press office is unavailable or could not be loaded.
        </CardContent>
      </Card>
    )
  }
}
