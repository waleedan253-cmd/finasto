"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { heroContent } from "@/data/home";

/**
 * Hero is built as layered images (temple background, woman cutout, leaf
 
 */
export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  const easeOut = [0.22, 1, 0.36, 1] as const;

  const riseIn = (delay = 0) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: easeOut },
        };

  return (
    <section className="relative isolate  overflow-hidden bg-cream">
      {/* Bali temple/landscape background.
          Mobile: full-bleed low-opacity backdrop behind everything.
          sm+: fades in from the right edge, widening with the viewport. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 [mask-image:linear-gradient(to_bottom,transparent,black_45%,black_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_45%,black_100%)] sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[55%] sm:opacity-100 sm:[mask-image:linear-gradient(to_right,transparent,black_22%,black_100%)] sm:[-webkit-mask-image:linear-gradient(to_right,transparent,black_22%,black_100%)] md:w-[55%] lg:w-[57%] xl:w-[55%]"
      >
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 22%, black 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 22%, black 100%)",
          }}
        />
        <Image
          src="/hero/hero-bg-temple.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 57vw, (min-width: 640px) 55vw, 100vw"
          className="object-cover object-center"
          priority
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-end gap-8 overflow-x-hidden px-4 pb-0 pt-10 sm:gap-10 sm:px-6 sm:pt-14 md:px-8 lg:grid-cols-2 lg:gap-6 lg:overflow-visible lg:pt-20">
        {/* Copy column */}
        <div className="relative z-20 min-w-0 max-w-xl pb-10 sm:pb-14 lg:pb-28">
          <motion.p
            {...riseIn(0)}
            className="mb-3 font-sans text-[11px] uppercase tracking-[0.22em] text-copper sm:mb-4 sm:text-[12px] md:text-[13px]"
          >
            {heroContent.eyebrow}
          </motion.p>

          <motion.h1
            {...riseIn(0.08)}
            className="font-display text-[34px] leading-[1.1] text-espresso xs:text-[38px] sm:text-[44px] sm:leading-[1.08] md:text-[52px] lg:text-[60px] xl:text-[68px]"
          >
            {heroContent.headline[0]}
            <br />
            {heroContent.headline[1]}
          </motion.h1>

          <motion.p
            {...riseIn(0.16)}
            className="mt-4 max-w-sm font-sans text-[15px] leading-relaxed text-warm-gray sm:mt-5 sm:text-[16px] md:text-[17px]"
          >
            {heroContent.subheading}
          </motion.p>

          <motion.div
            {...riseIn(0.24)}
            className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4"
          >
            <Link
              href={heroContent.primaryCta.href}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-espresso px-5 font-sans text-[13px] font-medium text-cream transition-colors hover:bg-espresso-deep sm:h-12 sm:px-6 sm:text-[14px]"
            >
              {heroContent.primaryCta.label}
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={heroContent.secondaryCta.href}
              className="inline-flex h-11 items-center rounded-full border border-border-strong px-5 font-sans text-[13px] font-medium text-espresso transition-colors hover:border-copper sm:h-12 sm:px-6 sm:text-[14px]"
            >
              {heroContent.secondaryCta.label}
            </Link>
          </motion.div>
        </div>

        {/* Woman + tea — main hero visual, meaningful alt text.
            Height is driven by aspect-ratio + width instead of a fixed
            pixel height, so it scales cleanly at every breakpoint instead
            of overflowing or leaving dead space on small/large screens. */}
        <motion.div
          {...(prefersReducedMotion
            ? {}
            : {
                initial: { opacity: 0, y: 24 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.7, delay: 0.15, ease: easeOut },
              })}
          className="relative ml-auto mr-[calc(-1*max(1rem,env(safe-area-inset-right)))] aspect-[3/4] w-full max-w-[320px] -mr-4 sm:-mr-6 sm:aspect-[5/4] sm:max-w-[520px] md:-mr-8 lg:mx-0 lg:mr-[calc(50%-30vw)] lg:aspect-auto lg:h-[560px] lg:max-w-none lg:w-auto"
        >
          <Image
            src="/hero/hero-woman.png"
            alt="Woman relaxing with a warm cup of Finasto botanical tea on a Bali terrace"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, (min-width: 640px) 60vw, 85vw"
            className="object-contain object-bottom"
          />
        </motion.div>
      </div>
    </section>
  );
}
