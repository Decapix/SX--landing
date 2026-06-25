"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Step = {
  title: string;
  body: string;
  image?: string;
};

type Props = {
  steps: Step[];
};

export default function StepperSection({ steps }: Props) {
  const [visibleSteps, setVisibleSteps] = useState<Record<number, boolean>>({});
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stepRefs.current.forEach((ref, i) => {
      if (!ref) return;

      // Trigger entrance animation once step enters viewport
      const animObs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSteps((prev) => {
              if (prev[i]) return prev;
              return { ...prev, [i]: true };
            });
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
      );
      animObs.observe(ref);
      observers.push(animObs);

      // Track centered step to keep the top number/bar animated while scrolling
      const activeObs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveStep(i);
        },
        { threshold: 0.5 },
      );
      activeObs.observe(ref);
      observers.push(activeObs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [steps.length]);

  return (
    <div ref={sectionRef} className="relative max-w-7xl mx-auto px-6 pb-24">
      {/* ── Steps ── */}
      {steps.map((step, i) => {
        const isEven = i % 2 === 0;
        const isVisible = Boolean(visibleSteps[i]);
        const isActive = activeStep === i;
        const isPassed = activeStep > i;

        return (
          <div
            key={i}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className={[
              "flex flex-col md:flex-row items-center gap-10 md:gap-16 py-16",
              i !== steps.length - 1 ? "border-b border-neutral-100" : "",
              !isEven ? "md:flex-row-reverse" : "",
            ].join(" ")}
          >
            {/* Text */}
            <div
              className="flex-1 min-w-0"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0px)" : "translateY(28px)",
                transition: "opacity 0.65s ease, transform 0.65s ease",
                transitionDelay: isVisible ? "0ms" : "0ms",
              }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  style={{
                    height: "1px",
                    width: isActive ? "34px" : isPassed ? "24px" : "14px",
                    background: isActive
                      ? "#171717"
                      : isPassed
                        ? "#737373"
                        : "#d4d4d4",
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible
                      ? "translateY(0px)"
                      : "translateY(10px)",
                    transition:
                      "width 0.45s ease, background 0.45s ease, opacity 0.45s ease, transform 0.45s ease",
                  }}
                />
                <span
                  className="inline-block text-xs font-medium tracking-[0.2em] uppercase"
                  style={{
                    color: isActive
                      ? "#171717"
                      : isPassed
                        ? "#737373"
                        : "#d4d4d4",
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible
                      ? "translateY(0px)"
                      : "translateY(10px)",
                    transition:
                      "color 0.45s ease, opacity 0.45s ease, transform 0.45s ease",
                  }}
                >
                  {String(i + 1)}/{String(steps.length)}
                </span>
              </div>

              <h2 className="font-['BlissTwin'] font-light text-2xl md:text-4xl text-neutral-900 mb-4">
                {step.title}
              </h2>

              <p className="text-neutral-500 font-light leading-relaxed max-w-lg">
                {step.body}
              </p>
            </div>

            {/* Image */}
            <div
              className="flex-1 min-w-0 w-full"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? "translateX(0px)"
                  : isEven
                    ? "translateX(24px)"
                    : "translateX(-24px)",
                transition: "opacity 0.65s ease, transform 0.65s ease",
                transitionDelay: isVisible ? "160ms" : "0ms",
              }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-[#F8F6FE]">
                <Image
                  src={step.image || "/concept-exemple.jpg"}
                  alt={step.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{
                    transform: isVisible ? "scale(1)" : "scale(1.04)",
                    transition: "transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)",
                    transitionDelay: isVisible ? "160ms" : "0ms",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
