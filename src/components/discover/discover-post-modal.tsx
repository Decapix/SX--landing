"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

import { PresignedImage } from "@/components/assets/PresignedImage"
import { extractS3Key } from "@/components/assets/s3Utils"
import { ContactStylistCta } from "@/components/discover/contact-stylist-cta"
import { LoginModal } from "@/components/login-modal"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useLang } from "@/context/lang-context"
import { encodeId } from "@/lib/id-hash"
import type { DiscoverPost } from "@/lib/discover-api"

type Props = {
  posts: DiscoverPost[]
  activeIndex: number | null
  onOpenChange: (open: boolean) => void
  onPrev: () => void
  onNext: () => void
}

/* ── Image carousel for a single post (used in both mobile & desktop) ── */
function PostImageCarousel({
  post,
  className,
  imageClassName,
}: {
  post: DiscoverPost
  className?: string
  imageClassName?: string
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const hasMultiple = post.images.length > 1

  // Reset index when the post changes
  useEffect(() => {
    setImgIdx(0)
  }, [post.id])

  if (post.images.length === 0) {
    return (
      <div className={`flex items-center justify-center text-sm text-neutral-400 ${className || ""}`}>
        No image
      </div>
    )
  }

  const image = post.images[imgIdx]

  return (
    <div className={`relative ${className || ""}`}>
      <PresignedImage
        s3Key={extractS3Key(image.key || image.url)}
        alt={post.caption || post.author.stylist.name}
        className={imageClassName || ""}
      />

      {hasMultiple ? (
        <>
          {imgIdx > 0 ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setImgIdx((i) => i - 1) }}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-black shadow backdrop-blur-sm transition hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
          {imgIdx < post.images.length - 1 ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setImgIdx((i) => i + 1) }}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-black shadow backdrop-blur-sm transition hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : null}
          {/* Dots indicator */}
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {post.images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition ${i === imgIdx ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

/* ── Single mobile post card (rendered in the scrollable feed) ── */
function MobilePostCard({
  post,
  lang,
  onClose,
  onLoginOpen,
}: {
  post: DiscoverPost
  lang: "en" | "fr"
  onClose: () => void
  onLoginOpen: () => void
}) {
  const { t } = useLang()
  const authorName = [post.author.firstname, post.author.lastname].filter(Boolean).join(" ") || post.author.username
  const authorDisplayName = post.author.stylist.name
  const publishedAt = new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" }).format(new Date(post.created_at))
  const likesCount = new Intl.NumberFormat(lang).format(post.likes_count)

  return (
    <div className="border-b border-black/5">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link
          href={`/discover/stylist/${encodeId(post.author.stylist.id)}`}
          onClick={onClose}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="h-9 w-9 overflow-hidden rounded-full bg-neutral-100">
            {post.author.profile_image ? (
              <PresignedImage
                s3Key={extractS3Key(post.author.profile_image.key || post.author.profile_image.url)}
                alt={authorName}
                className="h-full w-full object-cover"
              />
            ) : post.author.stylist.profile_image ? (
              <PresignedImage
                s3Key={extractS3Key(post.author.stylist.profile_image.key || post.author.stylist.profile_image.url)}
                alt={post.author.stylist.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-neutral-500">
                {post.author.stylist.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <p className="truncate text-sm font-semibold text-black">{authorDisplayName}</p>
        </Link>
      </div>

      {/* Image carousel */}
      <PostImageCarousel
        post={post}
        className="w-full bg-black"
        imageClassName="w-full object-contain"
      />

      {/* Content */}
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-black">{likesCount} likes</p>
        <p className="mt-2 text-sm leading-6 text-neutral-800">
          <span className="font-semibold">{authorDisplayName}</span>{" "}
          {post.caption || t.discover.noCaption}
        </p>
        {post.categories.length > 0 || post.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.categories.map((c) => (
              <span key={c} className="rounded-full border border-black/10 px-2.5 py-0.5 text-xs text-neutral-600">{c}</span>
            ))}
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-black/10 px-2.5 py-0.5 text-xs text-neutral-600">#{tag}</span>
            ))}
          </div>
        ) : null}
        <p className="mt-2 text-xs text-neutral-400">{publishedAt}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-black/5 pt-3">
          <Link
            href={`/discover/stylist/${encodeId(post.author.stylist.id)}`}
            onClick={onClose}
            className="text-sm font-medium text-neutral-700 underline decoration-neutral-400 underline-offset-4 hover:text-black"
          >
            {t.discover.seeProfile}
          </Link>
          <ContactStylistCta variant="link" className="text-sm underline decoration-neutral-400 underline-offset-4" />
          <button
            type="button"
            onClick={onLoginOpen}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 underline decoration-neutral-400 underline-offset-4 hover:text-black"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t.discover.seeOnInside}
          </button>
        </div>
      </div>
    </div>
  )
}

export function DiscoverPostModal({ posts, activeIndex, onOpenChange, onPrev, onNext }: Props) {
  const { lang, t } = useLang()
  const [loginOpen, setLoginOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const post = activeIndex !== null ? posts[activeIndex] ?? null : null

  // Scroll mobile feed to top when opening a new post
  useEffect(() => {
    if (activeIndex !== null && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [activeIndex])

  if (!post || activeIndex === null) {
    return <Dialog open={false} onOpenChange={onOpenChange} />
  }

  const authorName = [post.author.firstname, post.author.lastname].filter(Boolean).join(" ") || post.author.username
  const publishedAt = new Intl.DateTimeFormat(lang, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(post.created_at))

  const authorDisplayName = post.author.stylist.name
  const likesCount = new Intl.NumberFormat(lang).format(post.likes_count)

  const close = () => onOpenChange(false)

  return (
    <Dialog open={activeIndex !== null} onOpenChange={onOpenChange}>
      <DialogContent className="w-[100vw] max-w-none overflow-hidden rounded-none border-none bg-white p-0 shadow-[0_30px_120px_rgba(0,0,0,0.2)] md:w-auto md:max-w-[min(1100px,95vw)] md:rounded-2xl">
        <DialogTitle className="sr-only">{t.discover.postDetails}</DialogTitle>
        <DialogDescription className="sr-only">{post.caption || authorName}</DialogDescription>

        {/* Desktop prev/next post arrows (outside the modal) */}
        {activeIndex > 0 ? (
          <button
            type="button"
            onClick={onPrev}
            className="absolute -left-12 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow-lg transition hover:bg-white md:block"
            aria-label={t.discover.previousPost}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : null}
        {activeIndex < posts.length - 1 ? (
          <button
            type="button"
            onClick={onNext}
            className="absolute -right-12 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow-lg transition hover:bg-white md:block"
            aria-label={t.discover.nextPost}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : null}

        {/* ── Mobile layout: vertical scrollable feed ── */}
        <div ref={scrollRef} className="h-[100dvh] overflow-y-auto md:hidden">
          {posts.slice(activeIndex).map((p) => (
            <MobilePostCard
              key={p.id}
              post={p}
              lang={lang}
              onClose={close}
              onLoginOpen={() => setLoginOpen(true)}
            />
          ))}
        </div>

        {/* ── Desktop layout: image left + sidebar right ── */}
        <div className="hidden md:flex md:h-[85vh] md:max-h-[900px]">
          {/* Image — full height, natural aspect ratio, fully visible */}
          <PostImageCarousel
            post={post}
            className="flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden bg-black"
            imageClassName="h-full w-full object-contain"
          />

          {/* Sidebar */}
          <div className="flex h-full w-[380px] flex-shrink-0 flex-col border-l border-black/10 bg-white">
            {/* Author header */}
            <div className="flex items-center gap-3 border-b border-black/10 px-5 py-4">
              <Link
                href={`/discover/stylist/${encodeId(post.author.stylist.id)}`}
                onClick={close}
                className="flex min-w-0 items-center gap-3"
              >
                <div className="h-9 w-9 overflow-hidden rounded-full bg-neutral-100">
                  {post.author.profile_image ? (
                    <PresignedImage
                      s3Key={extractS3Key(post.author.profile_image.key || post.author.profile_image.url)}
                      alt={authorName}
                      className="h-full w-full object-cover"
                    />
                  ) : post.author.stylist.profile_image ? (
                    <PresignedImage
                      s3Key={extractS3Key(post.author.stylist.profile_image.key || post.author.stylist.profile_image.url)}
                      alt={post.author.stylist.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-medium text-neutral-500">
                      {post.author.stylist.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-black">{authorDisplayName}</p>
                  <p className="truncate text-xs text-neutral-500">{publishedAt}</p>
                </div>
              </Link>
            </div>

            {/* Scrollable caption + tags */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-4 px-5 py-4">
                <p className="text-sm leading-6 text-neutral-800">
                  <span className="font-semibold">{authorDisplayName}</span>{" "}
                  {post.caption || t.discover.noCaption}
                </p>

                {post.categories.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">{t.discover.categories}</p>
                    <div className="flex flex-wrap gap-2">
                      {post.categories.map((category) => (
                        <span key={category} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-neutral-600">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {post.tags.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">{t.discover.tags}</p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-neutral-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Footer actions */}
            <div className="space-y-3 border-t border-black/10 bg-white px-5 py-4">
              <p className="text-sm font-semibold text-black">{likesCount} likes</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <Link
                  href={`/discover/stylist/${encodeId(post.author.stylist.id)}`}
                  onClick={close}
                  className="inline-block text-sm font-medium text-neutral-700 underline decoration-neutral-400 underline-offset-4 hover:text-black"
                >
                  {t.discover.seeProfile}
                </Link>
                <ContactStylistCta variant="link" className="text-sm underline decoration-neutral-400 underline-offset-4" />
                <button
                  type="button"
                  onClick={() => setLoginOpen(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 underline decoration-neutral-400 underline-offset-4 hover:text-black"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t.discover.seeOnInside}
                </button>
              </div>
              <p className="text-xs text-neutral-400">{publishedAt}</p>
            </div>
          </div>
        </div>
      </DialogContent>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        redirectContext={{ type: "post", encodedId: encodeId(post.id) }}
      />
    </Dialog>
  )
}
