"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Plus,
} from "lucide-react";

import { PresignedImage } from "@/components/assets/PresignedImage";
import { extractS3Key } from "@/components/assets/s3Utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/shadcn-button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { RunwayCollectionDetailResponse } from "@/lib/runway-api";
import { useLang } from "@/context/lang-context";
import {
  LoginModal,
  type LoginRedirectContext,
} from "@/components/login-modal";
import { encodeId } from "@/lib/id-hash";
import { isBotBlocked } from "@/lib/bot-guard";
import { resolveArticleType, resolveColor, resolveMaterial } from "@/lib/article-labels";

type Props = {
  data: RunwayCollectionDetailResponse;
};

export function CollectionDetailClient({ data }: Props) {
  const { collection } = data;
  const { t, lang } = useLang();
  const [viewMode, setViewMode] = useState<"looks" | "articles">("looks");
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [applyingArticleId, setApplyingArticleId] = useState<string | null>(
    null,
  );
  const router = useRouter();

  const categories = useMemo(() => {
    const values = new Set<string>();
    for (const article of data.articles) {
      if (article.category) values.add(article.category);
    }
    return ["all", ...Array.from(values)];
  }, [data.articles]);

  const filteredLooks = useMemo(() => {
    return data.looks.filter((look) => {
      const articleCategories = (look.articles ?? [])
        .map((article) => article.category)
        .filter(Boolean);
      const hasCategory =
        category === "all" || articleCategories.includes(category);

      const target =
        `${look.name} ${look.description ?? ""} ${(look.articles ?? []).map((a) => a.name).join(" ")}`.toLowerCase();
      const hasQuery =
        query.trim() === "" || target.includes(query.trim().toLowerCase());

      return hasCategory && hasQuery;
    });
  }, [category, data.looks, query]);

  const filteredArticles = useMemo(() => {
    return data.articles.filter((article) => {
      const hasCategory = category === "all" || article.category === category;
      const target =
        `${article.name} ${article.category ?? ""} ${article.type_article ?? ""} ${article.color ?? ""} ${article.material ?? ""}`.toLowerCase();
      const hasQuery =
        query.trim() === "" || target.includes(query.trim().toLowerCase());
      return hasCategory && hasQuery;
    });
  }, [category, data.articles, query]);

  const [selectedLookIndex, setSelectedLookIndex] = useState<number | null>(
    null,
  );
  const [selectedArticleIndex, setSelectedArticleIndex] = useState<
    number | null
  >(null);
  const selectedLook =
    selectedLookIndex !== null
      ? (filteredLooks[selectedLookIndex] ?? null)
      : null;
  const selectedArticle =
    selectedArticleIndex !== null
      ? (filteredArticles[selectedArticleIndex] ?? null)
      : null;

  const goToPrev = useCallback(
    () => setSelectedLookIndex((i) => (i !== null && i > 0 ? i - 1 : i)),
    [],
  );
  const goToNext = useCallback(
    () =>
      setSelectedLookIndex((i) =>
        i !== null && i < filteredLooks.length - 1 ? i + 1 : i,
      ),
    [filteredLooks.length],
  );
  const goToPrevArticle = useCallback(
    () => setSelectedArticleIndex((i) => (i !== null && i > 0 ? i - 1 : i)),
    [],
  );
  const goToNextArticle = useCallback(
    () =>
      setSelectedArticleIndex((i) =>
        i !== null && i < filteredArticles.length - 1 ? i + 1 : i,
      ),
    [filteredArticles.length],
  );

  useEffect(() => {
    if (selectedLookIndex === null && selectedArticleIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        if (selectedLookIndex !== null) goToPrev();
        if (selectedArticleIndex !== null) goToPrevArticle();
      } else if (e.key === "ArrowRight") {
        if (selectedLookIndex !== null) goToNext();
        if (selectedArticleIndex !== null) goToNextArticle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    selectedArticleIndex,
    selectedLookIndex,
    goToNext,
    goToNextArticle,
    goToPrev,
    goToPrevArticle,
  ]);

  function handleApplyLoan(articleId: string) {
    if (isBotBlocked()) return;
    setApplyingArticleId(articleId);
    setTimeout(() => {
      setApplyingArticleId(null);
      setLoanModalOpen(true);
    }, 3000);
  }

  return (
    <section className="space-y-8">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/runway">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>

      <Card className="overflow-hidden border-border/70 bg-zinc-50">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[96px,1fr,320px]">
          <div className="h-28 w-24 overflow-hidden rounded-md border bg-muted">
            {collection.cover_image ? (
              <PresignedImage
                s3Key={extractS3Key(
                  collection.cover_image.key || collection.cover_image.url,
                )}
                alt={collection.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No image
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight">
              {collection.name}
            </h1>
            <p className="text-xl text-muted-foreground">
              {collection.type ?? "Collection"}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {collection.season_label ? (
                <Badge variant="outline">{collection.season_label}</Badge>
              ) : null}
              {collection.genre ? (
                <Badge variant="outline">{collection.genre}</Badge>
              ) : null}
              <Badge variant="outline">{collection.look_count} looks</Badge>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t.runway.brand}
            </p>
            <Link
              href={`/runway/brands/${encodeId(collection.brand.id)}`}
              className="flex items-center gap-3 hover:opacity-70 transition-opacity"
            >
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                {collection.brand.logo ? (
                  <PresignedImage
                    s3Key={extractS3Key(
                      collection.brand.logo.key || collection.brand.logo.url,
                    )}
                    alt={collection.brand.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-semibold">
                    {collection.brand.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <span className="truncate font-medium">
                {collection.brand.name}
              </span>
            </Link>
            {collection.brand.press_office ? (
              <p className="text-xs text-muted-foreground">
                Managed by{" "}
                <Link
                  href={`/runway/press-offices/${encodeId(collection.brand.press_office.id)}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {collection.brand.press_office.name}
                </Link>
              </p>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setLoginOpen(true)}
            >
              {t.runway.contactBrand}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setLoginOpen(true)}
            >
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              {t.runway.seeOnInside}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Collection view
            </h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Switch between looks and articles, then open any card for full
              details.
            </p>
          </div>
          <div className="inline-flex rounded-full border border-border/70 bg-background p-1">
            <button
              type="button"
              onClick={() => setViewMode("looks")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === "looks"
                  ? "bg-black text-white"
                  : "text-muted-foreground"
              }`}
            >
              Looks ({collection.look_count})
            </button>
            <button
              type="button"
              onClick={() => setViewMode("articles")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === "articles"
                  ? "bg-black text-white"
                  : "text-muted-foreground"
              }`}
            >
              Articles ({collection.article_count})
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2">
            {categories.map((value) => (
              <Button
                key={value}
                variant={category === value ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(value)}
              >
                {value === "all" ? "All" : value}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                viewMode === "looks" ? "Search looks" : "Search articles"
              }
              className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm"
            />
            <Button variant="outline" size="sm" onClick={() => setQuery("")}>
              Clear
            </Button>
          </div>
        </div>

        {viewMode === "looks" && filteredLooks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No look matches your filters.
            </CardContent>
          </Card>
        ) : null}

        {viewMode === "articles" && filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No article matches your filters.
            </CardContent>
          </Card>
        ) : null}

        {viewMode === "looks" ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredLooks.map((look, index) => (
              <button
                key={look.id}
                onClick={() => setSelectedLookIndex(index)}
                className="overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-[3/4] bg-muted">
                  {look.images[0] ? (
                    <PresignedImage
                      s3Key={extractS3Key(
                        look.images[0].key || look.images[0].url,
                      )}
                      alt={look.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No look image
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 rounded-md bg-black p-1 text-white">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-1 p-4">
                  <p className="text-lg font-semibold leading-snug">
                    {look.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {look.article_count} articles
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map((article, index) => (
              <button
                key={article.id}
                onClick={() => setSelectedArticleIndex(index)}
                className="overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-[3/4] bg-muted">
                  {article.images[0] ? (
                    <PresignedImage
                      s3Key={extractS3Key(
                        article.images[0].key || article.images[0].url,
                      )}
                      alt={article.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No article image
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 rounded-md bg-black p-1 text-white">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold leading-snug">
                      {article.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {article.category ??
                        resolveArticleType(article.type_article, lang) ??
                        resolveColor(article.color, lang) ??
                        "Article"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {article.category ? (
                      <Badge variant="outline">{article.category}</Badge>
                    ) : null}
                    {article.type_article ? (
                      <Badge variant="outline">{resolveArticleType(article.type_article, lang)}</Badge>
                    ) : null}
                    {article.color ? (
                      <Badge variant="outline">{resolveColor(article.color, lang)}</Badge>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={selectedLook !== null}
        onOpenChange={(open) => !open && setSelectedLookIndex(null)}
      >
        {selectedLook && selectedLookIndex !== null ? (
          <DialogContent className="p-0">
            <DialogTitle className="sr-only">
              {selectedLook.name} details
            </DialogTitle>
            <DialogDescription className="sr-only">
              Look image on the left and related article details in accordion
              panels on the right.
            </DialogDescription>

            {selectedLookIndex > 0 && (
              <button
                onClick={goToPrev}
                aria-label="Previous look"
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md backdrop-blur-sm transition hover:bg-background"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {selectedLookIndex < filteredLooks.length - 1 && (
              <button
                onClick={goToNext}
                aria-label="Next look"
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md backdrop-blur-sm transition hover:bg-background"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            <div className="grid min-h-[70vh] gap-0 md:grid-cols-2">
              <div className="bg-muted">
                {selectedLook.images[0] ? (
                  <PresignedImage
                    s3Key={extractS3Key(
                      selectedLook.images[0].key || selectedLook.images[0].url,
                    )}
                    alt={selectedLook.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No look image
                  </div>
                )}
              </div>
              <div className="h-full overflow-y-auto p-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xl font-semibold leading-tight">
                    {selectedLook.name}
                  </h3>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {selectedLookIndex + 1} / {filteredLooks.length}
                  </span>
                </div>
                {selectedLook.description ? (
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {selectedLook.description}
                  </p>
                ) : null}

                <Accordion type="single" collapsible className="mt-5 w-full">
                  {(selectedLook.articles ?? []).map((article) => (
                    <AccordionItem key={article.id} value={article.id}>
                      <AccordionTrigger>{article.name}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {article.category ? (
                              <Badge variant="outline">
                                {article.category}
                              </Badge>
                            ) : null}
                            {article.type_article ? (
                              <Badge variant="outline">
                                {resolveArticleType(article.type_article, lang)}
                              </Badge>
                            ) : null}
                            {article.color ? (
                              <Badge variant="outline">{resolveColor(article.color, lang)}</Badge>
                            ) : null}
                          </div>
                          {article.images[0] ? (
                            <div className="h-20 w-20 overflow-hidden rounded-md border bg-muted">
                              <PresignedImage
                                s3Key={extractS3Key(
                                  article.images[0].key ||
                                    article.images[0].url,
                                )}
                                alt={article.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled={applyingArticleId === article.id}
                            onClick={() => handleApplyLoan(article.id)}
                          >
                            {applyingArticleId === article.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              t.runway.applyLoan
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setLoginOpen(true)}
                          >
                            <ExternalLink className="mr-2 h-3.5 w-3.5" />
                            {t.runway.seeOnInside}
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
      <Dialog
        open={selectedArticle !== null}
        onOpenChange={(open) => !open && setSelectedArticleIndex(null)}
      >
        {selectedArticle && selectedArticleIndex !== null ? (
          <DialogContent className="p-0">
            <DialogTitle className="sr-only">
              {selectedArticle.name} details
            </DialogTitle>
            <DialogDescription className="sr-only">
              Article image on the left and article details on the right.
            </DialogDescription>

            {selectedArticleIndex > 0 && (
              <button
                onClick={goToPrevArticle}
                aria-label="Previous article"
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md backdrop-blur-sm transition hover:bg-background"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {selectedArticleIndex < filteredArticles.length - 1 && (
              <button
                onClick={goToNextArticle}
                aria-label="Next article"
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md backdrop-blur-sm transition hover:bg-background"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            <div className="grid min-h-[70vh] gap-0 md:grid-cols-2">
              <div className="bg-muted">
                {selectedArticle.images[0] ? (
                  <PresignedImage
                    s3Key={extractS3Key(
                      selectedArticle.images[0].key ||
                        selectedArticle.images[0].url,
                    )}
                    alt={selectedArticle.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No article image
                  </div>
                )}
              </div>
              <div className="flex h-full flex-col overflow-y-auto p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-semibold">
                    {selectedArticle.name}
                  </h3>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {selectedArticleIndex + 1} / {filteredArticles.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.category ? (
                    <Badge variant="outline">{selectedArticle.category}</Badge>
                  ) : null}
                  {selectedArticle.type_article ? (
                    <Badge variant="outline">
                      {resolveArticleType(selectedArticle.type_article, lang)}
                    </Badge>
                  ) : null}
                  {selectedArticle.color ? (
                    <Badge variant="outline">{resolveColor(selectedArticle.color, lang)}</Badge>
                  ) : null}
                  {selectedArticle.material ? (
                    <Badge variant="outline">{resolveMaterial(selectedArticle.material, lang)}</Badge>
                  ) : null}
                </div>

                <div className="mt-6 space-y-4 rounded-2xl border border-border/70 bg-zinc-50 p-5">
                  <ArticleDetailRow
                    label="Material"
                    value={resolveMaterial(selectedArticle.material, lang)}
                  />
                  <ArticleDetailRow
                    label="Color"
                    value={resolveColor(selectedArticle.color, lang)}
                  />
                  <ArticleDetailRow
                    label="Type"
                    value={resolveArticleType(selectedArticle.type_article, lang)}
                  />
                  <ArticleDetailRow
                    label="Size country"
                    value={selectedArticle.size_country}
                  />
                  <ArticleDetailRow
                    label="Available sizes"
                    value={
                      selectedArticle.cloth_sizes.length > 0
                        ? selectedArticle.cloth_sizes.join(", ")
                        : null
                    }
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-6 w-full"
                  disabled={applyingArticleId === selectedArticle.id}
                  onClick={() => handleApplyLoan(selectedArticle.id)}
                >
                  {applyingArticleId === selectedArticle.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t.runway.applyLoan
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => setLoginOpen(true)}
                >
                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                  {t.runway.seeOnInside}
                </Button>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
      <Dialog
        open={loanModalOpen}
        onOpenChange={(open) => !open && setLoanModalOpen(false)}
      >
        <DialogContent className="max-w-sm text-center">
          <DialogTitle>{t.runway.notLoggedTitle}</DialogTitle>
          <DialogDescription className="mt-1">
            {t.runway.notLoggedBody}
          </DialogDescription>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              setLoanModalOpen(false);
              router.push("/try-the-plateform");
            }}
          >
            {t.nav.bookDemo}
          </Button>
          <Link
            href="/platform/stylist"
            onClick={() => setLoanModalOpen(false)}
            className="block text-sm font-medium text-neutral-700 underline decoration-neutral-400 underline-offset-4 transition hover:text-black"
          >
            {t.runway.discoverStylistOffer}
          </Link>
        </DialogContent>
      </Dialog>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        redirectContext={{
          type: "collection",
          encodedId: encodeId(collection.id),
        }}
      />
    </section>
  );
}

function ArticleDetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">
        {value || "Not specified"}
      </span>
    </div>
  );
}
