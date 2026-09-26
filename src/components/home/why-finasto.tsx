"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { whySlides } from "@/data/home";

const SLIDE_DURATION_MS = 5000;
const TRANSITION_MS = 500;

// Cycled per-slide panel background — keeps the "green family" palette
// varied across slides instead of one flat wash.

/**
 * Split carousel: text panel (left) + image panel (right).
 * Both panels move together as one synced "wave": on advance, the
 * active text + image translate out to the left while the next
 * text + image translate in from the right (translate-x, not opacity
 * alone), so the two panels never feel disconnected from each other.
 *
 * SEO notes (see explanation below the component):
 * - Every slide's heading/copy/image is always present in the rendered
 *   HTML (visually hidden, not unmounted), so crawlers see full content
 *   on first paint instead of only whichever slide happens to be active.
 * - Slides are marked up as a semantic <ul>/<li> list.
 * - Only the first image is `priority`; the rest lazy-load.
 * - aria-live announces the active slide's heading for assistive tech
 *   without duplicating visible text.
 */
export function WhyFinasto() {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = whySlides.length;

  useEffect(() => {
    if (prefersReducedMotion) return;
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, SLIDE_DURATION_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [prefersReducedMotion, total]);

  const goTo = (index: number) => {
    setActive(((index % total) + total) % total);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Why Finasto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="col-span-full px-5 py-10 text-center sm:px-8">
          <p className="font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
            Why Finasto
          </p>
          <h2 className="mt-2 font-display text-[36px] leading-tight text-espresso-deep sm:text-[48px]">
            Why Choose Finasto?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl font-sans text-[15px] leading-relaxed text-espresso-deep/70">
            Discover what makes Finasto different and why it matters for your
            journey.
          </p>
        </div>

        {/* TEXT PANEL — order-2 on mobile (under image), order-1 on desktop (left) */}
        <div
          className={cn(
            "relative order-2 flex h-[460px] items-center overflow-hidden bg-green-bg px-5 py-10 sm:h-[420px] sm:px-8 lg:order-1 lg:h-[560px]",
          )}
        >
          <ul className="relative mx-auto w-full max-w-lg list-none p-0">
            {whySlides.map((slide, i) => {
              const diff = (i - active + total) % total;
              const translate =
                diff === 0
                  ? "translate-x-0 opacity-100"
                  : diff === total - 1
                    ? "-translate-x-8 opacity-0"
                    : "translate-x-8 opacity-0";

              return (
                <li
                  key={slide.id}
                  className={cn(
                    "transition-all ease-in-out",
                    i === active
                      ? "relative"
                      : "pointer-events-none absolute inset-0",
                    translate,
                  )}
                  style={{ transitionDuration: `${TRANSITION_MS}ms` }}
                  aria-hidden={i !== active}
                >
                  <p className="font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
                    {slide.eyebrow}
                  </p>
                  <h2 className="mt-3 font-display text-[32px] leading-tight text-espresso-deep sm:text-[40px]">
                    {slide.heading}
                  </h2>
                  <p className="mt-4 font-sans text-[15px] leading-relaxed text-espresso-deep/80">
                    {slide.description}
                  </p>
                  <ul className="mt-7 space-y-2">
                    {slide.details.map((d) => (
                      <li
                        key={d}
                        className="flex items-start gap-2 font-sans text-[14px] text-espresso-deep/80"
                      >
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-espresso" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>

          {/* Screen-reader-only live announcement of the current slide */}
          <span className="sr-only" role="status" aria-live="polite">
            {`Slide ${active + 1} of ${total}: ${whySlides[active].heading}`}
          </span>

          {/* Indicators */}
          <div className="absolute bottom-6 left-5 flex gap-2 sm:left-8">
            {whySlides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}: ${slide.heading}`}
                aria-current={i === active}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === active
                    ? "w-6 bg-espresso-deep"
                    : "w-1.5 bg-espresso-deep/30 hover:bg-espresso-deep/50",
                )}
              />
            ))}
          </div>
        </div>

        {/* IMAGE PANEL — order-1 on mobile (on top), order-2 on desktop (right) */}
        <div className="relative order-1 h-[280px] overflow-hidden bg-transparent sm:h-[360px] lg:order-2 lg:h-[450px]">
          {whySlides.map((slide, i) => {
            const diff = (i - active + total) % total;
            const translate =
              diff === 0
                ? "translate-x-0"
                : diff === total - 1
                  ? "-translate-x-full"
                  : "translate-x-full";

            return (
              <div
                key={slide.id}
                className={cn(
                  "absolute inset-0 transition-transform ease-in-out",
                  translate,
                )}
                style={{ transitionDuration: `${TRANSITION_MS}ms` }}
                aria-hidden={i !== active}
              >
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className={cn(
                    "object-cover object-center",
                    i === active &&
                      !prefersReducedMotion &&
                      "animate-water-wave",
                  )}
                  priority={i === 0}
                  loading={i === 0 ? undefined : "lazy"}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
