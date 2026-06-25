"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useLang } from "@/context/lang-context"

type Option = {
  id: string
  label: string
}

const cache = new Map<string, Option[]>()

type SeasonPayload = {
  items?: unknown
  value?: unknown
}

function normalizeOptions(payload: SeasonPayload): Option[] {
  const raw = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.value)
      ? payload.value
      : []

  const normalized: Option[] = []

  for (const item of raw) {
    if (typeof item === "string") {
      normalized.push({ id: item, label: item })
      continue
    }

    if (item && typeof item === "object") {
      const candidate = item as Record<string, unknown>
      const idValue = candidate.id ?? candidate._id ?? candidate.code ?? candidate.value
      const labelValue = candidate.label ?? candidate.name ?? idValue
      if (idValue !== undefined && idValue !== null) {
        normalized.push({
          id: String(idValue),
          label: String(labelValue ?? idValue),
        })
      }
    }
  }

  return normalized
}

export function useSeasonTranslation() {
  const { lang } = useLang()
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cacheKey = `collection_season_${lang}`

    if (cache.has(cacheKey)) {
      setOptions(cache.get(cacheKey) || [])
      setLoading(false)
      return
    }

    setLoading(true)
    const load = async () => {
      try {
        const response = await fetch(`/api/runway/config/season?language=${lang}`, { cache: "no-store" })
        if (!response.ok) {
          setOptions([])
          return
        }
        const data = (await response.json()) as SeasonPayload
        const resolved = normalizeOptions(data)
        cache.set(cacheKey, resolved)
        setOptions(resolved)
      } catch {
        setOptions([])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [lang])

  const resolveLabel = useCallback(
    (id: string | null | undefined) => {
      if (!id) return ""
      const normalizedId = String(id).trim()
      return options.find((option) => String(option.id).trim() === normalizedId)?.label || id
    },
    [options],
  )

  return useMemo(() => ({ options, loading, resolveLabel }), [options, loading, resolveLabel])
}
