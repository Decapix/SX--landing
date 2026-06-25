import Link from "next/link"

import { PresignedImage } from "@/components/assets/PresignedImage"
import { extractS3Key } from "@/components/assets/s3Utils"
import { encodeId } from "@/lib/id-hash"
import type { RunwayCollectionCard as RunwayCollectionCardType } from "@/lib/runway-api"

export function RunwayCollectionCard({ collection }: { collection: RunwayCollectionCardType }) {
  return (
    <Link href={`/runway/collections/${encodeId(collection.id)}`} className="group block">
      <article className="space-y-1.5">
        <div className="relative aspect-[3/4.35] overflow-hidden rounded-[2rem] bg-black/5">
          {collection.cover_image ? (
            <PresignedImage
              s3Key={extractS3Key(collection.cover_image.key || collection.cover_image.url)}
              alt={collection.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
          )}

          {collection.brand.is_emerging ? (
            <span className="absolute right-3 top-3 rounded-full bg-white/92 px-3 py-1.5 text-xs text-black shadow-sm">
              Emerging
            </span>
          ) : null}
        </div>

        <div className="space-y-0 px-0.5">
          <h2 className="text-base font-medium tracking-tight text-foreground">{collection.brand.name}</h2>
          <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
            {collection.season_label || collection.name}
          </p>
        </div>
      </article>
    </Link>
  )
}
