
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Award,
  Globe,
  Handshake,
  HandHeart,
  Leaf,
  Package,
  ShieldCheck,
  Sprout,
  Sun,
  Wind,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import {
  HERO_SLIDE_DURATION,
  heroSlides,
  type HeroFeature,
} from "@/data/hero-slides";

const ICONS: Record<HeroFeature["icon"], LucideIcon> = {
  leaf: Leaf,
  sun: Sun,
  sprout: Sprout,
  globe: Globe,
  handshake: Handshake,
  shield: ShieldCheck,
  steam: Wind,
  award: Award,
  hand: HandHeart,
  package: Package,
};

export function HeroSection() {
  const [active, setActive] = useState(0);
  const [tabHidden, setTabHidden] = useState(false);
  const halted = tabHidden;
  const total = heroSlides.length;

  // Pause when the tab is hidden.
  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

   // Slide timer: change slide after HERO_SLIDE_DURATION (3s), restart on every slide change or resume.
  useEffect(() => {
   
    const t = setTimeout(
      () => setActive((i) => (i + 1) % total),
      HERO_SLIDE_DURATION,
    );
    return () => clearTimeout(t);
  }, [active, total]);

  const go = useCallback((i: number) => setActive(i), []);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Finasto Bali highlights"
            className="bg-pattern bg-pattern-top overflow-hidden [--pattern-color:rgba(62,118,47,0.22)]"
     
    >
      {/* IMAGE LAYER: full-bleed, sits behind the copy */}
      <div aria-hidden="true" className="absolute inset-0 z-0">
        {heroSlides.map((s, i) => (
          <Image
            key={s.id}
            src={s.image}
            alt={s.imageAlt}
            fill
            priority={i === 0}
            sizes="100vw"
            quality={80}
            className={`object-cover object-[70%_center] transition-opacity duration-[800ms] ease-out sm:object-center ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Readability fade: cream on the left (desktop) / bottom (mobile) */}
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/85 via-45% to-transparent to-75% lg:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-cream from-[28%] via-cream/70 via-[42%] to-transparent to-[62%] lg:block" />
        {/* Soft top fade so the header/nav stays legible */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-cream/80 to-transparent" />
      </div>

      {/* COPY LAYER */}
      <div className="relative z-10 mx-auto flex min-h-[640px] w-full max-w-[1440px] flex-col justify-end px-4 pb-24 pt-[300px] sm:px-6 sm:pt-[340px] md:px-8 lg:min-h-[min(820px,calc(100svh-80px))] lg:justify-center lg:pb-28 lg:pt-24">
        <div className="grid max-w-xl">
          {heroSlides.map((s, i) => {
            const isActive = i === active;
            const Heading = i === 0 ? "h1" : "h2"; // one H1 per page
            return (
              <div
                key={s.id}
                 aria-hidden={!isActive}
                {...(!isActive ? { inert: "" as unknown as boolean } : {})}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${total}`}
                className={`col-start-1 row-start-1 transition-[opacity,transform] duration-[800ms] ease-out ${
                  isActive
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-3 opacity-0"
                }`}
              >
                <p className="mb-3 font-sans text-[13px] uppercase tracking-[0.22em] text-copper">
                  {s.eyebrow}
                </p>

                <Heading className="font-display text-[36px] leading-[1.08] text-green-deep sm:text-[46px] md:text-[54px] lg:text-[62px] xl:text-[70px]">
                  {s.headline[0]}
                  <br />
                  {s.headline[1]}
                </Heading>

                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-warm-gray">
                  {s.body}
                </p>

                <ul className="mt-6 flex flex-wrap items-stretch gap-y-4 sm:mt-8">
                  {s.features.map((f, k) => {
                    const Icon = ICONS[f.icon];
                    return (
                      <li
                        key={f.label}
                        className={`flex w-[88px] flex-col items-center gap-2 px-2 text-center sm:w-[104px] ${
                          k > 0 ? "border-l border-border-strong" : ""
                        }`}
                      >
                        <Icon
                          aria-hidden="true"
                          className="h-6 w-6 text-green-deep"
                          strokeWidth={1.25}
                        />
                        <span className="font-sans text-[9.5px] font-medium uppercase leading-snug tracking-[0.16em] text-espresso sm:text-[10px]">
                          {f.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <Link
                  href={s.cta.href}
                  tabIndex={isActive ? 0 : -1}
                  className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-green-deep px-6 font-sans text-[14px] font-medium text-cream-soft transition-all hover:gap-3 hover:brightness-110 sm:mt-9"
                >
                  {s.cta.label}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* PROGRESS INDICATOR: each bar fills over 6 seconds, then moves to next slide */}
        <div
          role="tablist"
          aria-label="Choose slide"
          className="absolute bottom-8 left-4 flex gap-2 sm:left-6 md:left-8"
        >
          {heroSlides.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-label={`Show slide ${i + 1}: ${s.headline.join(" ")}`}
              onClick={() => go(i)}
              className="group relative h-6 w-12 sm:w-16"
            >
              <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-espresso/20">
                                <span
                                   key={`${i}-${active}-${halted}`}
                  className={`block h-full origin-left rounded-full bg-copper ${
                    i < active ? "w-full" : "w-0"
                  } ${i === active && !halted ? "hero-progress" : ""}`}
                  style={
                    i === active && !halted
                      ? { animationDuration: `${HERO_SLIDE_DURATION}ms` }
                      : undefined
                  }
                />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}