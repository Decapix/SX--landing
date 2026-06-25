"use client";
import Link from "next/link";
import { Footer as SfFooter, NavLink, Wordmark } from "@decapix/sf-ui";
import { useMarketing } from "@/content/marketing";
import { visibleNav } from "@/config/site";

export default function Footer() {
  const m = useMarketing();
  const nav = visibleNav();
  return (
    <SfFooter
      logo={
        <Link href="/" aria-label="samples.fashion">
          <Wordmark size="sm" />
        </Link>
      }
      meta={
        <span>
          © 2026 samples.fashion ·{" "}
          <Link href="/cgu" className="transition-colors hover:text-ink">
            CGU
          </Link>
        </span>
      }
    >
      {nav.map((n) => (
        <NavLink key={n.key} asChild>
          <Link href={n.href}>{m.nav[n.key]}</Link>
        </NavLink>
      ))}
      <NavLink asChild>
        <Link href="/book-demo">{m.nav.tryPlatform}</Link>
      </NavLink>
    </SfFooter>
  );
}
