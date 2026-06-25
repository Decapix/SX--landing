export type DiscoverImage = {
  key: string
  url: string
  expires_in: number
}

export type DiscoverStylistSummary = {
  id: string
  name: string
  country: string | null
  city: string | null
  profile_image: DiscoverImage | null
}

export type DiscoverStylistMember = {
  id: string
  user_id: string
  role: string
  name: string | null
  profile_image: DiscoverImage | null
}

export type DiscoverPost = {
  id: string
  author: {
    user_id: string
    username: string
    firstname: string | null
    lastname: string | null
    profile_image: DiscoverImage | null
    stylist: DiscoverStylistSummary
  }
  images: DiscoverImage[]
  caption: string
  tags: string[]
  categories: string[]
  likes_count: number
  comments_count: number
  created_at: string
}

export type DiscoverFeedResponse = {
  items: DiscoverPost[]
  total: number
  next_cursor: string | null
  has_more: boolean
}

export type DiscoverCategory = {
  id: string
  label: string
}

export type DiscoverCategoriesResponse = {
  items: DiscoverCategory[]
}

export type DiscoverStylistSearchItem = {
  id: string
  name: string
  country: string | null
  city: string | null
  profile_image: DiscoverImage | null
}

export type DiscoverStylistDetailResponse = {
  stylist: DiscoverStylistSummary
  countries: string[]
  members: DiscoverStylistMember[]
  posts: DiscoverPost[]
  total: number
  has_more: boolean
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }

  return (await response.json()) as T
}

export async function getDiscoverPosts(params: {
  limit?: number
  cursor?: string | null
  category?: string | null
  q?: string | null
} = {}): Promise<DiscoverFeedResponse> {
  const search = new URLSearchParams()
  if (params.limit) search.set("limit", String(params.limit))
  if (params.cursor) search.set("cursor", params.cursor)
  if (params.category) search.set("category", params.category)
  if (params.q) search.set("q", params.q)
  const query = search.toString()
  return fetchJson<DiscoverFeedResponse>(`/api/discover/posts${query ? `?${query}` : ""}`)
}

export async function getDiscoverCategories(language: "en" | "fr"): Promise<DiscoverCategoriesResponse> {
  return fetchJson<DiscoverCategoriesResponse>(`/api/discover/categories?language=${language}`)
}

export async function searchDiscoverStylists(query: string): Promise<DiscoverStylistSearchItem[]> {
  const search = new URLSearchParams({ q: query })
  return fetchJson<DiscoverStylistSearchItem[]>(`/api/discover/stylists/search?${search.toString()}`)
}

export async function getDiscoverStylistDetail(encodedId: string): Promise<DiscoverStylistDetailResponse> {
  return fetchJson<DiscoverStylistDetailResponse>(`/api/discover/stylists/${encodeURIComponent(encodedId)}`)
}
