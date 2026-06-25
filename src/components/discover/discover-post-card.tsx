"use client"

import Link from "next/link"

import { PresignedImage } from "@/components/assets/PresignedImage"
import { extractS3Key } from "@/components/assets/s3Utils"
import { ContactStylistCta } from "@/components/discover/contact-stylist-cta"
import { useLang } from "@/context/lang-context"
import { encodeId } from "@/lib/id-hash"
import type { DiscoverPost } from "@/lib/discover-api"

type Props = {
  post: DiscoverPost
  locale: "en" | "fr"
  noImageLabel: string
  onOpen: () => void
  priority?: boolean
}

export function DiscoverPostCard({ post, locale, noImageLabel, onOpen, priority }: Props) {
  const { t } = useLang()
  const authorName = [post.author.firstname, post.author.lastname].filter(Boolean).join(" ") || post.author.username
  const publishedAt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(post.created_at))

  return (
    <article className="group relative overflow-visible rounded-[1.9rem] bg-transparent">
      <div className="relative z-10 flex min-w-0 items-center gap-3 px-4 pb-3 pt-4">
        <Link
          href={`/discover/stylist/${encodeId(post.author.stylist.id)}`}
          className="h-10 w-10 overflow-hidden rounded-full bg-neutral-100"
        >
          {post.author.profile_image ? (
            <PresignedImage
              s3Key={extractS3Key(post.author.profile_image.key || post.author.profile_image.url)}
              alt={authorName}
              className="h-full w-full object-cover"
              width={80}
            />
          ) : post.author.stylist.profile_image ? (
            <PresignedImage
              s3Key={extractS3Key(post.author.stylist.profile_image.key || post.author.stylist.profile_image.url)}
              alt={post.author.stylist.name}
              className="h-full w-full object-cover"
              width={80}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-neutral-500">
              {post.author.stylist.name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/discover/stylist/${encodeId(post.author.stylist.id)}`}
            className="block truncate text-sm font-semibold text-black hover:opacity-70"
          >
            {post.author.stylist.name}
          </Link>
          <p className="truncate text-[11px] uppercase tracking-[0.18em] text-neutral-500">{publishedAt}</p>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            onOpen()
          }
        }}
        className="block w-full cursor-pointer text-left"
      >
        <div className="relative overflow-hidden rounded-[1.9rem] bg-neutral-100 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
          {post.images[0] ? (
            <PresignedImage
              s3Key={extractS3Key(post.images[0].key || post.images[0].url)}
              alt={post.caption || post.author.stylist.name}
              className="h-auto w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              priority={priority}
              width={800}
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center text-sm text-neutral-400">{noImageLabel}</div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-black/0 opacity-0 transition-all duration-500 ease-out group-hover:bg-black/55 group-hover:opacity-100" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-6 p-5 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            <div className="space-y-3 text-white">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onOpen()
                }}
                className="pointer-events-auto block w-full text-left"
              >
                <p className="line-clamp-4 max-w-[22rem] text-sm leading-6 text-white/95">
                  {post.caption || t.discover.noCaption}
                </p>
              </button>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link
                  href={`/discover/stylist/${encodeId(post.author.stylist.id)}`}
                  onClick={(event) => event.stopPropagation()}
                  className="text-xs font-medium uppercase tracking-[0.18em] text-white underline decoration-white/60 underline-offset-4 hover:text-white"
                >
                  {t.discover.seeProfile}
                </Link>
                <ContactStylistCta
                  variant="link"
                  className="pointer-events-auto text-xs uppercase tracking-[0.18em] text-white underline decoration-white/60 underline-offset-4 hover:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
