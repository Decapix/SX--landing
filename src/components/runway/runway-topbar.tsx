import Link from "next/link"

import { Button } from "@/components/ui/shadcn-button"

export function RunwayTopbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          samples.fashion
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/try-the-plateform">Book Demo</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
