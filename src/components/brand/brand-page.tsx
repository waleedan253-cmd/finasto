"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Eye,
  Globe2,
  Heart,
  Layers,
  ShieldCheck,
  Sprout,
  Target,
} from "lucide-react";
import {
  BRAND_NAME,
  brandContent as c,
  brandNav,
} from "@/lib/brand/brand-content";
import { BotanicalArt } from "./botanical-art";

const EASE = [0.22, 1, 0.36, 1] as const;

const PRINCIPLE_ICONS = [Sprout, Layers, Heart, ShieldCheck] as const;

// ───────── small building blocks ─────────

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={`inline-flex items-center gap-3 font-sans text-[12px] font-medium uppercase tracking-[0.22em] ${
        light ? "text-copper-light" : "text-copper"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-px w-8 ${light ? "bg-copper-light/60" : "bg-copper/60"}`}
      />
      {children}
    </p>
  );
}

function SectionNav() {
  const [active, setActive] = useState<string>(brandNav[0].id);

  useEffect(() => {
    const els = brandNav
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Brand sections"
      className="sticky top-0 z-30 border-b border-border bg-cream-soft/85 backdrop-blur-xl"
    >
      <ul className="mx-auto flex max-w-[1100px] gap-1 overflow-x-auto px-4 py-2.5 sm:justify-center sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {brandNav.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <li key={id} className="shrink-0">
              <a
                href={`#${id}`}
                aria-current={isActive ? "true" : undefined}
                className={`relative block rounded-full px-4 py-2 font-sans text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/50 ${
                  isActive
                    ? "bg-green-deep font-medium text-white"
                    : "text-espresso/70 hover:bg-green-bg hover:text-green-deep"
                }`}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ───────── page ─────────

export function BrandPage() {
  const reduce = useReducedMotion();

  return (
    <main className="flex-1 bg-pattern">
      <style>{`@media (prefers-reduced-motion: no-preference){html{scroll-behavior:smooth}}`}</style>

      {/* ───────── HERO ───────── */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-green-deep via-[#17391f] to-espresso-deep px-5 pb-24 pt-20 text-center sm:px-8 sm:pb-32 sm:pt-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-green/40 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-[-8%] -z-10 h-[460px] w-[460px] rounded-full bg-copper/25 blur-[130px]"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 620"
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
        >
          <path d="M-40 60 C120 20 300 70 380 230 C220 280 40 240 -40 60Z" fill="#2f6a3a" opacity="0.26" />
          <path d="M1440 80 C1300 130 1240 270 1280 420 C1420 370 1480 230 1440 80Z" fill="#0c2615" opacity="0.5" />
          <path d="M700 -20 C650 80 720 190 860 240 C910 130 840 20 700 -20Z" fill="#2f6a3a" opacity="0.18" />
          <path d="M-120 480 C240 410 480 550 860 440 S1380 330 1600 410" fill="none" stroke="#8cc79a" strokeOpacity="0.18" />
          <path d="M-120 530 C260 470 520 600 900 490 S1400 390 1600 460" fill="none" stroke="#e0a56d" strokeOpacity="0.16" />
        </svg>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]"
        />

        <motion.div
          initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mx-auto max-w-[820px]"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-copper-light/30 bg-copper/10 px-4 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-copper-light">
            <Globe2 className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
            {c.hero.eyebrow}
          </p>
          <h1 className="mt-7 bg-gradient-to-b from-white via-cream to-copper-light bg-clip-text font-display text-[56px] leading-[0.95] tracking-tight text-transparent sm:text-[88px] md:text-[108px]">
            {BRAND_NAME}
          </h1>
          <span
            aria-hidden="true"
            className="mx-auto mt-7 block h-[2px] w-16 rounded-full bg-gradient-to-r from-copper-light to-copper"
          />
          <p className="mx-auto mt-7 max-w-[480px] font-sans text-[16px] leading-relaxed text-white/70 md:text-[18px]">
            {c.hero.tagline}
          </p>
        </motion.div>
      </section>

      <SectionNav />

      {/* ───────── BRAND (replaces "About Us") ───────── */}
      <section
        id="brand"
        className="scroll-mt-16 px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto grid max-w-[1100px] items-start gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal className="mx-auto w-full max-w-[400px] lg:sticky lg:top-28">
            <BotanicalArt className="h-auto w-full drop-shadow-[0_30px_50px_rgba(35,77,42,0.25)]" />
          </Reveal>

          <div className="flex flex-col gap-6">
            <Reveal>
              <Eyebrow>{c.intro.eyebrow}</Eyebrow>
              <h2 className="mt-4 font-display text-[34px] leading-[1.1] text-green-deep sm:text-[44px] md:text-[52px]">
                {c.intro.title}
              </h2>
            </Reveal>

            {c.intro.paragraphs.map((p, i) => (
              <div key={i} className="flex flex-col gap-6">
                <Reveal>
                  <p
                    className={
                      i === 0
                        ? "font-sans text-[18px] leading-[1.75] text-espresso md:text-[20px]"
                        : "font-sans text-[16px] leading-[1.85] text-warm-gray md:text-[17px]"
                    }
                  >
                    {p}
                  </p>
                </Reveal>
                {i === 1 && (
                  <Reveal>
                    <blockquote className="border-l-2 border-copper py-1 pl-6 font-display text-[26px] italic leading-snug text-green-deep md:text-[32px]">
                      {c.intro.pullQuote}
                    </blockquote>
                  </Reveal>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── OUR STORY ───────── */}
      <section
        id="story"
        className="scroll-mt-16  px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-[1100px]">
          <div className="grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal className="lg:sticky lg:top-28">
              <Eyebrow>{c.story.eyebrow}</Eyebrow>
              <h2 className="mt-4 font-display text-[34px] leading-[1.1] text-green-deep sm:text-[44px]">
                {c.story.title}
              </h2>
              <div className="mt-8 inline-flex items-end gap-4 rounded-2xl border border-copper/25 bg-white px-6 py-5 shadow-[0_18px_40px_-24px_rgba(35,77,42,0.45)]">
                <span className="font-display text-[64px] leading-none text-green-deep">
                  {c.story.stat.value}
                </span>
                <span className="pb-2 font-sans text-[12px] font-medium uppercase tracking-[0.18em] text-warm-gray">
                  {c.story.stat.label}
                </span>
              </div>
            </Reveal>

            <ol className="relative flex flex-col gap-10 border-l border-copper/30 pl-8 sm:pl-10">
              {c.story.paragraphs.map((p, i) => (
                <li key={i} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[calc(2rem+14.5px)] top-0 flex h-7 w-7 items-center justify-center rounded-full border border-copper/50 bg-cream font-sans text-[11px] font-semibold text-copper sm:-left-[calc(2.5rem+14.5px)]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Reveal>
                    <p className="font-sans text-[16px] leading-[1.85] text-espresso/80 md:text-[17px]">
                      {p}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>

          <Reveal className="mt-20 text-center">
            <span
              aria-hidden="true"
              className="mx-auto mb-8 block h-px w-24 bg-gradient-to-r from-transparent via-copper to-transparent"
            />
            <p className="mx-auto max-w-[760px] font-display text-[28px] leading-tight text-green-deep sm:text-[38px] md:text-[46px]">
              {c.story.closing}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ───────── VISION & MISSION ───────── */}
      <section
        id="vision-mission"
        className="scroll-mt-16 px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto grid max-w-[1100px] gap-6 md:grid-cols-2 md:gap-8">
          <Reveal>
            <article className="relative h-full overflow-hidden rounded-[28px] bg-gradient-to-br from-green via-[#17391f] to-espresso-deep p-8 text-white shadow-[0_30px_70px_-30px_rgba(35,77,42,0.7)] sm:p-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-copper/25 blur-[70px]"
              />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-copper-light/40 bg-white/10">
                <Eye className="h-6 w-6 text-copper-light" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div className="relative mt-7">
                <Eyebrow >{c.vision.eyebrow}</Eyebrow>
                <p className="mt-5 font-sans text-[16px] leading-[1.85] text-white/80 md:text-[17px]">
                  {c.vision.text}
                </p>
              </div>
            </article>
          </Reveal>

          <Reveal delay={0.1}>
            <article className="relative h-full overflow-hidden rounded-[28px] border border-copper/25 bg-white p-8 shadow-[0_30px_70px_-34px_rgba(50,30,24,0.4)] sm:p-12">
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-copper/40 bg-green-bg">
                <Target className="h-6 w-6 text-green-deep" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div className="relative mt-7">
                <Eyebrow>{c.mission.eyebrow}</Eyebrow>
                <p className="mt-5 font-sans text-[16px] leading-[1.85] text-espresso/80 md:text-[17px]">
                  {c.mission.text}
                </p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ───────── QUALITY ───────── */}
      <section
        id="quality"
        className="relative isolate scroll-mt-16 overflow-hidden bg-pattern dark bg-cream px-5 py-20 sm:px-8 sm:py-28"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-0 -z-10 h-[380px] w-[380px] rounded-full bg-green/35 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-[-6%] -z-10 h-[420px] w-[420px] rounded-full bg-copper/25 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]"
        />

        <div className="mx-auto max-w-[1100px]">
          <Reveal className="mx-auto max-w-[760px] text-center">
            <Eyebrow >{c.quality.eyebrow}</Eyebrow>
            <h2 className="mt-5 font-display text-[32px] leading-[1.12] text-green-deep sm:text-[44px]">
              {c.quality.title}
            </h2>
            <p className="mt-6 font-sans text-[16px] leading-[1.85] text-espresso/75 md:text-[17px]">
              {c.quality.text}
            </p>
          </Reveal>

          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.quality.principles.map((p, i) => {
              const Icon = PRINCIPLE_ICONS[i % PRINCIPLE_ICONS.length];
              return (
                <li key={p.title}>
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="h-full rounded-[22px] bg-pattern dark bg-cream border border-border-strong bg-cream-soft p-6 transition-all duration-300 hover:-translate-y-1 hover:border-copper">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-copper/40 bg-green-bg">
                        <Icon className="h-5 w-5 text-green-deep" strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <h3 className="mt-5 font-display text-[22px] text-green-deep">
                        {p.title}
                      </h3>
                      <p className="mt-2 font-sans text-[14px] leading-relaxed text-warm-gray">
                        {p.text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ul>

          <Reveal className="mt-14 text-center">
            <Link
              href={c.cta.href}
              className="group relative inline-flex h-[54px] items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-copper-light to-copper px-8 font-sans text-[15px] font-semibold text-espresso-deep shadow-[0_14px_36px_-10px_rgba(201,130,69,0.7),inset_0_1px_0_0_rgba(255,255,255,0.45)] transition-all hover:brightness-105 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%]"
              />
              <span className="relative">{c.cta.label}</span>
              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}