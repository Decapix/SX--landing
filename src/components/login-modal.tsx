"use client"

import Link from "next/link"
import { Building2, Scissors, UserPlus } from "lucide-react"

import { useLang } from "@/context/lang-context"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { decodeId } from "@/lib/id-hash"

/**
 * Redirect context describing where the user should land after login.
 * The LoginModal appends a `?redirect=` query param to the external login URLs
 * so code-style frontends can deep-link the user to the right page.
 */
export type LoginRedirectContext =
  | { type: "collection"; encodedId: string }
  | { type: "stylist"; encodedId: string }
  | { type: "brand"; encodedId: string }
  | { type: "post"; encodedId: string }
  | { type: "profile"; encodedId: string }
  | null

function buildRedirectParams(ctx: LoginRedirectContext): { brand: string; stylist: string } {
  if (!ctx) return { brand: "", stylist: "" }

  const rawId = decodeId(ctx.encodedId)

  switch (ctx.type) {
    case "collection":
      return {
        brand: `?redirect=/collections/${rawId}`,
        stylist: `?redirect=/collections/${rawId}`,
      }
    case "stylist":
      return {
        brand: "",
        stylist: `?redirect=/stylists/${rawId}`,
      }
    case "brand":
      return {
        brand: `?redirect=/brands/${rawId}`,
        stylist: "",
      }
    case "post":
      return {
        brand: `?redirect=/posts/${rawId}`,
        stylist: `?redirect=/posts/${rawId}`,
      }
    case "profile":
      return {
        brand: `?redirect=/profile/${rawId}`,
        stylist: `?redirect=/profile/${rawId}`,
      }
  }
}

type Props = {
  open: boolean
  onClose: () => void
  redirectContext?: LoginRedirectContext
}

export function LoginModal({ open, onClose, redirectContext = null }: Props) {
  const { t } = useLang()
  const l = t.login
  const params = buildRedirectParams(redirectContext)

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-3xl p-8">
        <div className="mb-6">
          <DialogTitle className="font-['BlissTwin'] text-2xl tracking-tight">{l.title}</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-neutral-500">{l.subtitle}</DialogDescription>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Brand / Press Office */}
          <a
            href={`https://brand.inside-runway.eu/login${params.brand}`}
            onClick={onClose}
            className="group flex flex-col gap-4 rounded-xl border border-neutral-200 p-6 transition-all hover:border-black hover:shadow-md"
          >
            <Building2 className="h-7 w-7 text-neutral-400 transition-colors group-hover:text-black" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest">{l.brand.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">{l.brand.description}</p>
            </div>
          </a>

          {/* Stylist */}
          <a
            href={`https://stylist.inside-runway.eu/login${params.stylist}`}
            onClick={onClose}
            className="group flex flex-col gap-4 rounded-xl border border-neutral-200 p-6 transition-all hover:border-black hover:shadow-md"
          >
            <Scissors className="h-7 w-7 text-neutral-400 transition-colors group-hover:text-black" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest">{l.stylist.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">{l.stylist.description}</p>
            </div>
          </a>

          {/* Book demo */}
          <Link
            href="/book-demo"
            onClick={onClose}
            className="group flex flex-col gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-6 transition-all hover:border-black hover:shadow-md"
          >
            <UserPlus className="h-7 w-7 text-neutral-400 transition-colors group-hover:text-black" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest">{l.demo.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">{l.demo.description}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest underline underline-offset-2">
                {l.demo.cta} →
              </p>
            </div>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
