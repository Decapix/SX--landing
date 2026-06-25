"use client"
import Link from "next/link"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { PresignedImage, prefetchPresignedImage } from "@/components/assets/PresignedImage"
import { extractS3Key } from "@/components/assets/s3Utils"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useLang } from "@/context/lang-context"
import { getDiscoverPosts, type DiscoverPost } from "@/lib/discover-api"

type UserType = "stylist" | "brand" | "PressOffice"
type FieldKey =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "country"
  | "role"
  | "socialMedia"
  | "entityName"
  | "website"
  | "text"

interface FieldMeta {
  key: FieldKey
  type?: "text" | "email" | "tel" | "textarea"
  required?: boolean
  autocomplete?: string
  half?: boolean
}

const FIELDS: FieldMeta[] = [
  { key: "firstName", required: true, autocomplete: "given-name", half: true },
  { key: "lastName", required: true, autocomplete: "family-name", half: true },
  { key: "email", type: "email", required: true, autocomplete: "email", half: true },
  { key: "phone", type: "tel", required: true, autocomplete: "tel", half: true },
  { key: "country", required: true, autocomplete: "country-name", half: true },
  { key: "role", required: true, autocomplete: "organization-title", half: true },
  { key: "socialMedia" },
  { key: "entityName", autocomplete: "organization" },
  { key: "website", autocomplete: "url" },
  { key: "text", type: "textarea" },
]

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function requiresEntityName(userType: UserType | "") {
  return userType === "brand" || userType === "PressOffice"
}

export default function BookDemoPage() {
  const { t, lang } = useLang()
  const uid = useId()

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [touched, setTouched] = useState<Partial<Record<FieldKey | "userType", boolean>>>({})
  const [posts, setPosts] = useState<DiscoverPost[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsError, setPostsError] = useState(false)
  const [carouselIdx, setCarouselIdx] = useState(0)
  const [cardVisible, setCardVisible] = useState(true)
  const carouselIdxRef = useRef(0)
  const isSlidingRef = useRef(false)
  const transitionTimerRef = useRef<number | null>(null)

  const [form, setForm] = useState<{
    userType: UserType | ""
    firstName: string
    lastName: string
    email: string
    phone: string
    country: string
    socialMedia: string
    role: string
    entityName: string
    website: string
    text: string
  }>({
    userType: "" as UserType | "",
    firstName: "", lastName: "", email: "", phone: "",
    country: "", socialMedia: "", role: "",
    entityName: "", website: "", text: "",
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const blur = (k: FieldKey | "userType") => () =>
    setTouched((prev) => ({ ...prev, [k]: true }))

  const labels: Record<FieldKey, string> = {
    firstName: t.bookDemo.firstName,
    lastName: t.bookDemo.lastName,
    email: t.bookDemo.email,
    phone: t.bookDemo.phone,
    country: t.bookDemo.country,
    role: t.bookDemo.role,
    socialMedia: t.bookDemo.socialMedia,
    entityName:
      requiresEntityName(form.userType)
        ? (t.bookDemo.entityNameRequired ?? t.bookDemo.entityName)
        : t.bookDemo.entityName,
    website: t.bookDemo.website,
    text: t.bookDemo.message,
  }

  function isFieldRequired(k: FieldKey): boolean {
    if (k === "entityName") return requiresEntityName(form.userType)
    return Boolean(FIELDS.find((f) => f.key === k)?.required)
  }

  function fieldError(k: FieldKey): string | null {
    if (!touched[k]) return null
    const value = form[k].trim()
    const isRequired = isFieldRequired(k)
    if (isRequired && !value) return t.bookDemo.errorRequired ?? "Ce champ est requis."
    if (k === "email" && value && !validateEmail(value)) {
      return t.bookDemo.errorEmail ?? "Veuillez saisir un email valide."
    }
    return null
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    const requiredKeys: Array<FieldKey | "userType"> = [
      "userType",
      "firstName",
      "lastName",
      "email",
      "phone",
      "country",
      "role",
    ]

    if (requiresEntityName(form.userType)) {
      requiredKeys.push("entityName")
    }

    const nextTouched = Object.fromEntries(requiredKeys.map((key) => [key, true])) as Partial<
      Record<FieldKey | "userType", boolean>
    >
    setTouched((prev) => ({ ...prev, ...nextTouched }))

    if (
      !form.userType ||
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.phone.trim() ||
      !form.country.trim() ||
      !form.role.trim() ||
      (requiresEntityName(form.userType) && !form.entityName.trim()) ||
      !validateEmail(form.email)
    ) {
      return
    }

    setStatus("loading")
    try {
      const res = await fetch("/api/try-the-plateform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language: lang }),
      })
      setStatus(res.ok ? "success" : "error")
    } catch {
      setStatus("error")
    }
  }

  const baseInput = [
    "w-full bg-neutral-50 border-0 border-b border-b-neutral-300 rounded-none px-3 py-2 text-sm",
    "placeholder:text-neutral-400 outline-none transition-all duration-150",
    "hover:bg-white",
    "focus:bg-white focus:border-0 focus:border-b focus:border-b-neutral-900 focus:ring-0",
  ].join(" ")

  const labelClass = "block text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-1 font-medium"
  const errorClass = "mt-1 text-[11px] text-red-500 flex items-center gap-1"

  function renderField(field: FieldMeta) {
    const id = `${uid}-${field.key}`
    const errId = `${uid}-${field.key}-err`
    const err = fieldError(field.key)

    const sharedProps = {
      id,
      "aria-label": labels[field.key],
      "aria-required": isFieldRequired(field.key) ? ("true" as const) : undefined,
      "aria-invalid": err ? ("true" as const) : undefined,
      "aria-describedby": err ? errId : undefined,
      value: form[field.key],
      onChange: set(field.key),
      onBlur: blur(field.key),
    }

    return (
      <div key={field.key} className="flex flex-col">
        <label htmlFor={id} className={labelClass}>
          {labels[field.key]}
          {isFieldRequired(field.key) && <span aria-hidden="true" className="ml-0.5 text-neutral-900">*</span>}
        </label>
        {field.type === "textarea" ? (
          <textarea {...sharedProps} rows={4} className={`${baseInput} resize-none`} />
        ) : (
          <input
            {...sharedProps}
            type={field.type ?? "text"}
            autoComplete={field.autocomplete}
            className={baseInput}
          />
        )}
        {err && (
          <span id={errId} role="alert" className={errorClass}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
              <path d="M6 3.5v3M6 8.5v.5" stroke="currentColor" strokeLinecap="round" />
            </svg>
            {err}
          </span>
        )}
      </div>
    )
  }

  function renderFields() {
    const out: React.ReactNode[] = []
    let i = 0
    while (i < FIELDS.length) {
      const field = FIELDS[i]
      if (field.half && FIELDS[i + 1]?.half) {
        out.push(
          <div key={`${field.key}-pair`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderField(field)}
            {renderField(FIELDS[i + 1])}
          </div>
        )
        i += 2
      } else {
        out.push(renderField(field))
        i += 1
      }
    }
    return out
  }

  const userTypeError =
    touched.userType && !form.userType
      ? (t.bookDemo.userTypeError ?? "Veuillez sélectionner votre profil.")
      : null

  useEffect(() => {
    let active = true

    const loadPosts = async () => {
      setPostsLoading(true)
      setPostsError(false)
      try {
        const response = await getDiscoverPosts({ limit: 8 })
        if (!active) return
        const items = response.items.filter((post) => post.images.length > 0)
        setPosts(items.length > 0 ? items : response.items)
        setCarouselIdx(0)
        carouselIdxRef.current = 0
      } catch {
        if (active) setPostsError(true)
      } finally {
        if (active) setPostsLoading(false)
      }
    }

    void loadPosts()

    return () => {
      active = false
    }
  }, [])

  const getPostImageKey = useCallback((post: DiscoverPost | undefined) => {
    if (!post?.images[0]) return ""
    return extractS3Key(post.images[0].key || post.images[0].url)
  }, [])

  const preloadPostImage = useCallback(
    async (post: DiscoverPost | undefined) => {
      const key = getPostImageKey(post)
      if (!key) return
      try {
        await prefetchPresignedImage(key)
      } catch {
        // Silent fallback: carousel keeps working even if prefetch fails.
      }
    },
    [getPostImageKey]
  )

  useEffect(() => {
    if (posts.length === 0) return
    posts.slice(0, 6).forEach((post) => {
      void preloadPostImage(post)
    })
  }, [posts, preloadPostImage])

  useEffect(() => {
    if (posts.length <= 1) return
    const next = (carouselIdx + 1) % posts.length
    void preloadPostImage(posts[next])
  }, [carouselIdx, posts, preloadPostImage])

  const slideToIndex = useCallback(
    async (next: number) => {
      if (posts.length <= 1 || next === carouselIdxRef.current || isSlidingRef.current) return

      isSlidingRef.current = true
      await preloadPostImage(posts[next])

      setCardVisible(false)

      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current)
      }

      transitionTimerRef.current = window.setTimeout(() => {
        carouselIdxRef.current = next
        setCarouselIdx(next)
        setCardVisible(true)
        isSlidingRef.current = false
        transitionTimerRef.current = null
      }, 240)
    },
    [posts, posts.length, preloadPostImage]
  )

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (posts.length <= 1) return
    const interval = window.setInterval(() => {
      const next = (carouselIdxRef.current + 1) % posts.length
      void slideToIndex(next)
    }, 5500)
    return () => window.clearInterval(interval)
  }, [posts.length, slideToIndex])

  const currentPost = posts[carouselIdx]
  const postAuthor = currentPost
    ? [currentPost.author.firstname, currentPost.author.lastname].filter(Boolean).join(" ") || currentPost.author.username
    : ""
  const postDate = currentPost
    ? new Intl.DateTimeFormat(lang, { day: "numeric", month: "short", year: "numeric" }).format(new Date(currentPost.created_at))
    : ""

  return (
    <>
      <Header />

      <main className="flex-1 pt-14 bg-white">
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14" aria-labelledby="try-the-plateform-heading">
          <div className="grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_420px] gap-10 xl:gap-16 items-start">
            <div>
              {/* Eyebrow */}
              <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400 mb-3 font-medium">
                {t.bookDemo.intro ?? "Accédez à la plateforme pour la tester avec votre équipe."}
              </p>
              <h1 id="try-the-plateform-heading" className="font-['BlissTwin'] text-5xl tracking-tight sm:text-7xl leading-[1.02] mb-3">
                {t.bookDemo.title}
              </h1>
              <div className="h-px w-10 bg-neutral-900 mb-5" aria-hidden="true" />
              {status === "success" ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="py-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="w-10 h-10 rounded-full border border-neutral-900 flex items-center justify-center mb-6">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p tabIndex={-1} className="text-lg font-light leading-relaxed text-neutral-700 max-w-sm outline-none">
                    {t.bookDemo.success}
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={submit}
                  noValidate
                  className="max-w-xl flex flex-col gap-3"
                  aria-label={t.bookDemo.formLabel ?? "Formulaire de demande de démo"}
                >
                  <fieldset
                    className="border-0 p-0 m-0"
                    aria-describedby={userTypeError ? `${uid}-userType-err` : undefined}
                    onBlur={blur("userType")}
                  >
                    <legend className={labelClass}>
                      {t.bookDemo.userType}
                      <span aria-hidden="true" className="ml-0.5 text-neutral-900">*</span>
                    </legend>

                    <div className="flex flex-wrap gap-3">
                      {(["stylist", "brand", "PressOffice"] as UserType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setForm((f) => ({ ...f, userType: type }))
                            setTouched((prev) => ({ ...prev, userType: true }))
                          }}
                          aria-pressed={form.userType === type}
                          className={`px-5 h-10 text-[11px] uppercase tracking-[0.14em] border transition-colors ${
                            form.userType === type
                              ? "bg-neutral-900 text-white border-neutral-900"
                              : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-900"
                          }`}
                        >
                          {type === "stylist"
                            ? t.bookDemo.stylist
                            : type === "brand"
                              ? t.bookDemo.brand
                              : t.bookDemo.pressOffice}
                        </button>
                      ))}
                    </div>
                    {userTypeError && (
                      <span id={`${uid}-userType-err`} role="alert" className={errorClass}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
                          <path d="M6 3.5v3M6 8.5v.5" stroke="currentColor" strokeLinecap="round" />
                        </svg>
                        {userTypeError}
                      </span>
                    )}
                  </fieldset>

                  {renderFields()}

                  {status === "error" && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="flex items-start gap-3 rounded-sm border border-red-200 bg-red-50 px-4 py-3"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0 text-red-500" aria-hidden="true">
                        <circle cx="7" cy="7" r="6.5" stroke="currentColor" />
                        <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeLinecap="round" />
                      </svg>
                      <p className="text-sm text-red-700">{t.bookDemo.error}</p>
                    </div>
                  )}

                  <div className="pt-1 flex items-center gap-5">
                    <Button
                      type="submit"
                      disabled={status === "loading"}
                      aria-busy={status === "loading"}
                      className={[
                        "relative overflow-hidden h-11 px-8 text-xs uppercase tracking-[0.14em] font-medium",
                        "bg-neutral-900 text-white hover:bg-neutral-700 transition-colors duration-200",
                        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900",
                        "disabled:opacity-50 disabled:cursor-not-allowed rounded-none",
                      ].join(" ")}
                    >
                      {status === "loading" ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span aria-live="polite">{t.bookDemo.sending ?? "Envoi…"}</span>
                        </span>
                      ) : (
                        t.bookDemo.submit
                      )}
                    </Button>
                    <p className="text-[11px] text-neutral-400">* {t.bookDemo.requiredNote ?? "Champs obligatoires"}</p>
                  </div>
                </form>
              )}
            </div>

            <aside className="lg:sticky lg:top-20 self-start" aria-label={t.bookDemo.carouselAria ?? "Posts utilisateurs"}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-px bg-neutral-300" />
                <p className="text-[9px] uppercase tracking-[0.28em] text-neutral-500 font-light">
                  {t.bookDemo.carouselEyebrow ?? "Depuis la plateforme"}
                </p>
              </div>

              <p className="text-sm text-neutral-600 mb-4">
                {t.bookDemo.carouselTitle ?? "Aperçu des posts publiés par les stylistes."}
              </p>

              {postsLoading ? (
                <div className="w-full border border-neutral-200 bg-neutral-100/70 p-2 animate-pulse">
                  <div className="aspect-[2/3] bg-neutral-200" />
                  <div className="h-10 mt-2 bg-neutral-200" />
                </div>
              ) : postsError || posts.length === 0 ? (
                <div className="w-full border border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
                  {t.bookDemo.carouselEmpty ?? "Impossible de charger les posts pour le moment."}
                </div>
              ) : (
                <>
                  <Link
                    href="/discover"
                    className="group block"
                    style={{
                      opacity: cardVisible ? 1 : 0,
                      transform: cardVisible ? "translateY(0)" : "translateY(6px)",
                      transition: "opacity 350ms ease, transform 350ms ease",
                    }}
                  >
                    <div className="w-full border border-neutral-200 bg-white p-2 flex flex-col gap-2.5 group-hover:border-neutral-400 transition-colors duration-300">
                      <div className="relative overflow-hidden border border-neutral-200 bg-neutral-100 w-full aspect-[2/3]">
                        {currentPost?.images[0] ? (
                          <PresignedImage
                            s3Key={extractS3Key(currentPost.images[0].key || currentPost.images[0].url)}
                            alt={currentPost.caption || postAuthor}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200" />
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                        <p className="absolute bottom-2 left-2 text-white/75 text-[8px] uppercase tracking-[0.2em] font-light">
                          {postDate}
                        </p>
                      </div>

                      <div className="flex items-start justify-between gap-3 border-t border-neutral-200 pt-1.5">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">{postAuthor}</p>
                          <p className="text-xs text-neutral-700 line-clamp-2 mt-1">
                            {currentPost?.caption || t.discover.noCaption}
                          </p>
                        </div>
                        <span className="text-[8px] uppercase tracking-[0.16em] text-neutral-500 shrink-0 mt-0.5">
                          {t.bookDemo.carouselCta ?? "Voir"}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {posts.length > 1 && (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => void slideToIndex((carouselIdx - 1 + posts.length) % posts.length)}
                        aria-label={t.bookDemo.carouselPrev ?? "Post précédent"}
                        className="w-5 h-5 border border-neutral-300 bg-white hover:border-neutral-900 flex items-center justify-center transition-all"
                      >
                        <svg className="w-2 h-2 text-neutral-500" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      {posts.slice(0, Math.min(10, posts.length)).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => void slideToIndex(i)}
                          aria-label={`${t.bookDemo.carouselItem ?? "Post"} ${i + 1}`}
                          className="block h-px transition-all duration-300"
                          style={{
                            width: i === carouselIdx ? 16 : 5,
                            backgroundColor: i === carouselIdx ? "rgba(23,23,23,0.65)" : "rgba(23,23,23,0.2)",
                          }}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => void slideToIndex((carouselIdx + 1) % posts.length)}
                        aria-label={t.bookDemo.carouselNext ?? "Post suivant"}
                        className="w-5 h-5 border border-neutral-300 bg-white hover:border-neutral-900 flex items-center justify-center transition-all"
                      >
                        <svg className="w-2 h-2 text-neutral-500" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </aside>
          </div>

        </section>
      </main>
      <Footer />
    </>
  )
}
