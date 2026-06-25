export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { redirect } from "next/navigation"

import Header from "@/components/header"
import { CaptchaGate } from "@/components/security/captcha-gate"
import { MouseBotDetector } from "@/components/security/mouse-bot-detector"
import { features } from "@/config/site"

export const metadata: Metadata = {
  title: "Collections | samples.fashion",
  description: "Browse brand collections",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function RunwayLayout({ children }: { children: React.ReactNode }) {
  // Soft Mode: Collections are disabled — send visitors home.
  if (!features.collections) redirect("/")
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 text-foreground">
      <MouseBotDetector />
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 pb-8 pt-20 sm:px-6">
        <CaptchaGate>{children}</CaptchaGate>
      </main>
    </div>
  )
}
