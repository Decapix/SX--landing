import "server-only"

import { buildLandingBackendStaticHeaders } from "@/lib/landing-backend"

export type RunwayImage = {
  key: string
  url: string
  expires_in: number
}

export type RunwayBrandSummary = {
  id: string
  name: string
  logo: RunwayImage | null
  country: string | null
  city: string | null
  is_emerging: boolean
  managers?: Array<{
    id: string
    user_id: string
    name: string
    profile_image: RunwayImage | null
  }>
  press_office?: {
    id: string
    name: string
  } | null
}

export type RunwayCollectionCard = {
  id: string
  name: string
  created_at: string
  season: string | null
  season_label: string | null
  type: string | null
  genre: "male" | "female" | "unknown" | null
  brand: RunwayBrandSummary
  cover_image: RunwayImage | null
  look_count: number
  article_count: number
}

export type RunwayArticle = {
  id: string
  name: string
  category: string | null
  color: string | null
  type_article: string | null
  material: string | null
  cloth_sizes: string[]
  size_country: string | null
  images: RunwayImage[]
}

export type RunwayLook = {
  id: string
  name: string
  description: string | null
  category: string | null
  images: RunwayImage[]
  article_count: number
  articles: RunwayArticle[]
}

export type RunwayCollectionListResponse = {
  items: RunwayCollectionCard[]
  total: number
  next_offset: number | null
}

export type RunwayCollectionDetailResponse = {
  collection: {
    id: string
    name: string
    description: string | null
    season: string | null
    season_label: string | null
    type: string | null
    genre: "male" | "female" | "unknown" | null
    status: string
    created_at: string
    brand: RunwayBrandSummary
    cover_image: RunwayImage | null
    look_count: number
    article_count: number
  }
  looks: RunwayLook[]
  articles: RunwayArticle[]
  looks_total: number
  looks_next_offset: number | null
}

export type RunwayBrandDetailResponse = {
  brand: RunwayBrandSummary
  collections: RunwayCollectionCard[]
  total: number
  next_offset: number | null
}

const backendBase = process.env.BACKEND_APP_URL

function buildBackendUrl(path: string): string {
  if (!backendBase) {
    throw new Error("BACKEND_APP_URL is not configured")
  }
  const normalized = backendBase.endsWith("/") ? backendBase : `${backendBase}/`
  const clean = path.startsWith("/") ? path.slice(1) : path
  return `${normalized}${clean}`
}

async function fetchRunway<T>(path: string): Promise<T> {
  const url = buildBackendUrl(path)
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: buildLandingBackendStaticHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Runway API request failed (${response.status})`)
  }

  return (await response.json()) as T
}

export async function getRunwayCollections(): Promise<RunwayCollectionListResponse> {
  return fetchRunway<RunwayCollectionListResponse>("api/landing-page/runway/collections?limit=24")
}

export async function getRunwayCollectionDetail(collectionId: string): Promise<RunwayCollectionDetailResponse> {
  return fetchRunway<RunwayCollectionDetailResponse>(
    `api/landing-page/runway/collections/${collectionId}?looks_limit=24`,
  )
}

export async function getRunwayBrandDetail(brandId: string): Promise<RunwayBrandDetailResponse> {
  return fetchRunway<RunwayBrandDetailResponse>(`api/landing-page/runway/brands/${brandId}?limit=24`)
}

export type RunwayStylistSlugResolution = {
  encoded_id: string
}

export async function resolveStylistByShortUrl(
  year: number,
  city: string,
  name: string,
): Promise<RunwayStylistSlugResolution | null> {
  const qs = new URLSearchParams({
    year: String(year),
    city,
    name,
  }).toString()
  const res = await fetch(
    buildBackendUrl(`api/landing-page/runway/stylists/by-slug?${qs}`),
    {
      method: "GET",
      headers: buildLandingBackendStaticHeaders(),
      cache: "no-store",
    },
  )
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`resolveStylistByShortUrl failed: ${res.status}`)
  }
  return (await res.json()) as RunwayStylistSlugResolution
}

export type RunwayPressOfficeBrand = {
  id: string
  name: string
  logo: RunwayImage | null
  country: string | null
  city: string | null
  collections_count: number
}

export type RunwayPressOfficeDetail = {
  id: string
  name: string
  logo: RunwayImage | null
  brands_count: number
  brands: RunwayPressOfficeBrand[]
}

export async function getRunwayPressOfficeDetail(
  decodedId: string,
): Promise<RunwayPressOfficeDetail> {
  return fetchRunway<RunwayPressOfficeDetail>(
    `api/landing-page/runway/press-offices/${decodedId}`,
  )
}

export type LandingEntityItem = {
  id: string
  name: string
  type: "brand" | "press_officer"
  profile_image: RunwayImage | null
}

export async function getLandingEntities(): Promise<LandingEntityItem[]> {
  return fetchRunway<LandingEntityItem[]>("api/landing-page/entities")
}
