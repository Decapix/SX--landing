"use client";

import Link from "next/link";
import { Check, Xmark } from "iconoir-react";
import {
  Canvas,
  Glass,
  Card,
  Eyebrow,
  Badge,
  CTASection,
  Reveal,
  buttonVariants,
} from "@decapix/sf-ui";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { useMarketing } from "@/content/marketing";
import { collectionsHref, stylistsHref } from "@/config/site";
import type { LandingVoteSession } from "@/lib/vote-api";

interface RunwayCollection {
  id: string;
  name: string;
  cover_image?: { key?: string; url?: string } | null;
  brand?: { name: string };
}
interface Props {
  collections: RunwayCollection[];
  voteSession: LandingVoteSession | null;
}

function SidePanel({
  tag,
  title,
  points,
  cta,
  href,
  art,
}: {
  tag: string;
  title: string;
  points: readonly string[];
  cta: string;
  href: string;
  art: string;
}) {
  return (
    <Glass className="relative flex flex-col overflow-hidden rounded-sf-lg p-7 md:p-9">
      <img
        src={art}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 opacity-80"
      />
      <div className="relative z-10 flex flex-1 flex-col">
        <Badge variant="sand" className="w-fit">
          {tag}
        </Badge>
        <h3 className="mt-5 font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-ink">
          {title}
        </h3>
        <ul className="mt-6 flex flex-1 flex-col gap-3">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 font-body text-sm leading-relaxed text-ink/75">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-sand-dk" />
              {p}
            </li>
          ))}
        </ul>
        <Link href={href} className={`${buttonVariants({})} mt-8 w-fit`}>
          {cta}
        </Link>
      </div>
    </Glass>
  );
}

function ProblemSolution({
  eyebrow,
  title,
  problemsTitle,
  problems,
  solutionsTitle,
  solutions,
}: {
  eyebrow: string;
  title: string;
  problemsTitle: string;
  problems: readonly string[];
  solutionsTitle: string;
  solutions: readonly string[];
}) {
  return (
    <Reveal className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <div className="mb-8 max-w-2xl">
        <Eyebrow className="mb-3">{eyebrow}</Eyebrow>
        <h2 className="font-display text-[clamp(1.9rem,4.5vw,2.8rem)] leading-tight tracking-[-0.015em] text-ink">
          {title}
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="font-body text-[11px] uppercase tracking-[0.18em] text-ink/45">
            {problemsTitle}
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {problems.map((p) => (
              <li key={p} className="flex items-start gap-3 font-body text-sm leading-relaxed text-ink/65">
                <Xmark className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                {p}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="glass-strong">
          <p className="font-body text-[11px] uppercase tracking-[0.18em] text-sand-dk">
            {solutionsTitle}
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {solutions.map((s) => (
              <li key={s} className="flex items-start gap-3 font-body text-sm leading-relaxed text-ink/80">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Reveal>
  );
}

export function HomePageClient(_props: Props) {
  const m = useMarketing();
  const h = m.home;

  return (
    <Canvas fixed className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* ── Hero: dual statement + two sides ─────────────────── */}
        <section className="mx-auto max-w-7xl px-5 pb-12 pt-32 sm:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <Eyebrow className="mb-4 justify-center">{h.heroEyebrow}</Eyebrow>
            <h1 className="font-display text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.02] tracking-[-0.02em] text-ink">
              {h.heroStatement}
            </h1>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SidePanel
              tag={h.stylist.tag}
              title={h.stylist.title}
              points={h.stylist.points}
              cta={h.stylist.cta}
              href={collectionsHref}
              art="/images/art/orbs-aqua.svg"
            />
            <SidePanel
              tag={h.brand.tag}
              title={h.brand.title}
              points={h.brand.points}
              cta={h.brand.cta}
              href={stylistsHref}
              art="/images/art/orbs-sand.svg"
            />
          </div>
        </section>

        {/* ── For stylists ─────────────────────────────────────── */}
        <ProblemSolution
          eyebrow={h.stylistSection.eyebrow}
          title={h.stylistSection.title}
          problemsTitle={h.stylistSection.problemsTitle}
          problems={h.stylistSection.problems}
          solutionsTitle={h.stylistSection.solutionsTitle}
          solutions={h.stylistSection.solutions}
        />

        {/* ── For brands & press offices ───────────────────────── */}
        <ProblemSolution
          eyebrow={h.brandSection.eyebrow}
          title={h.brandSection.title}
          problemsTitle={h.brandSection.problemsTitle}
          problems={h.brandSection.problems}
          solutionsTitle={h.brandSection.solutionsTitle}
          solutions={h.brandSection.solutions}
        />

        {/* ── Final CTA ────────────────────────────────────────── */}
        <Reveal className="px-5 pb-20 sm:px-8">
          <CTASection
            eyebrow={h.finalCta.eyebrow}
            title={h.finalCta.title}
            description={h.finalCta.description}
            actions={
              <>
                <Link href="/contact" className={buttonVariants({ variant: "secondary" })}>
                  {h.finalCta.contact}
                </Link>
                <Link href="/try-the-plateform" className={buttonVariants({})}>
                  {h.finalCta.tryPlatform}
                </Link>
              </>
            }
          />
        </Reveal>
      </main>

      <Footer />
    </Canvas>
  );
}
