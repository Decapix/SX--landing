import { PresignedImage } from "@/components/assets/PresignedImage";
import { extractS3Key } from "@/components/assets/s3Utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RunwayLook } from "@/lib/runway-api";

export function RunwayLookBlock({ look }: { look: RunwayLook }) {
  return (
    <Card className="overflow-hidden border-border/70">
      <CardHeader className="p-0">
        <div className="grid grid-cols-1 gap-1 bg-muted md:grid-cols-2">
          {(look.images.length > 0 ? look.images : [])
            .slice(0, 2)
            .map((image) => (
              <PresignedImage
                key={image.key}
                s3Key={extractS3Key(image.key || image.url)}
                alt={look.name}
                className="aspect-[4/5] w-full object-cover"
              />
            ))}
          {look.images.length === 0 ? (
            <div className="col-span-full flex aspect-[4/3] items-center justify-center text-sm text-muted-foreground">
              No look image
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{look.name}</CardTitle>
            {look.description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {look.description}
              </p>
            ) : null}
          </div>
          <Badge variant="outline">{look.article_count} articles</Badge>
        </div>

        {look.articles.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No article available in this look.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {look.articles.map((article) => (
              <article
                key={article.id}
                className="rounded-lg border bg-background p-3"
              >
                <div className="mb-3 aspect-square overflow-hidden rounded-md bg-muted">
                  {article.images[0] ? (
                    <PresignedImage
                      s3Key={extractS3Key(
                        article.images[0].key || article.images[0].url,
                      )}
                      alt={article.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium">{article.name}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {article.category ? (
                    <Badge variant="secondary">{article.category}</Badge>
                  ) : null}
                  {article.type_article ? (
                    <Badge variant="secondary">{article.type_article}</Badge>
                  ) : null}
                  {article.color ? (
                    <Badge variant="secondary">{article.color}</Badge>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
