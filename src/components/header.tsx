"use client";
import { useMemo, useState } from "react";
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
import {
  LoginModal,
  type LoginRedirectContext,
} from "@/components/login-modal";

export default function Header() {
  const { lang, toggle } = useLang();
  const m = useMarketing();
  const pathname = usePathname();
  const [loginOpen, setLoginOpen] = useState(false);

  const redirectContext = useMemo<LoginRedirectContext>(() => {
    const collection = pathname.match(/^\/runway\/collections\/([^/]+)$/);
    if (collection) return { type: "collection", encodedId: collection[1] };
    const brand = pathname.match(/^\/runway\/brands\/([^/]+)$/);
    if (brand) return { type: "brand", encodedId: brand[1] };
    const stylist = pathname.match(/^\/discover\/stylist\/([^/]+)$/);
    if (stylist) return { type: "stylist", encodedId: stylist[1] };
    return null;
  }, [pathname]);

  const nav = visibleNav();
  const linkBtn =
    "font-body text-[11px] uppercase tracking-[0.16em] text-ink/70 transition-colors hover:text-ink";

  return (
    <>
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
            <button type="button" onClick={() => setLoginOpen(true)} className={linkBtn}>
              {m.nav.login}
            </button>
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

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        redirectContext={redirectContext}
      />
    </>
  );
}
