"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { Masonry, useInfiniteLoader } from "masonic"
import { Loader2, Search, X } from "lucide-react"

import { PresignedImage } from "@/components/assets/PresignedImage"
import { extractS3Key } from "@/components/assets/s3Utils"
import { DiscoverPostCard } from "@/components/discover/discover-post-card"
import { DiscoverPostModal } from "@/components/discover/discover-post-modal"
import { useLang } from "@/context/lang-context"
import {
  getDiscoverPosts,
  searchDiscoverStylists,
  type DiscoverPost,
  type DiscoverStylistSearchItem,
} from "@/lib/discover-api"
import { encodeId } from "@/lib/id-hash"
import { isBotBlocked } from "@/lib/bot-guard"

export function DiscoverPageClient() {
  const { lang, t } = useLang()
  const [posts, setPosts] = useState<DiscoverPost[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<DiscoverStylistSearchItem[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedKey, setFeedKey] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)

  async function loadFeed(reset: boolean) {
    if (isBotBlocked()) return
    try {
      if (reset) {
        setLoading(true)
        setError(null)
        // Remount the virtualized grid on a fresh feed (lang change, search
        // submit, clear) so masonic's position cache resets cleanly.
        setFeedKey((k) => k + 1)
      } else {
        setLoadingMore(true)
      }

      const response = await getDiscoverPosts({
        limit: 10,
        cursor: reset ? null : nextCursor,
        q: searchQuery.trim() || null,
      })

      setPosts((current) => (reset ? response.items : [...current, ...response.items]))
      setNextCursor(response.next_cursor)
    } catch {
      setError(t.discover.feedUnavailable)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Stable render component for each masonry cell.
  const renderPost = useCallback(
    ({ index, data }: { index: number; data: DiscoverPost; width: number }) => (
      <DiscoverPostCard
        post={data}
        locale={lang}
        noImageLabel={t.discover.noImage}
        onOpen={() => setSelectedIndex(index)}
        priority={index === 0}
      />
    ),
    [lang, t.discover.noImage],
  )

  // Infinite scroll: load the next page as the user nears the end of the
  // virtualized list (replaces the manual "Load more" button).
  const maybeLoadMore = useInfiniteLoader(
    async () => {
      if (nextCursor && !loadingMore && !loading) {
        await loadFeed(false)
      }
    },
    {
      isItemLoaded: (index, items) => index < items.length,
      minimumBatchSize: 10,
      threshold: 4,
    },
  )

  useEffect(() => {
    void loadFeed(true)
  }, [lang])

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      if (isBotBlocked()) return
      const query = searchQuery.trim()
      if (query.length < 2) {
        setSearchResults([])
        setShowSearchResults(false)
        return
      }

      try {
        setSearching(true)
        const results = await searchDiscoverStylists(query)
        setSearchResults(results)
        setShowSearchResults(true)
      } catch {
        setSearchResults([])
        setShowSearchResults(true)
      } finally {
        setSearching(false)
      }
    }, 220)

    return () => window.clearTimeout(timeout)
  }, [searchQuery])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  return (
    <section className="space-y-8">
      <div className="space-y-4 pt-4">
        <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">{t.discover.eyebrow}</p>
        <h1 className="font-['BlissTwin'] text-5xl tracking-tight md:text-7xl">{t.discover.heading}</h1>
        <p className="max-w-3xl text-base leading-7 text-neutral-600">{t.discover.body}</p>
      </div>

      <div className="rounded-[1.8rem] border border-black/5 bg-white/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.05)] backdrop-blur">
        <div ref={searchRef} className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void loadFeed(true)
                setShowSearchResults(false)
              }
            }}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowSearchResults(true)
              }
            }}
            placeholder={t.discover.searchPlaceholder}
            className="h-12 w-full rounded-full border border-neutral-200 bg-neutral-50 pl-11 pr-20 text-sm outline-none transition focus:border-black focus:bg-white"
          />
          {searching ? <Loader2 className="absolute right-12 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" /> : null}
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setShowSearchResults(false)
                void loadFeed(true)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
              aria-label={t.discover.clearSearch}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}

          {showSearchResults ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] overflow-hidden rounded-[1.25rem] border border-black/5 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.1)]">
              {searchResults.length === 0 ? (
                <p className="px-4 py-6 text-sm text-neutral-500">{t.discover.noResults}</p>
              ) : (
                <div className="py-2">
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      href={`/discover/stylist/${encodeId(result.id)}`}
                      onClick={() => setShowSearchResults(false)}
                      className="flex items-center gap-3 px-4 py-3 transition hover:bg-neutral-50"
                    >
                      <div className="h-11 w-11 overflow-hidden rounded-full bg-neutral-100">
                        {result.profile_image ? (
                          <PresignedImage
                            s3Key={extractS3Key(result.profile_image.key || result.profile_image.url)}
                            alt={result.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-neutral-500">
                            {result.name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-black">{result.name}</p>
                        <p className="truncate text-xs uppercase tracking-[0.18em] text-neutral-400">
                          {[result.city, result.country].filter(Boolean).join(", ") || t.discover.unknownLocation}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-[1.75rem] border border-black/5 bg-white/80">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.18em] text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.discover.loading}
          </div>
        </div>
      ) : error ? (
        <div className="rounded-[1.75rem] border border-red-200 bg-white/80 px-6 py-8 text-sm text-red-600">{error}</div>
      ) : posts.length === 0 ? (
        <div className="rounded-[1.75rem] border border-black/5 bg-white/80 px-6 py-8 text-sm text-neutral-600">
          {t.discover.noPosts}
        </div>
      ) : (
        <>
          {/* Virtualized masonry: only on-screen posts are mounted; scrolled-past
              posts unmount and free their images. Appending pages never reflows
              existing items (no more layout jump on load-more). */}
          <Masonry
            key={feedKey}
            items={posts}
            columnGutter={20}
            columnWidth={420}
            columnCount={3}
            overscanBy={1.5}
            render={renderPost}
            onRender={maybeLoadMore}
          />
          {loadingMore ? (
            <div className="flex justify-center pt-3">
              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            </div>
          ) : null}
        </>
      )}

      <DiscoverPostModal
        posts={posts}
        activeIndex={selectedIndex}
        onOpenChange={(open) => {
          if (!open) setSelectedIndex(null)
        }}
        onPrev={() => setSelectedIndex((current) => (current !== null && current > 0 ? current - 1 : current))}
        onNext={() =>
          setSelectedIndex((current) => (current !== null && current < posts.length - 1 ? current + 1 : current))
        }
      />
    </section>
  )
}
