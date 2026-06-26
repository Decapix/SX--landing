"use client";

import Link from "next/link";
import { MapPin } from "iconoir-react";
import {
  Canvas,
  Glass,
  Card,
  Eyebrow,
  buttonVariants,
} from "@decapix/sf-ui";
import { Reveal } from "@/components/reveal";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useMarketing } from "@/content/marketing";

export default function AboutPage() {
  const { about: a, home } = useMarketing();
  return (
    <Canvas fixed className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-5 pb-10 pt-32 text-center sm:px-8">
          <Eyebrow className="mb-4 justify-center">{a.heroEyebrow}</Eyebrow>
          <h1 className="font-display text-[clamp(2.2rem,5.5vw,3.6rem)] leading-tight tracking-[-0.02em] text-ink">
            {a.heroTitle}
          </h1>
        </section>

        <Reveal className="mx-auto max-w-3xl px-5 pb-12 sm:px-8">
          <Card className="flex flex-col gap-5">
            {a.paragraphs.map((para, i) => (
              <p key={i} className="font-body text-base leading-relaxed text-ink/75">
                {para}
              </p>
            ))}
          </Card>
        </Reveal>

        <Reveal className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
          <Glass className="glass-strong relative overflow-hidden rounded-sf-lg p-8 md:p-10">
            <img
              src="/images/art/orbs-sand.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 opacity-70"
            />
            <div className="relative z-10">
              <span className="flex h-11 w-11 items-center justify-center rounded-sf bg-sand/25 text-ink">
                <MapPin className="h-5 w-5" />
              </span>
              <h2 className="mt-5 font-display text-2xl text-ink">{a.milanTitle}</h2>
              <p className="mt-3 font-body text-base leading-relaxed text-ink/70">
                {a.milanBody}
              </p>
            </div>
          </Glass>
        </Reveal>

        <Reveal className="px-5 pb-20 sm:px-8">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className={buttonVariants({ variant: "secondary" })}>
              {home.finalCta.contact}
            </Link>
            <Link href="/try-the-plateform" className={buttonVariants({})}>
              {home.finalCta.tryPlatform}
            </Link>
          </div>
        </Reveal>
      </main>
      <Footer />
    </Canvas>
  );
}
