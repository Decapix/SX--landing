"use client";

import { useState } from "react";
import {
  Canvas,
  Card,
  Eyebrow,
  Badge,
  Field,
  Input,
  Button,
  Reveal,
} from "@decapix/sf-ui";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useMarketing } from "@/content/marketing";

function PriceForm({
  tier,
  labels,
}: {
  tier: string;
  labels: ReturnType<typeof useMarketing>["pricing"]["form"];
}) {
  const [email, setEmail] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="rounded-sf bg-sand/15 px-4 py-3 font-body text-sm text-ink/70">
        {labels.success}
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // v1: collected client-side; wire to /api later.
        void { tier, email, price, message };
        setDone(true);
      }}
      className="flex flex-col gap-3"
    >
      <Field label={labels.email} htmlFor={`${tier}-email`}>
        <Input
          id={`${tier}-email`}
          type="email"
          required
          placeholder="you@brand.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label={labels.price} htmlFor={`${tier}-price`}>
        <Input
          id={`${tier}-price`}
          placeholder={labels.pricePlaceholder}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </Field>
      <Field label={labels.message} htmlFor={`${tier}-msg`}>
        <Input
          id={`${tier}-msg`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </Field>
      <Button type="submit" className="mt-1 justify-center">
        {labels.submit}
      </Button>
    </form>
  );
}

export default function PricingPage() {
  const { pricing: p } = useMarketing();
  return (
    <Canvas fixed className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-5 pb-8 pt-32 text-center sm:px-8">
          <Eyebrow className="mb-4 justify-center">{p.eyebrow}</Eyebrow>
          <h1 className="mx-auto max-w-2xl font-display text-[clamp(2.2rem,5.5vw,3.6rem)] leading-tight tracking-[-0.02em] text-ink">
            {p.title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-body text-base leading-relaxed text-ink/65">
            {p.intro}
          </p>
        </section>

        <Reveal className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {p.tiers.map((tier) => (
              <Card key={tier.key} className="flex flex-col">
                <h2 className="font-display text-2xl text-ink">{tier.title}</h2>
                <p className="mt-2 font-body text-sm leading-relaxed text-ink/60">
                  {tier.desc}
                </p>
                <Badge variant="sand" className="mt-5 w-fit">
                  {p.free}
                </Badge>
                <p className="mt-3 font-body text-sm leading-relaxed text-ink/70">
                  {p.suggest}
                </p>
                <div className="mt-6 border-t border-white/40 pt-6">
                  <PriceForm tier={tier.key} labels={p.form} />
                </div>
              </Card>
            ))}
          </div>
        </Reveal>
      </main>
      <Footer />
    </Canvas>
  );
}
