"use client";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { LinkButton } from "@/components/ui/button";
import { useLang } from "@/context/lang-context";
import StepperSection from "@/app/platform/StepperSection";

export default function BrandPage() {
  const { t } = useLang();
  const steps = t.concept.brandPage.steps;

  return (
    <>
      <Header />
      <main className="flex-1 pt-14">
        {/* Hero */}
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-4">
            {t.concept.title}
          </p>
          <h1 className="font-['BlissTwin'] text-5xl tracking-tight sm:text-7xl leading-[1.02] mb-3">
            {t.concept.brandPage.headline}
          </h1>
          <div className="w-16 h-px bg-neutral-300 mb-8" />
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            {t.concept.brandPage.intro}
          </p>
        </div>

        {/* Steps */}
        <StepperSection steps={steps} />

        {/* CTA */}
        <div className="relative overflow-hidden bg-neutral-950 py-28 md:py-36">
          {/* Decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-white/20" />
            <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-white/[0.02] blur-3xl" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-white/[0.03] blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-5 flex flex-col items-center text-center">
            <p className="flex items-center gap-2.5 text-[9px] uppercase tracking-[0.24em] text-white/50 font-light mb-3">
              <span className="w-6 h-px bg-neutral-800" />
              <img
                src="/images/logo_IR.svg"
                alt=""
                aria-hidden="true"
                className="h-8 w-8 object-contain"
              />
              <span className="w-6 h-px bg-neutral-800" />
            </p>
            <h2 className="font-['BlissTwin'] font-light text-3xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
              {t.nav.bookDemo}
            </h2>
            <div className="w-12 h-px bg-white/30 mx-auto mb-8" />
            <p className="text-neutral-400 font-light text-lg max-w-md mx-auto mb-12 leading-relaxed">
              {t.concept.brandPage.intro.split(".")[0]}.
            </p>
            <LinkButton
              href="/try-the-plateform"
              variant="primary"
              className="!bg-white !text-black hover:!bg-neutral-100 !px-10 !py-4 !text-[12px] !tracking-[0.14em] w-full sm:w-auto justify-center !font-medium"
            >
              {t.nav.bookDemo} →
            </LinkButton>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
