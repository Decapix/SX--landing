"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, X } from "lucide-react"

export type RunwayFilterState = {
  season?: string
  genre?: string
  brand_id?: string
  country?: string
  is_emerging?: boolean
}

type FilterOption = { id: string; label: string }

function FilterPill({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value?: string
  options: FilterOption[]
  onChange: (value: string | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const displayLabel = value ? (options.find((o) => o.id === value)?.label ?? value) : label

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          value ? "bg-black text-white" : "border border-black/10 bg-white text-black hover:bg-neutral-50"
        }`}
      >
        {displayLabel}
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 max-h-60 min-w-[180px] overflow-y-auto rounded-xl border border-black/10 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => { onChange(undefined); setOpen(false) }}
              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 ${!value ? "font-medium" : ""}`}
            >
              {label}
            </button>
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => { onChange(opt.id); setOpen(false) }}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 ${value === opt.id ? "bg-neutral-50 font-medium" : ""}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

type SeasonItem = { id: string; label: string }
type BrandItem = { id: string; name: string }
type CountryItem = { id: string; label: string }

export function RunwayFilters({
  filters,
  onFiltersChange,
}: {
  filters: RunwayFilterState
  onFiltersChange: (filters: RunwayFilterState) => void
}) {
  const [seasons, setSeasons] = useState<SeasonItem[]>([])
  const [brands, setBrands] = useState<BrandItem[]>([])
  const [countries, setCountries] = useState<CountryItem[]>([])
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    fetch("/api/runway/config/season")
      .then((r) => r.json())
      .then((data: { items: SeasonItem[] }) => { if (isMounted.current) setSeasons(data.items ?? []) })
      .catch(() => {})
    fetch("/api/runway/brands")
      .then((r) => r.json())
      .then((data: BrandItem[]) => { if (isMounted.current) setBrands(Array.isArray(data) ? data : []) })
      .catch(() => {})
    fetch("/api/runway/countries")
      .then((r) => r.json())
      .then((data: CountryItem[]) => { if (isMounted.current) setCountries(Array.isArray(data) ? data : []) })
      .catch(() => {})
    return () => { isMounted.current = false }
  }, [])

  const update = (key: keyof RunwayFilterState, value: string | boolean | undefined) => {
    const next = { ...filters }
    if (value === undefined || value === "" || value === false) {
      delete next[key]
    } else {
      (next as Record<string, unknown>)[key] = value
    }
    onFiltersChange(next)
  }

  const activeCount = Object.keys(filters).length

  const genreOptions: FilterOption[] = [
    { id: "male", label: "Homme" },
    { id: "female", label: "Femme" },
    { id: "unknown", label: "Unisexe" },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterPill
        label="Season"
        value={filters.season}
        options={seasons.map((s) => ({ id: s.id, label: s.label }))}
        onChange={(v) => update("season", v)}
      />
      <FilterPill
        label="Genre"
        value={filters.genre}
        options={genreOptions}
        onChange={(v) => update("genre", v)}
      />
      <FilterPill
        label="Country"
        value={filters.country}
        options={countries}
        onChange={(v) => update("country", v)}
      />
      <FilterPill
        label="Brand"
        value={filters.brand_id}
        options={brands.map((b) => ({ id: b.id, label: b.name }))}
        onChange={(v) => update("brand_id", v)}
      />

      <label className="ml-1 flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={filters.is_emerging === true}
          onChange={(e) => update("is_emerging", e.target.checked ? true : undefined)}
          className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-black"
        />
        Emerging brands only
      </label>

      {activeCount > 0 ? (
        <button
          type="button"
          onClick={() => onFiltersChange({})}
          className="flex items-center gap-1 px-3 py-2 text-sm text-neutral-500 hover:text-black"
        >
          <X className="h-3.5 w-3.5" />
          Clear
          <span className="ml-1 rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs">{activeCount}</span>
        </button>
      ) : null}
    </div>
  )
}
