"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ExternalLink, Loader2, MapPin } from "lucide-react"

import { PresignedImage } from "@/components/assets/PresignedImage"
import { extractS3Key } from "@/components/assets/s3Utils"
import { ContactStylistCta } from "@/components/discover/contact-stylist-cta"
import { DiscoverPostCard } from "@/components/discover/discover-post-card"
import { DiscoverPostModal } from "@/components/discover/discover-post-modal"
import { LoginModal } from "@/components/login-modal"
import { Button } from "@/components/ui/shadcn-button"
import { useLang } from "@/context/lang-context"
import { encodeId } from "@/lib/id-hash"
import { getDiscoverStylistDetail, type DiscoverStylistDetailResponse } from "@/lib/discover-api"

export function StylistDetailClient({ encodedId }: { encodedId: string }) {
  const { lang, t } = useLang()
  const [data, setData] = useState<DiscoverStylistDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const response = await getDiscoverStylistDetail(encodedId)
        if (active) {
          setData(response)
        }
      } catch {
        if (active) {
          setError(t.discover.profileUnavailable)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [encodedId, lang, t.discover.profileUnavailable])

  const visiblePosts = useMemo(() => data?.posts.slice(0, 6) ?? [], [data])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.18em] text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t.discover.loading}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return <div className="rounded-[1.75rem] border border-red-200 bg-white/80 px-6 py-8 text-sm text-red-600">{error}</div>
  }

  const location = [data.stylist.city, data.stylist.country].filter(Boolean).join(", ") || t.discover.unknownLocation
  const hasMorePosts = data.total > visiblePosts.length

  return (
    <section className="space-y-8">
      <Button variant="ghost" asChild>
        <Link href="/discover">
          <ArrowLeft className="h-4 w-4" />
          {t.nav.discover}
        </Link>
      </Button>

      <div className="rounded-[2rem] border border-black/5 bg-white/90 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="h-24 w-24 overflow-hidden rounded-[1.5rem] bg-neutral-100">
              {data.stylist.profile_image ? (
                <PresignedImage
                  s3Key={extractS3Key(data.stylist.profile_image.key || data.stylist.profile_image.url)}
                  alt={data.stylist.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-medium text-neutral-500">
                  {data.stylist.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-400">{t.discover.stylist}</p>
              <h1 className="font-['BlissTwin'] text-4xl tracking-tight md:text-6xl">{data.stylist.name}</h1>
              <p className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-neutral-500">
                <MapPin className="h-4 w-4" />
                {location}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-[1.5rem] border border-black/5 bg-neutral-50 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">{t.discover.recentPosts}</p>
              <p className="mt-2 text-3xl font-semibold text-black">{data.total}</p>
            </div>
            <ContactStylistCta className="rounded-full" />
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setLoginOpen(true)}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t.discover.seeOnInside}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-black/5 bg-white/90 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-400">{t.discover.recentPosts}</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">{t.discover.recentPostsBody}</p>
        </div>

        {visiblePosts.length === 0 ? (
          <p className="text-sm text-neutral-600">{t.discover.noPosts}</p>
        ) : (
          <div className="relative">
            <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
              {visiblePosts.map((post, index) => (
                <DiscoverPostCard
                  key={post.id}
                  post={post}
                  locale={lang}
                  noImageLabel={t.discover.noImage}
                  onOpen={() => setSelectedIndex(index)}
                />
              ))}
            </div>

            {hasMorePosts ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex min-h-[210px] items-end justify-center rounded-b-[1.75rem] bg-[linear-gradient(180deg,rgba(252,250,247,0)_0%,rgba(252,250,247,0.82)_42%,rgba(252,250,247,0.98)_100%)] pb-8">
                <div className="pointer-events-auto rounded-full border border-black/10 bg-white/85 px-6 py-3 text-center text-sm font-medium text-neutral-700 shadow-sm backdrop-blur-sm">
                  {t.discover.loginToSeeMore}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <DiscoverPostModal
        posts={visiblePosts}
        activeIndex={selectedIndex}
        onOpenChange={(open) => {
          if (!open) setSelectedIndex(null)
        }}
        onPrev={() => setSelectedIndex((current) => (current !== null && current > 0 ? current - 1 : current))}
        onNext={() =>
          setSelectedIndex((current) =>
            current !== null && current < visiblePosts.length - 1 ? current + 1 : current,
          )
        }
      />

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        redirectContext={
          data.members[0]?.user_id
            ? { type: "profile", encodedId: encodeId(data.members[0].user_id) }
            : null
        }
      />
    </section>
  )
}
