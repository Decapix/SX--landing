"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Search, X } from "lucide-react"

import { RunwayCollectionCard } from "@/components/runway/collection-card"
import { RunwayFilters, type RunwayFilterState } from "@/components/runway/runway-filters"
import { Button } from "@/components/ui/shadcn-button"
import { Card, CardContent } from "@/components/ui/card"
import type { RunwayCollectionCard as RunwayCollectionCardType } from "@/lib/runway-api"
import { isBotBlocked } from "@/lib/bot-guard"

type CollectionsResponse = {
  items: RunwayCollectionCardType[]
  total: number
  next_offset: number | null
}

async function fetchCollections(filters: RunwayFilterState, offset: number): Promise<CollectionsResponse> {
  const params = new URLSearchParams({ limit: "24", offset: String(offset) })
  if (filters.season) params.set("season", filters.season)
  if (filters.genre) params.set("genre", filters.genre)
  if (filters.brand_id) params.set("brand_id", filters.brand_id)
  if (filters.country) params.set("country", filters.country)
  if (filters.is_emerging) params.set("is_emerging", "true")
  const response = await fetch(`/api/runway/collections?${params.toString()}`)
  if (!response.ok) throw new Error(`Failed to fetch collections (${response.status})`)
  return response.json() as Promise<CollectionsResponse>
}

async function searchCollections(q: string, offset: number): Promise<CollectionsResponse> {
  const params = new URLSearchParams({ q, limit: "24", offset: String(offset) })
  const response = await fetch(`/api/runway/search?${params.toString()}`)
  if (!response.ok) throw new Error(`Search failed (${response.status})`)
  return response.json() as Promise<CollectionsResponse>
}

export function RunwayPageClient() {
  const [collections, setCollections] = useState<RunwayCollectionCardType[]>([])
  const [filters, setFilters] = useState<RunwayFilterState>({})
  const [searchInput, setSearchInput] = useState("")
  const [activeSearch, setActiveSearch] = useState("") // committed query
  const [nextOffset, setNextOffset] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  async function load(opts: { filters?: RunwayFilterState; search?: string; reset: boolean; offset?: number }) {
    if (isBotBlocked()) return
    const { reset, offset = 0 } = opts
    const q = opts.search ?? activeSearch
    const f = opts.filters ?? filters
    try {
      if (reset) { setLoading(true); setError(null) }
      else setLoadingMore(true)

      const data = q.trim()
        ? await searchCollections(q.trim(), reset ? 0 : offset)
        : await fetchCollections(f, reset ? 0 : offset)

      setCollections((current) => (reset ? data.items : [...current, ...data.items]))
      setNextOffset(data.next_offset)
    } catch {
      setError("Unable to load runway collections right now. Please retry in a few moments.")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => { void load({ reset: true }) }, [])

  function handleFiltersChange(next: RunwayFilterState) {
    setFilters(next)
    if (!activeSearch) void load({ filters: next, reset: true })
  }

  function handleSearchInputChange(value: string) {
    setSearchInput(value)
    clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setActiveSearch(value)
      void load({ search: value, reset: true })
    }, 300)
  }

  function handleSearchClear() {
    clearTimeout(searchDebounceRef.current)
    setSearchInput("")
    setActiveSearch("")
    void load({ search: "", filters, reset: true })
  }

  const emptyMessage = activeSearch
    ? `No collection found for "${activeSearch}".`
    : "No collection matches the current filters."

  return (
    <section className="space-y-8 pb-8">
      <div className="max-w-4xl pt-3">
        <h1 className="font-blisstwin text-5xl tracking-tight sm:text-7xl">Runway</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
          Browse the latest visible collections, then open each collection to explore looks, articles, and the related brand.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Search bar */}
        <div className="relative flex-shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            value={searchInput}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            placeholder="Search brand, press office, article, color…"
            className="h-9 w-64 rounded-full border border-black/10 bg-white pl-9 pr-8 text-sm outline-none transition focus:border-black"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={handleSearchClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {/* Filters — visually dimmed when search is active */}
        <div className={activeSearch ? "pointer-events-none opacity-40" : undefined}>
          <RunwayFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-[1.75rem] border border-black/5 bg-white/80">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.18em] text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading
          </div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : collections.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">{emptyMessage}</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
            {collections.map((collection) => (
              <RunwayCollectionCard key={collection.id} collection={collection} />
            ))}
          </div>

          {nextOffset !== null ? (
            <div className="flex justify-center pt-3">
              <Button
                variant="outline"
                onClick={() => void load({ reset: false, offset: nextOffset })}
                disabled={loadingMore}
                className="rounded-full"
              >
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load more"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
