"use client";

import Link from "next/link";
import { Canvas, Glass, Eyebrow, buttonVariants } from "@decapix/sf-ui";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useMarketing } from "@/content/marketing";

export default function TryThePlatformPage() {
  const { unavailable: u } = useMarketing();
  return (
    <Canvas fixed className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-5 py-28 sm:px-8">
        <Glass className="mx-auto w-full max-w-xl rounded-sf-lg p-10 text-center md:p-14">
          <Eyebrow className="mb-4 justify-center">{u.eyebrow}</Eyebrow>
          <h1 className="font-display text-[clamp(2rem,5vw,3rem)] leading-tight tracking-[-0.015em] text-ink">
            {u.title}
          </h1>
          <p className="mx-auto mt-5 max-w-md font-body text-base leading-relaxed text-ink/65">
            {u.body}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className={buttonVariants({})}>
              {u.contact}
            </Link>
            <Link href="/" className={buttonVariants({ variant: "secondary" })}>
              {u.home}
            </Link>
          </div>
        </Glass>
      </main>
      <Footer />
    </Canvas>
  );
}
