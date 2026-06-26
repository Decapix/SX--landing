"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Canvas,
  Card,
  Eyebrow,
  Field,
  Input,
  Textarea,
  Button,
  Glass,
} from "@decapix/sf-ui";
import { Reveal } from "@/components/reveal";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useLang } from "@/context/lang-context";

type FieldKey =
  | "firstName"
  | "lastName"
  | "email"
  | "position"
  | "socialMedia"
  | "message";

interface FieldMeta {
  key: FieldKey;
  type?: "email" | "text" | "textarea";
  required?: boolean;
  autocomplete?: string;
  half?: boolean;
}

const FIELDS: FieldMeta[] = [
  { key: "firstName", half: true, required: true, autocomplete: "given-name" },
  { key: "lastName", half: true, required: true, autocomplete: "family-name" },
  { key: "email", type: "email", required: true, autocomplete: "email" },
  { key: "position", autocomplete: "organization-title" },
  { key: "socialMedia" },
  { key: "message", type: "textarea", required: true },
];

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

type Status = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const { t, lang } = useLang();
  const c = t.contact;

  const [status, setStatus] = useState<Status>("idle");
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [form, setForm] = useState<Record<FieldKey | "company", string>>({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    socialMedia: "",
    message: "",
    company: "", // honeypot
  });

  const set =
    (k: FieldKey | "company") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  const blur = (k: FieldKey) => () => setTouched((s) => ({ ...s, [k]: true }));

  function fieldError(k: FieldKey): string | null {
    if (!touched[k]) return null;
    const v = form[k].trim();
    if (FIELDS.find((f) => f.key === k)?.required && !v) return c.errorRequired;
    if (k === "email" && v && !validateEmail(v)) return c.errorEmail;
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(Object.fromEntries(FIELDS.map((f) => [f.key, true])) as Record<FieldKey, boolean>);
    if (!form.firstName || !form.lastName || !form.message || !validateEmail(form.email)) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language: lang }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  const renderField = (f: FieldMeta) => {
    const err = fieldError(f.key);
    const label = (
      <>
        {c[f.key]}
        {f.required && <span aria-hidden className="ml-0.5 text-sand-dk">*</span>}
      </>
    );
    return (
      <Field
        key={f.key}
        label={label}
        htmlFor={`f-${f.key}`}
        error={err ?? undefined}
        className={f.half ? "" : "sm:col-span-2"}
      >
        {f.type === "textarea" ? (
          <Textarea
            id={`f-${f.key}`}
            rows={4}
            value={form[f.key]}
            onChange={set(f.key)}
            onBlur={blur(f.key)}
          />
        ) : (
          <Input
            id={`f-${f.key}`}
            type={f.type ?? "text"}
            autoComplete={f.autocomplete}
            value={form[f.key]}
            onChange={set(f.key)}
            onBlur={blur(f.key)}
          />
        )}
      </Field>
    );
  };

  return (
    <Canvas fixed className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 sm:px-8">
          {/* Heading — full width, above both columns */}
          <Reveal className="mb-10">
            <Eyebrow className="mb-3">{c.eyebrow}</Eyebrow>
            <h1 className="font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-tight tracking-[-0.02em] text-ink">
              {c.title}
            </h1>
          </Reveal>

          <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,440px)]">
            {/* Left — form */}
            <Reveal>
            {status === "success" ? (
              <Card className="text-center">
                <p className="font-display text-2xl text-ink">{c.success}</p>
              </Card>
            ) : (
              <Card>
                <form onSubmit={submit} aria-label={c.formLabel} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {FIELDS.map(renderField)}

                  {/* Honeypot */}
                  <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <label>
                      Company
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.company}
                        onChange={set("company")}
                      />
                    </label>
                  </div>

                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={status === "loading"} className="w-full justify-center sm:w-auto">
                      {status === "loading" ? c.sending : c.submit}
                    </Button>
                    {status === "error" && (
                      <p role="alert" className="mt-3 font-body text-sm text-rose-500">
                        {c.error}
                      </p>
                    )}
                    <p className="mt-3 font-body text-[11px] text-ink/40">* {c.requiredNote}</p>
                  </div>
                </form>
              </Card>
            )}
          </Reveal>

            {/* Right — image, matches the form height */}
            <Reveal delay={120} className="hidden h-full lg:block">
              <Glass className="h-full overflow-hidden rounded-sf-lg p-2">
                <div className="relative h-full min-h-[480px] w-full overflow-hidden rounded-sf">
                  <Image
                    src="/images/contact.webp"
                    alt=""
                    fill
                    sizes="440px"
                    className="object-cover"
                  />
                  <span className="absolute bottom-3 left-3 rounded-sf-pill bg-ink/40 px-3 py-1.5 font-body text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                    {c.imageCaption}
                  </span>
                </div>
              </Glass>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </Canvas>
  );
}
