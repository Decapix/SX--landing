"use client"

import { useEffect, useRef, useState } from "react"

import { resizedS3Key } from "@/components/assets/s3Utils"

interface PresignedImageProps {
  s3Key: string
  alt: string
  className?: string
  style?: React.CSSProperties
  fallbackSrc?: string
  priority?: boolean
  /** Request a server-side resized variant (width in px) instead of the full-resolution asset. */
  width?: number
}

type PresignedCacheEntry = {
  url: string
  expiresAt: number
}

const presignedUrlCache = new Map<string, PresignedCacheEntry>()
const inFlightRequests = new Map<string, Promise<{ url: string; expires_in: number }>>()
const loadedImageUrls = new Set<string>()
const inFlightImageLoads = new Map<string, Promise<void>>()

async function getPublicPresignedUrl(key: string, expiration = 600): Promise<{ url: string; expires_in: number }> {
  const response = await fetch(
    `/api/runway/assets/presigned-url?key=${encodeURIComponent(key)}&expiration=${expiration}`,
    { method: "GET" },
  )

  if (!response.ok) {
    throw new Error("Failed to generate image URL")
  }

  return response.json()
}

function getValidCachedUrl(key: string): string | null {
  const cached = presignedUrlCache.get(key)
  if (!cached) return null
  if (cached.expiresAt - Date.now() <= 60_000) return null
  return cached.url
}

async function resolvePresignedUrl(key: string): Promise<{ url: string; expires_in: number }> {
  const cachedUrl = getValidCachedUrl(key)
  if (cachedUrl) {
    return { url: cachedUrl, expires_in: 60 }
  }

  const pending = inFlightRequests.get(key)
  if (pending) {
    return pending
  }

  const request = getPublicPresignedUrl(key, 600)
  inFlightRequests.set(key, request)

  try {
    const result = await request
    presignedUrlCache.set(key, {
      url: result.url,
      expiresAt: Date.now() + result.expires_in * 1000,
    })
    return result
  } finally {
    inFlightRequests.delete(key)
  }
}

async function preloadImageUrl(url: string, fetchPriority?: "high" | "low" | "auto"): Promise<void> {
  if (!url) return
  if (loadedImageUrls.has(url)) return

  const pending = inFlightImageLoads.get(url)
  if (pending) {
    return pending
  }

  const loading = new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.decoding = "async"
    if (fetchPriority) {
      img.fetchPriority = fetchPriority
    }
    img.onload = () => {
      loadedImageUrls.add(url)
      resolve()
    }
    img.onerror = () => {
      reject(new Error("Failed to preload image"))
    }
    img.src = url
  })

  inFlightImageLoads.set(url, loading)

  try {
    await loading
  } finally {
    inFlightImageLoads.delete(url)
  }
}

export async function prefetchPresignedImage(key: string): Promise<void> {
  if (!key) return
  const result = await resolvePresignedUrl(key)
  try {
    await preloadImageUrl(result.url)
  } catch {
    // Silent failure: the normal render path will still attempt to load the image.
  }
}

export function PresignedImage({ s3Key, alt, className, style, fallbackSrc, priority, width }: PresignedImageProps) {
  const resolvedKey = width ? resizedS3Key(s3Key, width) : s3Key
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [error, setError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const imageUrlRef = useRef<string | null>(null)

  useEffect(() => {
    imageUrlRef.current = imageUrl
  }, [imageUrl])

  useEffect(() => {
    let mounted = true
    let refreshTimer: number | null = null
    let crossfadeTimer: number | null = null
    let rafId: number | null = null
    const fadeDurationMs = 220

    const fetchPresignedUrl = async () => {
      try {
        setLoading(true)
        setError(false)

        const result = await resolvePresignedUrl(resolvedKey)
        await preloadImageUrl(result.url, priority ? "high" : undefined)

        if (mounted) {
          const currentUrl = imageUrlRef.current

          if (!currentUrl) {
            setImageUrl(result.url)
          } else if (currentUrl !== result.url) {
            setOverlayUrl(result.url)
            setOverlayVisible(false)

            rafId = window.requestAnimationFrame(() => {
              setOverlayVisible(true)
            })

            crossfadeTimer = window.setTimeout(() => {
              if (!mounted) return
              setImageUrl(result.url)
              setOverlayUrl(null)
              setOverlayVisible(false)
            }, fadeDurationMs)
          }

          setLoading(false)

          const refreshTime = Math.max((result.expires_in - 60) * 1000, 30_000)
          refreshTimer = window.setTimeout(() => {
            if (mounted) {
              void fetchPresignedUrl()
            }
          }, refreshTime)
        }
      } catch {
        if (mounted) {
          setError(true)
          setLoading(false)
        }
      }
    }

    void fetchPresignedUrl()

    return () => {
      mounted = false
      if (refreshTimer) {
        clearTimeout(refreshTimer)
      }
      if (crossfadeTimer) {
        clearTimeout(crossfadeTimer)
      }
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [resolvedKey, priority])

  // Keep showing the current image while the next one is loading to avoid flash between slides.
  if (loading && !imageUrl) {
    return (
      <div className={`animate-pulse bg-gray-200 ${className || ""}`}>
        <div className="flex h-full items-center justify-center text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error || !imageUrl) {
    return fallbackSrc ? (
      <img src={fallbackSrc} alt={alt} className={className} />
    ) : (
      <div className={`bg-gray-100 ${className || ""}`} aria-hidden="true" />
    )
  }

  return (
    <div className="relative h-full w-full">
      <img src={imageUrl} alt={alt} className={className} style={style} fetchPriority={priority ? "high" : undefined} onError={() => setError(true)} />
      {overlayUrl ? (
        <img
          src={overlayUrl}
          alt={alt}
          className={`absolute inset-0 ${className || ""} transition-opacity duration-200 ${overlayVisible ? "opacity-100" : "opacity-0"}`}
          onError={() => setError(true)}
        />
      ) : null}
    </div>
  )
}
