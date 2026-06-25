"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/shadcn-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLang } from "@/context/lang-context";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  className?: string;
  variant?: "button" | "link";
};

export function ContactStylistCta({
  label,
  className,
  variant = "button",
}: Props) {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  function handleClick() {
    if (loading) return;
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setOpen(true);
    }, 3000);
  }

  return (
    <>
      {variant === "link" ? (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "text-left text-xs font-medium text-neutral-700 transition hover:text-black",
            className,
          )}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t.discover.contactLoading}
            </span>
          ) : (
            label || t.discover.contactStylist
          )}
        </button>
      ) : (
        <Button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className={className}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.discover.contactLoading}
            </>
          ) : (
            label || t.discover.contactStylist
          )}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-none bg-[#faf6f0] p-8 shadow-[0_28px_120px_rgba(0,0,0,0.16)]">
          <div className="space-y-3">
            <DialogTitle className="font-['BlissTwin'] text-3xl tracking-tight">
              {t.discover.contactGateTitle}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-neutral-600">
              {t.discover.contactGateBody}
            </DialogDescription>
          </div>
          <div className="mt-6 space-y-3">
            <Button asChild className="w-full rounded-full">
              <Link href="/try-the-plateform" onClick={() => setOpen(false)}>
                {t.nav.bookDemo}
              </Link>
            </Button>
            <Link
              href="/platform/brand"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-medium text-neutral-700 underline decoration-neutral-400 underline-offset-4 transition hover:text-black"
            >
              {t.discover.brandOffer}
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
