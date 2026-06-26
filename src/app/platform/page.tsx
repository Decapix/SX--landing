"use client";

import Link from "next/link";
import { Check } from "iconoir-react";
import {
  Canvas,
  Hero,
  Card,
  CardTitle,
  CardBody,
  Glass,
  Eyebrow,
  Badge,
  Stepper,
  buttonVariants,
} from "@decapix/sf-ui";
import { Reveal } from "@/components/reveal";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useMarketing } from "@/content/marketing";

function NeedsPanel({
  tag,
  title,
  needs,
}: {
  tag: string;
  title: string;
  needs: readonly string[];
}) {
  return (
    <Glass className="flex flex-col rounded-sf-lg p-7 md:p-9">
      <Badge variant="sand" className="w-fit">
        {tag}
      </Badge>
      <h3 className="mt-5 font-display text-2xl text-ink">{title}</h3>
      <ul className="mt-5 flex flex-col gap-3">
        {needs.map((n) => (
          <li key={n} className="flex items-start gap-3 font-body text-sm leading-relaxed text-ink/75">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sand-dk" />
            {n}
          </li>
        ))}
      </ul>
    </Glass>
  );
}

export default function PlatformPage() {
  const { platform: p } = useMarketing();
  return (
    <Canvas fixed className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero
          className="pt-28"
          centered
          eyebrow={p.heroEyebrow}
          title={p.heroTitle}
          description={p.heroDescription}
          actions={
            <Link href="/try-the-plateform" className={buttonVariants({})}>
              {p.cta}
            </Link>
          }
        />

        {/* How it works */}
        <Reveal className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
          <Card>
            <Eyebrow className="mb-6">{p.howTitle}</Eyebrow>
            <Stepper current={p.steps.length} steps={p.steps.map((s) => ({ label: s.label }))} />
            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {p.steps.map((s, i) => (
                <div key={s.label} className="rounded-sf bg-white/40 p-4">
                  <p className="font-body text-[10px] uppercase tracking-[0.16em] text-ink/40">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-1 font-display text-base text-ink">{s.label}</p>
                  <p className="mt-1 font-body text-xs leading-relaxed text-ink/60">{s.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        {/* Dual structure */}
        <Reveal className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
          <div className="grid gap-4 md:grid-cols-2">
            <NeedsPanel tag={p.stylist.tag} title={p.stylist.title} needs={p.stylist.needs} />
            <NeedsPanel tag={p.brand.tag} title={p.brand.title} needs={p.brand.needs} />
          </div>
        </Reveal>

        <Reveal className="mx-auto max-w-3xl px-5 pb-20 sm:px-8">
          <Card className="flex flex-col items-center text-center">
            <CardTitle>Ready to try it?</CardTitle>
            <CardBody className="mt-2">It's free during the launch phase.</CardBody>
            <Link href="/try-the-plateform" className={`${buttonVariants({})} mt-6`}>
              {p.cta}
            </Link>
          </Card>
        </Reveal>
      </main>
      <Footer />
    </Canvas>
  );
}
