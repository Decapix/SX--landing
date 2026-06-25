# Inside Runway — Full Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Completely redesign the Inside Runway landing site into a luxury-fashion-meets-SaaS multi-page site (black & white, BlissTwin + Urbanist) while keeping all existing API routes intact.

**Architecture:** Next.js App Router multi-page site. Simple FR/EN language context (no i18n lib). All pages share a minimal Header/Footer. Forms wire to existing `/api/contact` and `/api/try-the-plateform` routes.

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, `next/font` (Urbanist), BlissTwin (local font), nodemailer (contact API — already in place).

---

## Task 1: Delete all files to be removed

**Files to delete:**
- `src/components/analytics.tsx`
- `src/components/language-provider.tsx`
- `src/components/language-switcher.tsx`
- `src/components/horizontal-scroll.tsx`
- `src/components/sections/hero-section.tsx`
- `src/components/sections/about-section.tsx`
- `src/components/sections/features-section.tsx`
- `src/components/sections/testimonials-section.tsx`
- `src/components/sections/contact-section.tsx`
- `src/hooks/useTimeInSection.ts`
- `src/hooks/useTimeOnPage.ts`
- `src/hooks/useViewTracker.ts`
- `src/hooks/mergeRefs.ts`
- `src/libs/gtab.ts`
- `src/modules/landing/landing.module.ts`
- `src/modules/landing/dto/landing.dto.ts`
- `src/app/try-the-plateform/page.tsx` (will be rebuilt)
- `src/dictionaries/en.ts` (will be rebuilt)
- `src/dictionaries/fr.ts` (will be rebuilt)
- `src/routes/route.ts`

**Step 1: Delete files**
```bash
rm src/components/analytics.tsx
rm src/components/language-provider.tsx
rm src/components/language-switcher.tsx
rm src/components/horizontal-scroll.tsx
rm src/components/sections/hero-section.tsx
rm src/components/sections/about-section.tsx
rm src/components/sections/features-section.tsx
rm src/components/sections/testimonials-section.tsx
rm src/components/sections/contact-section.tsx
rm src/hooks/useTimeInSection.ts
rm src/hooks/useTimeOnPage.ts
rm src/hooks/useViewTracker.ts
rm src/hooks/mergeRefs.ts
rm src/libs/gtab.ts
rm src/modules/landing/landing.module.ts
rm src/modules/landing/dto/landing.dto.ts
rm src/app/try-the-plateform/page.tsx
rm src/dictionaries/en.ts
rm src/dictionaries/fr.ts
rm src/routes/route.ts
rmdir src/modules/landing/dto 2>/dev/null; rmdir src/modules/landing 2>/dev/null; rmdir src/modules 2>/dev/null
rmdir src/components/sections 2>/dev/null
rmdir src/hooks 2>/dev/null
rmdir src/libs 2>/dev/null
rmdir src/routes 2>/dev/null
rmdir src/dictionaries 2>/dev/null
```

**Step 2: Verify project still has its API routes**
```bash
ls src/app/api/contact/route.ts
ls src/app/api/try-the-plateform/route.ts
ls src/app/api/health/route.ts
```
Expected: all three files exist.

**Step 3: Commit**
```bash
git add -A
git commit -m "chore: delete all components/hooks to be replaced in redesign"
```

---

## Task 2: Language context

**Files:**
- Create: `src/context/lang-context.tsx`
- Create: `src/dictionaries/en.ts`
- Create: `src/dictionaries/fr.ts`

**Step 1: Create `src/context/lang-context.tsx`**
```tsx
"use client"
import { createContext, useContext, useState, type ReactNode } from "react"
import { en } from "@/dictionaries/en"
import { fr } from "@/dictionaries/fr"

type Lang = "en" | "fr"
type Dict = typeof en

interface LangContextType {
  lang: Lang
  t: Dict
  toggle: () => void
}

const LangContext = createContext<LangContextType | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en")
  const t = lang === "en" ? en : fr
  const toggle = () => setLang((l) => (l === "en" ? "fr" : "en"))
  return <LangContext.Provider value={{ lang, t, toggle }}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used inside LangProvider")
  return ctx
}
```

**Step 2: Create `src/dictionaries/en.ts`**
```ts
export const en = {
  nav: {
    runway: "Runway",
    concept: "Concept",
    about: "About",
    contact: "Contact",
    bookDemo: "Book a demo",
  },
  home: {
    headline: "inside Runway",
    subline: "The B2B platform connecting brands, press offices, and stylists — clothing loans, reimagined.",
    ctaPrimary: "Book a demo",
    ctaSecondary: "Discover",
  },
  runway: {
    title: "Runway",
    comingSoon: "Articles coming soon.",
  },
  about: {
    title: "About us",
    body: "inside Runway is a collaborative B2B SaaS platform that digitizes and centralizes the entire process of clothing loans and press relations in the fashion industry. A single tool that connects brands, press offices, and stylists — transforming a fragmented, manual, and time-consuming process into a seamless, traceable, and efficient workflow.",
  },
  concept: {
    title: "Concept",
    intro: "inside Runway serves three distinct profiles in the fashion ecosystem.",
    stylist: "Stylist",
    brand: "Brand & Press Office",
    stylistBody: "Manage your requests, track loans, and collaborate with brands — all in one place.",
    brandBody: "Centralize your press office operations, manage loan requests, and build lasting relationships with stylists.",
  },
  contact: {
    title: "Contact",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    position: "Position",
    socialMedia: "Social media",
    message: "Message",
    submit: "Send",
    success: "Message sent. We'll be in touch.",
    error: "Something went wrong. Please try again.",
  },
  bookDemo: {
    title: "Book a demo",
    userType: "I am a",
    stylist: "Stylist",
    brand: "Brand / Press Office",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    country: "Country",
    socialMedia: "Social media (optional)",
    role: "Role",
    entityName: "Company / Entity name (optional)",
    website: "Website (optional)",
    message: "Message (optional)",
    submit: "Request a demo",
    success: "Request received. We'll contact you shortly.",
    error: "Something went wrong. Please try again.",
  },
  footer: {
    rights: "© 2025 inside Runway. All rights reserved.",
  },
}
```

**Step 3: Create `src/dictionaries/fr.ts`**
```ts
export const fr = {
  nav: {
    runway: "Runway",
    concept: "Concept",
    about: "À propos",
    contact: "Contact",
    bookDemo: "Demander une démo",
  },
  home: {
    headline: "inside Runway",
    subline: "La plateforme B2B qui connecte marques, attachées de presse et stylistes — la gestion des prêts, réinventée.",
    ctaPrimary: "Demander une démo",
    ctaSecondary: "Découvrir",
  },
  runway: {
    title: "Runway",
    comingSoon: "Articles à venir.",
  },
  about: {
    title: "À propos",
    body: "inside Runway est une plateforme SaaS B2B collaborative qui digitalise et centralise l'ensemble du processus de prêts de vêtements et de relations presse dans l'industrie de la mode. Un seul outil qui connecte marques, attachées de presse et stylistes — transformant un processus fragmenté, manuel et chronophage en un workflow fluide, traçable et efficace.",
  },
  concept: {
    title: "Concept",
    intro: "inside Runway s'adresse à trois profils distincts de l'écosystème mode.",
    stylist: "Styliste",
    brand: "Marque & Attachée de presse",
    stylistBody: "Gérez vos demandes, suivez les prêts et collaborez avec les marques — tout en un seul endroit.",
    brandBody: "Centralisez vos opérations de relations presse, gérez les demandes de prêts et construisez des relations durables avec les stylistes.",
  },
  contact: {
    title: "Contact",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    position: "Poste",
    socialMedia: "Réseaux sociaux",
    message: "Message",
    submit: "Envoyer",
    success: "Message envoyé. Nous reviendrons vers vous.",
    error: "Une erreur s'est produite. Veuillez réessayer.",
  },
  bookDemo: {
    title: "Demander une démo",
    userType: "Je suis",
    stylist: "Styliste",
    brand: "Marque / Attachée de presse",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    phone: "Téléphone",
    country: "Pays",
    socialMedia: "Réseaux sociaux (optionnel)",
    role: "Rôle",
    entityName: "Nom de la société / entité (optionnel)",
    website: "Site web (optionnel)",
    message: "Message (optionnel)",
    submit: "Demander une démo",
    success: "Demande reçue. Nous vous contacterons prochainement.",
    error: "Une erreur s'est produite. Veuillez réessayer.",
  },
  footer: {
    rights: "© 2025 inside Runway. Tous droits réservés.",
  },
}
```

**Step 4: Commit**
```bash
git add src/context/lang-context.tsx src/dictionaries/en.ts src/dictionaries/fr.ts
git commit -m "feat: add lang context and FR/EN dictionaries"
```

---

## Task 3: Shared UI components

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/section-divider.tsx`

**Step 1: Create `src/components/ui/button.tsx`**
```tsx
import Link from "next/link"
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react"

type Variant = "primary" | "ghost"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: Variant
}

const base = "inline-block font-medium tracking-wide transition-colors text-sm uppercase"
const variants: Record<Variant, string> = {
  primary: "bg-black text-white px-6 py-3 hover:bg-neutral-800",
  ghost: "border border-black text-black px-6 py-3 hover:bg-black hover:text-white",
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export function LinkButton({ href, variant = "primary", className = "", children, ...props }: LinkButtonProps) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  )
}
```

**Step 2: Create `src/components/ui/section-divider.tsx`**
```tsx
export function SectionDivider() {
  return <hr className="border-t border-neutral-200 w-full" />
}
```

**Step 3: Commit**
```bash
git add src/components/ui/
git commit -m "feat: add Button and SectionDivider UI components"
```

---

## Task 4: Header

**Files:**
- Modify: `src/components/header.tsx` (full rewrite)

**Step 1: Rewrite `src/components/header.tsx`**
```tsx
"use client"
import Link from "next/link"
import { useLang } from "@/context/lang-context"

export default function Header() {
  const { t, lang, toggle } = useLang()
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-['BlissTwin'] text-lg tracking-tight">
          inside Runway
        </Link>
        <nav className="flex items-center gap-8 text-xs uppercase tracking-widest">
          <Link href="/runway" className="hover:opacity-50 transition-opacity">{t.nav.runway}</Link>
          <Link href="/concept" className="hover:opacity-50 transition-opacity">{t.nav.concept}</Link>
          <Link href="/about" className="hover:opacity-50 transition-opacity">{t.nav.about}</Link>
          <Link href="/contact" className="hover:opacity-50 transition-opacity">{t.nav.contact}</Link>
          <Link href="/try-the-plateform" className="bg-black text-white px-4 py-1.5 hover:bg-neutral-800 transition-colors">
            {t.nav.bookDemo}
          </Link>
          <button onClick={toggle} className="text-xs hover:opacity-50 transition-opacity">
            {lang === "en" ? "FR" : "EN"}
          </button>
        </nav>
      </div>
    </header>
  )
}
```

**Step 2: Commit**
```bash
git add src/components/header.tsx
git commit -m "feat: rebuild header — minimal nav, lang toggle"
```

---

## Task 5: Footer

**Files:**
- Modify: `src/components/footer.tsx` (full rewrite)

**Step 1: Rewrite `src/components/footer.tsx`**
```tsx
"use client"
import Link from "next/link"
import { useLang } from "@/context/lang-context"

export default function Footer() {
  const { t } = useLang()
  return (
    <footer className="border-t border-neutral-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <span className="font-['BlissTwin'] text-lg tracking-tight">inside Runway</span>
        <nav className="flex gap-8 text-xs uppercase tracking-widest">
          <Link href="/runway" className="hover:opacity-50 transition-opacity">{t.nav.runway}</Link>
          <Link href="/concept" className="hover:opacity-50 transition-opacity">{t.nav.concept}</Link>
          <Link href="/about" className="hover:opacity-50 transition-opacity">{t.nav.about}</Link>
          <Link href="/contact" className="hover:opacity-50 transition-opacity">{t.nav.contact}</Link>
          <Link href="/try-the-plateform" className="hover:opacity-50 transition-opacity">{t.nav.bookDemo}</Link>
        </nav>
        <p className="text-xs text-neutral-500">{t.footer.rights}</p>
      </div>
    </footer>
  )
}
```

**Step 2: Commit**
```bash
git add src/components/footer.tsx
git commit -m "feat: rebuild footer — minimal"
```

---

## Task 6: Root layout

**Files:**
- Modify: `src/app/layout.tsx` (full rewrite)

**Step 1: Rewrite `src/app/layout.tsx`**
```tsx
import type React from "react"
import type { Metadata } from "next"
import { Urbanist } from "next/font/google"
import { LangProvider } from "@/context/lang-context"
import "./globals.css"

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-urbanist",
  display: "swap",
})

export const metadata: Metadata = {
  title: "inside Runway",
  description: "The B2B platform connecting brands, press offices, and stylists.",
  icons: { icon: "/favicon.ico" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${urbanist.variable} font-[var(--font-urbanist)] bg-white text-black min-h-screen flex flex-col`}>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  )
}
```

**Step 2: Commit**
```bash
git add src/app/layout.tsx
git commit -m "feat: clean root layout — LangProvider only, no analytics"
```

---

## Task 7: Home page

**Files:**
- Modify: `src/app/page.tsx` (full rewrite)

**Step 1: Rewrite `src/app/page.tsx`**
```tsx
"use client"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { LinkButton } from "@/components/ui/button"
import { useLang } from "@/context/lang-context"

export default function Home() {
  const { t } = useLang()
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="flex flex-col justify-center min-h-screen px-6 pt-14 max-w-7xl mx-auto w-full">
          <h1 className="font-['BlissTwin'] text-[clamp(4rem,12vw,10rem)] leading-none tracking-tight mb-8">
            {t.home.headline}
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mb-12 font-light">
            {t.home.subline}
          </p>
          <div className="flex gap-4 flex-wrap">
            <LinkButton href="/try-the-plateform" variant="primary">{t.home.ctaPrimary}</LinkButton>
            <LinkButton href="/runway" variant="ghost">{t.home.ctaSecondary}</LinkButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
```

**Step 2: Commit**
```bash
git add src/app/page.tsx
git commit -m "feat: home page — full-viewport hero with BlissTwin headline"
```

---

## Task 8: Runway page (placeholder)

**Files:**
- Create: `src/app/runway/page.tsx`

**Step 1: Create `src/app/runway/page.tsx`**
```tsx
"use client"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useLang } from "@/context/lang-context"

export default function RunwayPage() {
  const { t } = useLang()
  return (
    <>
      <Header />
      <main className="flex-1 pt-14">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h1 className="font-['BlissTwin'] text-6xl md:text-8xl tracking-tight mb-12">
            {t.runway.title}
          </h1>
          <hr className="border-neutral-200 mb-12" />
          <p className="text-neutral-500 text-lg">{t.runway.comingSoon}</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
```

**Step 2: Commit**
```bash
git add src/app/runway/page.tsx
git commit -m "feat: runway page — placeholder"
```

---

## Task 9: About page

**Files:**
- Create: `src/app/about/page.tsx`

**Step 1: Create `src/app/about/page.tsx`**
```tsx
"use client"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useLang } from "@/context/lang-context"

export default function AboutPage() {
  const { t } = useLang()
  return (
    <>
      <Header />
      <main className="flex-1 pt-14">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h1 className="font-['BlissTwin'] text-6xl md:text-8xl tracking-tight mb-12">
            {t.about.title}
          </h1>
          <hr className="border-neutral-200 mb-12" />
          <p className="text-xl md:text-2xl font-light leading-relaxed max-w-3xl text-neutral-700">
            {t.about.body}
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
```

**Step 2: Commit**
```bash
git add src/app/about/page.tsx
git commit -m "feat: about page"
```

---

## Task 10: Concept pages

**Files:**
- Create: `src/app/concept/page.tsx`
- Create: `src/app/concept/stylist/page.tsx`
- Create: `src/app/concept/brand/page.tsx`

**Step 1: Create `src/app/concept/page.tsx`**
```tsx
"use client"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { LinkButton } from "@/components/ui/button"
import { useLang } from "@/context/lang-context"

export default function ConceptPage() {
  const { t } = useLang()
  return (
    <>
      <Header />
      <main className="flex-1 pt-14">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h1 className="font-['BlissTwin'] text-6xl md:text-8xl tracking-tight mb-12">
            {t.concept.title}
          </h1>
          <hr className="border-neutral-200 mb-12" />
          <p className="text-xl font-light text-neutral-600 mb-16 max-w-2xl">{t.concept.intro}</p>
          <div className="grid md:grid-cols-2 gap-px bg-neutral-200">
            {/* Stylist */}
            <div className="bg-white p-12 flex flex-col gap-6">
              <h2 className="font-['BlissTwin'] text-4xl">{t.concept.stylist}</h2>
              <p className="text-neutral-600 font-light leading-relaxed">{t.concept.stylistBody}</p>
              <LinkButton href="/concept/stylist" variant="ghost" className="self-start">
                {t.concept.stylist} →
              </LinkButton>
            </div>
            {/* Brand */}
            <div className="bg-white p-12 flex flex-col gap-6">
              <h2 className="font-['BlissTwin'] text-4xl">{t.concept.brand}</h2>
              <p className="text-neutral-600 font-light leading-relaxed">{t.concept.brandBody}</p>
              <LinkButton href="/concept/brand" variant="ghost" className="self-start">
                {t.concept.brand} →
              </LinkButton>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
```

**Step 2: Create `src/app/concept/stylist/page.tsx`**
```tsx
"use client"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { LinkButton } from "@/components/ui/button"
import { useLang } from "@/context/lang-context"

export default function StylistPage() {
  const { t } = useLang()
  return (
    <>
      <Header />
      <main className="flex-1 pt-14">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4">{t.concept.title}</p>
          <h1 className="font-['BlissTwin'] text-6xl md:text-8xl tracking-tight mb-12">
            {t.concept.stylist}
          </h1>
          <hr className="border-neutral-200 mb-12" />
          <p className="text-xl md:text-2xl font-light leading-relaxed max-w-3xl text-neutral-700 mb-12">
            {t.concept.stylistBody}
          </p>
          <LinkButton href="/try-the-plateform" variant="primary">{t.nav.bookDemo}</LinkButton>
        </div>
      </main>
      <Footer />
    </>
  )
}
```

**Step 3: Create `src/app/concept/brand/page.tsx`**
```tsx
"use client"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { LinkButton } from "@/components/ui/button"
import { useLang } from "@/context/lang-context"

export default function BrandPage() {
  const { t } = useLang()
  return (
    <>
      <Header />
      <main className="flex-1 pt-14">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4">{t.concept.title}</p>
          <h1 className="font-['BlissTwin'] text-6xl md:text-8xl tracking-tight mb-12">
            {t.concept.brand}
          </h1>
          <hr className="border-neutral-200 mb-12" />
          <p className="text-xl md:text-2xl font-light leading-relaxed max-w-3xl text-neutral-700 mb-12">
            {t.concept.brandBody}
          </p>
          <LinkButton href="/try-the-plateform" variant="primary">{t.nav.bookDemo}</LinkButton>
        </div>
      </main>
      <Footer />
    </>
  )
}
```

**Step 4: Commit**
```bash
git add src/app/concept/
git commit -m "feat: concept pages — overview, stylist, brand"
```

---

## Task 11: Contact page

**Files:**
- Create: `src/app/contact/page.tsx`

Contact API expects: `firstName`, `lastName`, `email`, `position`, `socialMedia`, `language`, `message`, `company` (honeypot).

**Step 1: Create `src/app/contact/page.tsx`**
```tsx
"use client"
import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useLang } from "@/context/lang-context"

export default function ContactPage() {
  const { t, lang } = useLang()
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    position: "", socialMedia: "", message: "",
    company: "", // honeypot
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language: lang }),
      })
      setStatus(res.ok ? "success" : "error")
    } catch {
      setStatus("error")
    }
  }

  const inputClass = "w-full border-b border-neutral-300 py-3 text-sm bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-400"

  return (
    <>
      <Header />
      <main className="flex-1 pt-14">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h1 className="font-['BlissTwin'] text-6xl md:text-8xl tracking-tight mb-12">
            {t.contact.title}
          </h1>
          <hr className="border-neutral-200 mb-12" />
          {status === "success" ? (
            <p className="text-lg font-light">{t.contact.success}</p>
          ) : (
            <form onSubmit={submit} className="max-w-xl flex flex-col gap-8">
              {/* Honeypot — hidden */}
              <input type="text" name="company" value={form.company} onChange={set("company")} className="hidden" tabIndex={-1} autoComplete="off" />
              <div className="grid grid-cols-2 gap-8">
                <input placeholder={t.contact.firstName} value={form.firstName} onChange={set("firstName")} required className={inputClass} />
                <input placeholder={t.contact.lastName} value={form.lastName} onChange={set("lastName")} required className={inputClass} />
              </div>
              <input type="email" placeholder={t.contact.email} value={form.email} onChange={set("email")} required className={inputClass} />
              <input placeholder={t.contact.position} value={form.position} onChange={set("position")} className={inputClass} />
              <input placeholder={t.contact.socialMedia} value={form.socialMedia} onChange={set("socialMedia")} className={inputClass} />
              <textarea placeholder={t.contact.message} value={form.message} onChange={set("message")} required rows={5} className={`${inputClass} resize-none`} />
              {status === "error" && <p className="text-sm text-red-600">{t.contact.error}</p>}
              <Button type="submit" disabled={status === "loading"} className="self-start">
                {status === "loading" ? "…" : t.contact.submit}
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
```

**Step 2: Commit**
```bash
git add src/app/contact/page.tsx
git commit -m "feat: contact page — form wired to /api/contact"
```

---

## Task 12: Book a demo page

**Files:**
- Create: `src/app/try-the-plateform/page.tsx`

try-the-plateform API expects: `userType`, `firstName`, `lastName`, `email`, `phone`, `country`, `socialMedia`, `role`, `language`, `text`, `entityName`, `website`.

**Step 1: Create `src/app/try-the-plateform/page.tsx`**
```tsx
"use client"
import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useLang } from "@/context/lang-context"

type UserType = "stylist" | "brand"

export default function BookDemoPage() {
  const { t, lang } = useLang()
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [form, setForm] = useState({
    userType: "" as UserType | "",
    firstName: "", lastName: "", email: "", phone: "",
    country: "", socialMedia: "", role: "",
    entityName: "", website: "", text: "",
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
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

  const inputClass = "w-full border-b border-neutral-300 py-3 text-sm bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-400"

  return (
    <>
      <Header />
      <main className="flex-1 pt-14">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h1 className="font-['BlissTwin'] text-6xl md:text-8xl tracking-tight mb-12">
            {t.bookDemo.title}
          </h1>
          <hr className="border-neutral-200 mb-12" />
          {status === "success" ? (
            <p className="text-lg font-light">{t.bookDemo.success}</p>
          ) : (
            <form onSubmit={submit} className="max-w-xl flex flex-col gap-8">
              {/* User type toggle */}
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">{t.bookDemo.userType}</p>
                <div className="flex gap-4">
                  {(["stylist", "brand"] as UserType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, userType: type }))}
                      className={`px-6 py-2 text-sm uppercase tracking-wide border transition-colors ${
                        form.userType === type ? "bg-black text-white border-black" : "border-neutral-300 text-neutral-600 hover:border-black"
                      }`}
                    >
                      {type === "stylist" ? t.bookDemo.stylist : t.bookDemo.brand}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <input placeholder={t.bookDemo.firstName} value={form.firstName} onChange={set("firstName")} required className={inputClass} />
                <input placeholder={t.bookDemo.lastName} value={form.lastName} onChange={set("lastName")} required className={inputClass} />
              </div>
              <input type="email" placeholder={t.bookDemo.email} value={form.email} onChange={set("email")} required className={inputClass} />
              <div className="grid grid-cols-2 gap-8">
                <input placeholder={t.bookDemo.phone} value={form.phone} onChange={set("phone")} required className={inputClass} />
                <input placeholder={t.bookDemo.country} value={form.country} onChange={set("country")} required className={inputClass} />
              </div>
              <input placeholder={t.bookDemo.role} value={form.role} onChange={set("role")} required className={inputClass} />
              <input placeholder={t.bookDemo.socialMedia} value={form.socialMedia} onChange={set("socialMedia")} className={inputClass} />
              <input placeholder={t.bookDemo.entityName} value={form.entityName} onChange={set("entityName")} className={inputClass} />
              <input placeholder={t.bookDemo.website} value={form.website} onChange={set("website")} className={inputClass} />
              <textarea placeholder={t.bookDemo.message} value={form.text} onChange={set("text")} rows={4} className={`${inputClass} resize-none`} />
              {status === "error" && <p className="text-sm text-red-600">{t.bookDemo.error}</p>}
              <Button type="submit" disabled={status === "loading" || !form.userType} className="self-start">
                {status === "loading" ? "…" : t.bookDemo.submit}
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
```

**Step 2: Commit**
```bash
git add src/app/try-the-plateform/page.tsx
git commit -m "feat: try-the-plateform page — form wired to /api/try-the-plateform"
```

---

## Task 13: Final verification

**Step 1: Build check**
```bash
npm run build
```
Expected: Build completes with no TypeScript errors.

**Step 2: Dev smoke test**
```bash
npm run dev
```
Manually verify:
- `/` loads — hero visible, BlissTwin headline renders
- `/runway` loads — placeholder visible
- `/about` loads
- `/concept` loads — two cards visible
- `/concept/stylist` and `/concept/brand` load
- `/contact` loads — form submittable (check network tab for 200/400)
- `/try-the-plateform` loads — user type toggle works, form submittable
- Language toggle switches all copy to FR and back

**Step 3: Commit**
```bash
git add -A
git commit -m "chore: final build verified — redesign complete"
```
