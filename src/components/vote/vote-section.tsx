"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { PresignedImage } from "@/components/assets/PresignedImage"
import { extractS3Key } from "@/components/assets/s3Utils"
import { LinkButton } from "@/components/ui/button"
import { useLang } from "@/context/lang-context"
import type { LandingVoteSession } from "@/lib/vote-api"

type Props = {
  session: LandingVoteSession
}

type VoteClientPayload = {
  browser_name?: string | null
  browser_version?: string | null
  os_name?: string | null
  os_version?: string | null
  device_type?: string
  browser_language?: string
  browser_languages?: string[]
  timezone?: string
  platform?: string
  referrer?: string
  page_url?: string
  screen_width?: number
  screen_height?: number
  viewport_width?: number
  viewport_height?: number
  is_online?: boolean
  cookie_enabled?: boolean
  do_not_track?: string | null
  extra?: Record<string, string | number | boolean | null>
}

function detectBrowser(userAgent: string): { name: string | null; version: string | null } {
  const rules = [
    { name: "Edge", pattern: /Edg\/([\d.]+)/ },
    { name: "Chrome", pattern: /Chrome\/([\d.]+)/ },
    { name: "Firefox", pattern: /Firefox\/([\d.]+)/ },
    { name: "Safari", pattern: /Version\/([\d.]+).*Safari/ },
  ]

  for (const rule of rules) {
    const match = userAgent.match(rule.pattern)
    if (match) {
      return { name: rule.name, version: match[1] ?? null }
    }
  }

  return { name: null, version: null }
}

function detectOs(userAgent: string): { name: string | null; version: string | null } {
  if (/Windows NT 10.0/.test(userAgent)) return { name: "Windows", version: "10" }
  if (/Windows NT 11.0/.test(userAgent)) return { name: "Windows", version: "11" }
  if (/Mac OS X ([\d_]+)/.test(userAgent)) {
    const version = userAgent.match(/Mac OS X ([\d_]+)/)?.[1]?.replaceAll("_", ".") ?? null
    return { name: "macOS", version }
  }
  if (/Android ([\d.]+)/.test(userAgent)) {
    return { name: "Android", version: userAgent.match(/Android ([\d.]+)/)?.[1] ?? null }
  }
  if (/(iPhone|iPad|iPod)/.test(userAgent)) {
    const version = userAgent.match(/OS ([\d_]+)/)?.[1]?.replaceAll("_", ".") ?? null
    return { name: "iOS", version }
  }
  if (/Linux/.test(userAgent)) return { name: "Linux", version: null }
  return { name: null, version: null }
}

function detectDeviceType(userAgent: string): string {
  if (/Tablet|iPad/.test(userAgent)) return "tablet"
  if (/Mobi|Android/.test(userAgent)) return "mobile"
  return "desktop"
}

function buildClientPayload(): VoteClientPayload {
  const ua = navigator.userAgent
  const browser = detectBrowser(ua)
  const os = detectOs(ua)

  return {
    browser_name: browser.name,
    browser_version: browser.version,
    os_name: os.name,
    os_version: os.version,
    device_type: detectDeviceType(ua),
    browser_language: navigator.language,
    browser_languages: [...(navigator.languages ?? [])],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    referrer: document.referrer || undefined,
    page_url: window.location.href,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    is_online: navigator.onLine,
    cookie_enabled: navigator.cookieEnabled,
    do_not_track: navigator.doNotTrack,
    extra: {
      user_agent: ua,
      hardware_concurrency: navigator.hardwareConcurrency ?? null,
      max_touch_points: navigator.maxTouchPoints ?? null,
    },
  }
}

function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}

export function VoteSection({ session }: Props) {
  const { t } = useLang()
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { ref: cardsGridRef, visible: cardsVisible } = useReveal(0.08)

  const storageKey = useMemo(() => `inside-runway-vote:${session.id}`, [session.id])
  const hasVoted = selectedOptionId !== null

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored) {
        setSelectedOptionId(stored)
      }
    } catch {
      // Ignore storage access issues.
    }
  }, [storageKey])

  async function handleVote(optionId: string) {
    setSubmittingId(optionId)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(`/api/vote/${session.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionId,
          client: buildClientPayload(),
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.detail || t.home.vote.submitError)
      }

      setSelectedOptionId(optionId)
      setMessage(t.home.vote.submitSuccess)
      window.localStorage.setItem(storageKey, optionId)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.home.vote.submitError)
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <section className="bg-[linear-gradient(180deg,#f5f1ea_0%,#ede7dd_100%)] border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr] lg:gap-10">
          <div className="space-y-4">
            <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              <span className="w-4 h-px bg-neutral-400" />
              {t.home.vote.eyebrow}
            </p>
            <div className="space-y-4">
              <h2 className="font-['BlissTwin'] text-[1.7rem] sm:text-[2.1rem] md:text-[2.55rem] tracking-tight leading-[1.05] whitespace-nowrap">
                {t.home.vote.title ?? session.title}
              </h2>
              <p className="max-w-xl text-sm md:text-base leading-relaxed font-light text-neutral-600">
                {t.home.vote.fallbackDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              <span>{session.options.length} {t.home.vote.optionsLabel}</span>
              {hasVoted ? <span>{t.home.vote.alreadyVoted}</span> : <span>{t.home.vote.selectPrompt}</span>}
            </div>

            {message ? (
              <div className="rounded-2xl border border-neutral-300 bg-white/60 px-4 py-3 text-sm text-neutral-800 backdrop-blur">
                {message}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                {error}
              </div>
            ) : null}
          </div>

          <div
            ref={cardsGridRef as React.RefObject<HTMLDivElement>}
            className="grid gap-4 md:grid-cols-2"
          >
            {session.options.map((option, index) => {
              const isSelected = selectedOptionId === option.id
              const previewImages = option.images.slice(0, 4)

              return (
                <article
                  key={option.id}
                  className={`overflow-hidden rounded-sm border bg-white/75 shadow-[0_10px_35px_rgba(0,0,0,0.06)] backdrop-blur transition ${
                    isSelected ? "border-black" : "border-neutral-200"
                  } ${
                    hasVoted && !isSelected ? "opacity-45 saturate-0" : ""
                  }`}
                  style={{
                    opacity: cardsVisible ? 1 : 0,
                    transform: cardsVisible ? "translateY(0)" : "translateY(16px)",
                    filter: cardsVisible ? "blur(0px)" : "blur(4px)",
                    willChange: "opacity, transform, filter",
                    transitionProperty: "opacity, transform, filter",
                    transitionDuration: "780ms, 780ms, 620ms",
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                    transitionDelay: `${index * 75}ms`,
                  }}
                >
                  <div className="relative grid grid-cols-2 gap-1 bg-neutral-200 p-1 border-b border-neutral-200">
                    {previewImages.length > 0 ? (
                      previewImages.map((image, imageIndex) => (
                        <div
                          key={`${option.id}-${imageIndex}`}
                          className={`${previewImages.length === 1 ? "col-span-2 aspect-[4/5]" : "aspect-square"} overflow-hidden rounded-sm bg-neutral-300`}
                        >
                          <PresignedImage
                            s3Key={extractS3Key(image.key || image.url)}
                            alt={`${option.title} ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 aspect-[4/5] rounded-sm bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.65),_rgba(17,17,17,0.08))]" />
                    )}

                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-sm bg-black/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white">
                      {t.home.vote.optionsLabel} {index + 1}
                    </div>

                    {option.images.length > 4 ? (
                      <div className="absolute right-4 top-4 rounded-sm bg-white/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-neutral-800">
                        +{option.images.length - 4}
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold tracking-tight text-neutral-950">{option.title}</h3>
                      <p className="text-sm leading-relaxed text-neutral-500">
                        {isSelected ? t.home.vote.selectedCard : t.home.vote.cardHint}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => handleVote(option.id)}
                        disabled={submittingId !== null || hasVoted}
                        className={`inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-[11px] uppercase tracking-[0.18em] transition ${
                          isSelected
                            ? "bg-neutral-900 text-white"
                            : hasVoted
                              ? "bg-neutral-200 text-neutral-500"
                              : "bg-black text-white hover:bg-neutral-800"
                        } disabled:cursor-not-allowed disabled:opacity-70`}
                      >
                        {submittingId === option.id
                          ? t.home.vote.submitting
                          : isSelected
                            ? t.home.vote.voted
                            : t.home.vote.voteCta}
                      </button>
                      {option.link ? (
                        <LinkButton
                          href={option.link}
                          variant="ghost"
                          className="!rounded-sm !px-4 !py-2.5 !text-[11px] !tracking-[0.18em] w-full sm:w-auto justify-center"
                        >
                          {t.home.vote.discoverOption}
                        </LinkButton>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
