"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Header as SfHeader,
  NavLink,
  Wordmark,
  buttonVariants,
} from "@decapix/sf-ui";
import { useLang } from "@/context/lang-context";
import { useMarketing } from "@/content/marketing";
import { visibleNav } from "@/config/site";

export default function Header() {
  const { lang, toggle } = useLang();
  const m = useMarketing();
  const pathname = usePathname();

  const nav = visibleNav();
  const linkBtn =
    "font-body text-[11px] uppercase tracking-[0.16em] text-ink/70 transition-colors hover:text-ink";

  return (
    <SfHeader
      logo={
        <Link href="/" aria-label="samples.fashion">
          <Wordmark size="sm" />
        </Link>
      }
      actions={
        <>
          <Link href="/try-the-plateform" className={buttonVariants({ size: "sm" })}>
            {m.nav.tryPlatform}
          </Link>
          {/* Platform not available yet — Login routes to the "coming soon" page. */}
          <Link href="/try-the-plateform" className={linkBtn}>
            {m.nav.login}
          </Link>
          <button type="button" onClick={toggle} className={linkBtn}>
            {lang === "en" ? "IT" : "EN"}
          </button>
        </>
      }
    >
      {nav.map((n) => (
        <NavLink key={n.key} asChild active={pathname === n.href}>
          <Link href={n.href}>{m.nav[n.key]}</Link>
        </NavLink>
      ))}
    </SfHeader>
  );
}
