"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HERO_SLIDE_DURATION, heroSlides } from "@/data/hero-banners";

export function ShopHero() {
  const [active, setActive] = useState(0);
  const [tabHidden, setTabHidden] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const total = heroSlides.length;
  const halted = tabHidden || !introDone;

  // Pause when the tab is hidden.
  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Wait for the gate intro to finish before the slides start moving.
  useEffect(() => {
    if ((window as unknown as { __finastoIntroDone?: boolean }).__finastoIntroDone) {
      setIntroDone(true);
      return;
    }
    const onDone = () => setIntroDone(true);
    window.addEventListener("finasto-intro-done", onDone);
    const fallback = setTimeout(onDone, 4500); // start anyway if no intro is mounted
    return () => {
      window.removeEventListener("finasto-intro-done", onDone);
      clearTimeout(fallback);
    };
  }, []);

  // Slide timer: restarts on every slide change or resume.
  useEffect(() => {
    if (halted) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % total), HERO_SLIDE_DURATION);
    return () => clearTimeout(t);
  }, [active, total, halted]);

  const go = useCallback((i: number) => setActive(i), []);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Finasto Bali botanical teas"
      className="relative w-full overflow-hidden border-b border-border-strong bg-pattern bg-[radial-gradient(ellipse_at_50%_0%,#fffdf6_0%,#fbf8f3_55%,#f3ead6_100%)] [--pattern-color:rgba(99,118,47,0.07)] dark:bg-none dark:[--pattern-color:rgba(143,203,120,0.08)]"
    >
      <h1 className="sr-only">Finasto Bali botanical teas</h1>

      {/* Decorative light: green on the left, copper on the right */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-green/10 blur-[110px]" />
        <div className="absolute -right-32 top-1/3 h-[380px] w-[380px] rounded-full bg-copper/20 blur-[110px]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-copper/30 to-transparent" />
      </div>

      {/* Inset frame: margins on the left and right, crops a little off the top and bottom of each banner. */}
      <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[5/2] lg:aspect-[3/1] lg:max-h-[calc(100svh-180px)]">
        {heroSlides.map((s, i) => {
          const isActive = i === active;
          return (
            <div 
              key={s.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}`}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-[800ms] ease-out ${
                isActive ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {/* The Shop Now button is inside the image, so the whole banner links to the shop. */}
              <Link href={s.href} tabIndex={isActive ? 0 : -1} className="absolute inset-0 block">
                <Image
                  src={s.image}
                  alt={s.imageAlt}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  quality={85}
                  className="object-cover object-[15%_center] sm:object-center"
                />
              </Link>
            </div>
          );
        })}

        {/* PROGRESS: frosted pill so it stays visible on every image */}
        <div
          role="tablist"
          aria-label="Choose slide"
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-white/60 px-3 backdrop-blur-sm sm:bottom-5"
        >
          {heroSlides.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-label={`Show slide ${i + 1}`}
              onClick={() => go(i)}
              className="group relative h-6 w-10 sm:w-14"
            >
              <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-black/20">
                <span
                  key={`${i}-${active}-${halted}`}
                  className={`block h-full origin-left rounded-full ${
                    i < active ? "w-full" : "w-0"
                  } ${i === active && !halted ? "hero-progress" : ""}`}
                  style={{
                    backgroundColor: heroSlides[active].accent,
                    ...(i === active && !halted ? { animationDuration: `${HERO_SLIDE_DURATION}ms` } : {}),
                  }}
                />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}