export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { redirect } from "next/navigation"

import Footer from "@/components/footer"
import Header from "@/components/header"
import { CaptchaGate } from "@/components/security/captcha-gate"
import { MouseBotDetector } from "@/components/security/mouse-bot-detector"
import { features } from "@/config/site"

export const metadata: Metadata = {
  title: "Stylists | samples.fashion",
  description: "Discover stylists",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  // Soft Mode: the stylists/posts feed is disabled — send visitors home.
  if (!features.posts) redirect("/")
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#faf7f3_0%,#ffffff_18%,#f6f3ef_100%)] text-foreground">
      <MouseBotDetector />
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-20 sm:px-6">
        <CaptchaGate>{children}</CaptchaGate>
      </main>
      <Footer />
    </div>
  )
}
