// // "use client";

// // import { useEffect, useState } from "react";
// // import Image from "next/image";
// // import { useReducedMotion } from "motion/react";
// // import { cn } from "@/lib/utils";
// // import { whySlides } from "@/data/home";

// // const SLIDE_DURATION_MS = 6000; 
// // const TRANSITION_MS = 500; 

// // // Cycled per-slide panel background — keeps the "green family" palette
// // // varied across slides instead of one flat wash.

// // /**
// //  * Split carousel: text panel (left) + image panel (right).
// //  * Both panels move together as one synced "wave": on advance, the
// //  * active text + image translate out to the left while the next
// //  * text + image translate in from the right (translate-x, not opacity
// //  * alone), so the two panels never feel disconnected from each other.
// //  *
// //  * SEO notes (see explanation below the component):
// //  * - Every slide's heading/copy/image is always present in the rendered
// //  *   HTML (visually hidden, not unmounted), so crawlers see full content
// //  *   on first paint instead of only whichever slide happens to be active.
// //  * - Slides are marked up as a semantic <ul>/<li> list.
// //  * - Only the first image is `priority`; the rest lazy-load.
// //  * - aria-live announces the active slide's heading for assistive tech
// //  *   without duplicating visible text.
// //  */
// // export function WhyFinasto() {
// //   const prefersReducedMotion = useReducedMotion();
// // const [active, setActive] = useState(0);
// //   const [paused, setPaused] = useState(false);
// // const total = whySlides.length;

// // useEffect(() => {
// //   if (total < 2) return;
// //   const id = setTimeout(() => {
// //     setActive((prev) => (prev + 1) % total);
// //   }, SLIDE_DURATION_MS);
// //   return () => clearTimeout(id);
// // }, [active, total]);

// // const goTo = (index: number) => {
// //   setActive(((index % total) + total) % total);
// // };
// //   return (
// //     <section
// //       className="relative w-full overflow-hidden"
// //       aria-roledescription="carousel"
// //  aria-label="Why Finasto"
// //       onMouseEnter={() => setPaused(true)}
// //       onMouseLeave={() => setPaused(false)}
// //       onFocus={() => setPaused(true)}
// //       onBlur={() => setPaused(false)}
      
// //     >
// // <div className="relative grid grid-cols-1 border-t border-copper/30 bg-gradient-to-b from-cream to-cream-soft lg:grid-cols-2">
// //         <div className="col-span-full px-5 py-10 text-center sm:px-8">
// //           <p className="font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
// //             Why Finasto
// //           </p>
// //           <h2 className="mt-2 font-display text-[36px] leading-tight text-green-deep   sm:text-[48px]">
// //             Why Choose Finasto?
// //           </h2>
// //           <p className="mx-auto mt-3 max-w-2xl font-sans text-[15px] leading-relaxed text-espresso-deep/70">>
// //             Discover what makes Finasto different and why it matters for your
// //             journey.
// //           </p>
// //         </div>

// //         {/* TEXT PANEL — order-2 on mobile (under image), order-1 on desktop (left) */}
// //         <div
// //           className={cn(
// //             "relative order-2 flex h-[460px] items-center overflow-hidden border border-border-strong bg-green-bg px-5 py-10 sm:h-[420px] sm:px-8 lg:order-1 lg:h-[560px]",
// //           )}
// //         >
// //           <ul className="mx-auto grid w-full max-w-lg list-none p-0">
// //             {whySlides.map((slide, i) => {
// //               const diff = (i - active + total) % total;
// //               const translate =
// //                 diff === 0
// //                   ? "translate-x-0 opacity-100"
// //                   : diff === total - 1
// //                     ? "-translate-x-8 opacity-0"
// //                     : "translate-x-8 opacity-0";

// //               return (
// //                 <li
// //                   key={slide.id}
// //                   className={cn(
// //                     "transition-all ease-in-out",
// //                     "col-start-1 row-start-1",
// //                     i !== active && "pointer-events-none",
// //                     translate,
// //                   )}
// //                   style={{ transitionDuration: prefersReducedMotion ? "0ms" : `${TRANSITION_MS}ms` }}
// //                   aria-hidden={i !== active}
// //                 >
// //                   <p className="font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
// //                     {slide.eyebrow}
// //                   </p>
// //                   <h3 className="mt-3 font-display text-[32px] leading-tight text-green-deep sm:text-[40px]">
// //                     {slide.heading}
// //                   </h3>
// //                   <p className="mt-4 font-sans text-[15px] leading-relaxed text-warm-gray">
// //                     {slide.description}
// //                   </p>
// //                   <ul className="mt-7 space-y-2">
// //                     {slide.details.map((d) => (
// //                       <li
// //                         key={d}
// //                         className="flex items-start gap-2 font-sans text-[14px] text-warm-gray"
// //                       >
// //                         <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
// //                         {d}
// //                       </li>
// //                     ))}
// //                   </ul>
// //                 </li>
// //               );
// //             })}
// //           </ul>

// //           {/* Screen-reader-only live announcement of the current slide */}
// //           <span className="sr-only" role="status" aria-live={paused ? "polite" : "off"}>
// //             {`Slide ${active + 1} of ${total}: ${whySlides[active].heading}`}
// //           </span>

// //           {/* Indicators */}
// //           <div className="absolute bottom-6 left-5 flex gap-2 sm:left-8">
// //             {whySlides.map((slide, i) => (
// //               <button
// //                 key={slide.id}
// //                 type="button"
// //                 onClick={() => goTo(i)}
// //                 aria-label={`Go to slide ${i + 1}: ${slide.heading}`}
// //                 aria-current={i === active}
// //                 className={cn(
// //                   "h-1.5 rounded-full transition-all duration-300",
// //                   i === active
                   
// //                     ? "w-6 bg-copper"
// // : "w-1.5 bg-espresso/25 hover:bg-espresso/45",
// //                 )}
// //               />
// //             ))}
// //           </div>
// //         </div>

// //         {/* IMAGE PANEL — order-1 on mobile (on top), order-2 on desktop (right) */}
// //         <div className="relative order-1 h-[280px] overflow-hidden bg-green-bg sm:h-[360px] lg:order-2 lg:h-[560px]">
// //           {whySlides.map((slide, i) => {
// //             const diff = (i - active + total) % total;
// //             const translate =
// //               diff === 0
// //                 ? "translate-x-0"
// //                 : diff === total - 1
// //                   ? "-translate-x-full"
// //                   : "translate-x-full";

// //             return (
// //               <div
// //                 key={slide.id}
// //                 className={cn(
// //                   "absolute inset-0 transition-transform ease-in-out",
// //                   translate,
// //                 )}
// //                 style={{ transitionDuration: prefersReducedMotion ? "0ms" : `${TRANSITION_MS}ms` }}
// //                 aria-hidden={i !== active}
// //               >
// //                 <Image
// //                   src={slide.image}
// //                   alt={slide.imageAlt}
// //                   fill
// //                   sizes="(min-width: 1024px) 50vw, 100vw"
// //                   className={cn(
// //                     "object-cover object-center",
// //                     i === active &&
// //                       !prefersReducedMotion &&
// //                       "animate-water-wave",  
// //                   )}
// //                   loading={i === active || i === (active + 1) % total ? "eager" : "lazy"}
// //                 />
// //               </div>
// //             );
// //           })}
// //         </div>
// //       </div>
// //     </section>
// //   );
// // }
// "use client";

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { ArrowLeft, ArrowRight, Check, Pause, Play } from "lucide-react";
// import { useReducedMotion } from "motion/react";
// import { cn } from "@/lib/utils";
// import { whySlides } from "@/data/home";

// const SLIDE_DURATION_MS = 6000;
// const TRANSITION_MS = 500;

// /**
//  * Split carousel: text panel (left) + image panel (right).
//  * Both panels move together as one synced "wave": on advance, the
//  * active text + image translate out to the left while the next
//  * text + image translate in from the right.
//  *
//  * SEO / accessibility notes:
//  * - Every slide's heading/copy/image is always present in the rendered
//  *   HTML (visually hidden, not unmounted), so crawlers see full content.
//  * - Slides are marked up as a semantic <ul>/<li> list.
//  * - Only the active and next images load eagerly; the rest lazy-load.
//  * - aria-live announces the active slide's heading for assistive tech.
//  * - Autoplay pauses on hover/focus, via the pause button, and is
//  *   disabled for users who prefer reduced motion (WCAG 2.2.2).
//  */
// export function WhyFinasto() {
//   const prefersReducedMotion = useReducedMotion();
//   const [active, setActive] = useState(0);
//   const [paused, setPaused] = useState(false);
//   const [userPaused, setUserPaused] = useState(false);
//   const total = whySlides.length;

//   useEffect(() => {
//     if (total < 2 || paused || userPaused || prefersReducedMotion) return;
//     const id = setTimeout(() => {
//       setActive((prev) => (prev + 1) % total);
//     }, SLIDE_DURATION_MS);
//     return () => clearTimeout(id);
//   }, [active, total, paused, userPaused, prefersReducedMotion]);

//   const goTo = (index: number) => {
//     setActive(((index % total) + total) % total);
//   };

//   return (
//     <section
//       className=" relative w-full overflow-hidden border-t border-copper/30 bg-gradient-to-b from-cream to-cream-soft"
//       aria-roledescription="carousel"
//       aria-label="Why Finasto"
//       onMouseEnter={() => setPaused(true)}
//       onMouseLeave={() => setPaused(false)}
//       onFocus={() => setPaused(true)}
//       onBlur={() => setPaused(false)}
//     >
//       <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 px-5 pb-14 sm:px-8 lg:grid-cols-2">
//         <div className="col-span-full px-0 py-12 text-center">
//           <p className="flex items-center justify-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
//             <span aria-hidden="true" className="h-px w-8 bg-copper" />
//             Why Finasto
//             <span aria-hidden="true" className="h-px w-8 bg-copper" />
//           </p>
//           <h2 className="mt-2 font-display text-[36px] leading-tight text-green-deep sm:text-[48px]">
//             Why Choose Finasto?
//           </h2>
//           <p className="mx-auto mt-3 max-w-2xl font-sans text-[15px] leading-relaxed text-espresso-deep/70">
//             Discover what makes Finasto different and why it matters for your
//             journey.
//           </p>
//         </div>

//         {/* TEXT PANEL: order-2 on mobile (under image), order-1 on desktop (left) */}
//         <div
//           className={cn(
//             "relative order-2 flex h-[480px] items-center overflow-hidden rounded-b-3xl bg-green-bg px-6 py-10 sm:h-[440px] sm:px-12 lg:order-1 lg:h-[560px] lg:rounded-b-none lg:rounded-l-3xl lg:border-r-0 lg:px-16",
//           )}
//         >
//           <ul className="mx-auto grid w-full max-w-lg list-none p-0">
//             {whySlides.map((slide, i) => {
//               const diff = (i - active + total) % total;
//               const translate =
//                 diff === 0
//                   ? "translate-x-0 opacity-100"
//                   : diff === total - 1
//                     ? "-translate-x-8 opacity-0"
//                     : "translate-x-8 opacity-0";

//               return (
//                 <li
//                   key={slide.id}
//                   className={cn(
//                     "transition-all ease-in-out",
//                     "col-start-1 row-start-1",
//                     i !== active && "pointer-events-none",
//                     translate,
//                   )}
//                   style={{
//                     transitionDuration: prefersReducedMotion
//                       ? "0ms"
//                       : `${TRANSITION_MS}ms`,
//                   }}
//                   aria-hidden={i !== active}
//                 >
//                   <p className="flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
//                     <span className="font-display text-[20px] tracking-normal">
//                       {String(i + 1).padStart(2, "0")}
//                     </span>
//                     <span aria-hidden="true" className="h-px w-8 bg-copper/60" />
//                     {slide.eyebrow}
//                   </p>
//                   <h3 className="mt-3 font-display text-[32px] leading-tight text-green-deep sm:text-[40px]">
//                     {slide.heading}
//                   </h3>
//                   <p className="mt-4 font-sans text-[15px] leading-relaxed text-warm-gray">
//                     {slide.description}
//                   </p>
//                   <ul className="mt-7 space-y-2">
//                     {slide.details.map((d) => (
//                       <li
//                         key={d}
//                         className="flex items-start gap-2 font-sans text-[14px] text-warm-gray"
//                       >
//                         <Check
//                           className="mt-[3px] h-4 w-4 shrink-0 text-copper"
//                           strokeWidth={2}
//                           aria-hidden="true"
//                         />
//                         {d}
//                       </li>
//                     ))}
//                   </ul>
//                 </li>
//               );
//             })}
//           </ul>

//           {/* Screen-reader-only live announcement of the current slide */}
//           <span
//             className="sr-only"
//             role="status"
//             aria-live={paused ? "polite" : "off"}
//           >
//             {`Slide ${active + 1} of ${total}: ${whySlides[active].heading}`}
//           </span>

//           {/* Controls */}
//           <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between sm:left-12 sm:right-12 lg:left-16 lg:right-16">
//             <div className="flex items-center gap-4">
//               <div className="flex gap-2">
//                 {whySlides.map((slide, i) => (
//                   <button
//                     key={slide.id}
//                     type="button"
//                     onClick={() => goTo(i)}
//                     aria-label={`Go to slide ${i + 1}: ${slide.heading}`}
//                     aria-current={i === active}
//                     className={cn(
//                       "h-1.5 cursor-pointer rounded-full transition-all duration-300",
//                       i === active
//                         ? "w-8 bg-copper"
//                         : "w-1.5 bg-espresso/25 hover:bg-espresso/45",
//                     )}
//                   />
//                 ))}
//               </div>
//               <span className="font-sans text-[12px] tracking-widest text-warm-gray">
//                 {String(active + 1).padStart(2, "0")} /{" "}
//                 {String(total).padStart(2, "0")}
//               </span>
//             </div>

//             <div className="flex items-center gap-2">
//               {/* <button
//                 type="button"
//                 onClick={() => setUserPaused((p) => !p)}
//                 aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
//                 className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border-strong text-espresso transition-colors hover:border-copper hover:text-copper"
//               >
//                 {userPaused ? (
//                   <Play className="h-4 w-4" aria-hidden="true" />
//                 ) : (
//                   <Pause className="h-4 w-4" aria-hidden="true" />
//                 )}
//               </button> */}
//               <button
//                 type="button"
//                 onClick={() => goTo(active - 1)}
//                 aria-label="Previous slide"
//                 className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border-strong text-espresso transition-colors hover:bg-copper hover:text-[#ffffff]"
//               >
//                 <ArrowLeft className="h-4 w-4" aria-hidden="true" />
//               </button>
//               <button
//                 type="button"
//                 onClick={() => goTo(active + 1)}
//                 aria-label="Next slide"
//                 className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border-strong text-espresso transition-colors hover:bg-copper hover:text-[#ffffff]"
//               >
//                 <ArrowRight className="h-4 w-4" aria-hidden="true" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* IMAGE PANEL: order-1 on mobile (on top), order-2 on desktop (right) */}
//         <div className="relative order-1 h-[280px] overflow-hidden rounded-t-3xl bg-green-bg sm:h-[360px] lg:order-2 lg:h-[560px] lg:rounded-l-none lg:rounded-r-3xl">
//           <div
//             aria-hidden="true"
//             className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/25 via-transparent to-transparent"
//           />
//           {whySlides.map((slide, i) => {
//             const diff = (i - active + total) % total;
//             const translate =
//               diff === 0
//                 ? "translate-x-0"
//                 : diff === total - 1
//                   ? "-translate-x-full"
//                   : "translate-x-full";

//             return (
//               <div
//                 key={slide.id}
//                 className={cn(
//                   "absolute inset-0 transition-transform ease-in-out",
//                   translate,
//                 )}
//                 style={{
//                   transitionDuration: prefersReducedMotion
//                     ? "0ms"
//                     : `${TRANSITION_MS}ms`,
//                 }}
//                 aria-hidden={i !== active}
//               >
//                 <Image
//                   src={slide.image}
//                   alt={slide.imageAlt}
//                   fill
//                   sizes="(min-width: 1024px) 50vw, 100vw"
//                   className={cn(
//                     "object-cover object-center",
//                     i === active &&
//                       !prefersReducedMotion &&
//                       "animate-water-wave",
//                   )}
//                   loading={
//                     i === active || i === (active + 1) % total
//                       ? "eager"
//                       : "lazy"
//                   }
//                 />
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { whySlides } from "@/data/home";
import { Reveal } from "@/components/ui/reveal";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  Gem,
  Globe,
  Handshake,
  Leaf,
  Package,
  ShieldCheck,
  Sprout,
  Sun,
  type LucideIcon,
} from "lucide-react";
const SLIDE_DURATION_MS = 3000;
const TRANSITION_MS = 500;
// Icons per card, in the same order as whySlides. Each inner list matches that
// card's detail rows by position. Missing icons fall back to the check mark.
const SLIDE_ICONS: LucideIcon[][] = [
  [Leaf, Globe, Gem], // card 1
  [Sprout, Sun, ShieldCheck], // card 2
  [Package, Handshake, Award], // card 3
];

const revealCls = (on: boolean) =>
  cn(
    "transition-[opacity,transform] duration-700 ease-out",
    on ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
  );
const revealDelay = (on: boolean, step: number) => ({
  transitionDelay: on ? `${150 + step * 80}ms` : "0ms",
});

export function WhyFinasto() {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = whySlides.length;

  useEffect(() => {
    if (total < 2 || paused) return;
    const id = setTimeout(() => {
      setActive((prev) => (prev + 1) % total);
    }, SLIDE_DURATION_MS);
    return () => clearTimeout(id);
  }, [active, total, paused]);

  const goTo = (index: number) => {
    setActive(((index % total) + total) % total);
  };

  return (
    <section
      className="relative w-full overflow-hidden border-t border-copper/30 bg-gradient-to-b from-cream to-cream-soft"
      aria-roledescription="carousel"
      aria-label="Why Finasto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative mx-auto max-w-[1440px] px-5 pb-14 sm:px-8">
        {/* Heading */}
        <Reveal className="px-0 py-12 text-center">
          <p className="flex items-center justify-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
            <span aria-hidden="true" className="h-px w-8 bg-copper" />
            Why Finasto™
            <span aria-hidden="true" className="h-px w-8 bg-copper" />
          </p>
          <h2 className="mt-2 font-display text-[36px] leading-tight text-green-deep sm:text-[48px]">
            Why Choose Finasto™?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl font-sans text-[15px] leading-relaxed text-espresso-deep/70">
           A refined collection of beverages, thoughtfully selected for quality, inspired by nature, and made for modern living.
          </p>
        </Reveal>

        {/* Unified card */}
        <Reveal delay={0.15}>
          <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-copper/30 shadow-[0_20px_50px_-20px_rgba(50,30,24,0.25)] lg:grid-cols-2">
            {/* TEXT PANEL */}
            <div className="relative order-2 flex h-[480px] items-center overflow-hidden bg-green-bg px-6 py-10 sm:h-[440px] sm:px-12 lg:order-1 lg:h-[560px] lg:px-16">
             

              <ul className="relative mx-auto grid w-full max-w-lg list-none p-0">
                {whySlides.map((slide, i) => {
                  const on = i === active;
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
                        "col-start-1 row-start-1",
                        !on && "pointer-events-none",
                        translate,
                      )}
                      style={{
                        transitionDuration: prefersReducedMotion
                          ? "0ms"
                          : `${TRANSITION_MS}ms`,
                      }}
                      aria-hidden={!on}
                    >
                      <p
                        className={cn(
                          "flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-copper",
                          revealCls(on),
                        )}
                        style={revealDelay(on, 0)}
                      >
                        <span className="font-display text-[20px] tracking-normal">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          aria-hidden="true"
                          className="h-px w-8 bg-copper/60"
                        />
                        {slide.eyebrow}
                      </p>
                      <h3
                        className={cn(
                          "mt-3 font-display text-[32px] leading-tight text-green-deep sm:text-[40px]",
                          revealCls(on),
                        )}
                        style={revealDelay(on, 1)}
                      >
                        {slide.heading}
                      </h3>
                      <p
                        className={cn(
                          "mt-4 font-sans text-[15px] leading-relaxed text-warm-gray",
                          revealCls(on),
                        )}
                        style={revealDelay(on, 2)}
                      >
                        {slide.description}
                      </p>
                      <ul
                        className={cn("mt-7 space-y-4", revealCls(on))}
                        style={revealDelay(on, 3)}
                      >
                       {slide.details.map((d, k) => {
  const Icon = SLIDE_ICONS[i]?.[k] ?? Check;
  return (
    <li
      key={d}
      className="flex items-start gap-3 font-sans text-[14px] text-warm-gray"
    >
      <Icon
        className="mt-[2px] h-5 w-5 shrink-0 text-copper"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      {d}
    </li>
  );
})}
                      </ul>
                    </li>
                  );
                })}
              </ul>

              <span
                className="sr-only"
                role="status"
                aria-live={paused ? "polite" : "off"}
              >
                {`Slide ${active + 1} of ${total}: ${whySlides[active].heading}`}
              </span>

              {/* Controls */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between sm:left-12 sm:right-12 lg:left-16 lg:right-16">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {whySlides.map((slide, i) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-label={`Go to slide ${i + 1}: ${slide.heading}`}
                        aria-current={i === active}
                        className={cn(
                          "relative h-1.5 cursor-pointer overflow-hidden rounded-full bg-espresso/25 transition-all duration-300 hover:bg-espresso/45",
                          i === active ? "w-12" : "w-1.5",
                        )}
                      >
                        {i === active && (
                          <span
                            key={`${active}-${paused}`}
                            className="hero-progress absolute inset-y-0 left-0 bg-copper"
                            style={
                              paused
                                ? { width: "100%", animation: "none" }
                                : { animationDuration: `${SLIDE_DURATION_MS}ms` }
                            }
                          />
                        )}
                      </button>
                    ))}
                  </div>
                 
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goTo(active - 1)}
                    aria-label="Previous slide"
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border-strong text-espresso transition-colors hover:bg-copper hover:text-[#ffffff]"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(active + 1)}
                    aria-label="Next slide"
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border-strong text-espresso transition-colors hover:bg-copper hover:text-[#ffffff]"
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* IMAGE PANEL */}
            <div className="relative order-1 h-[280px] overflow-hidden bg-green-bg sm:h-[360px] lg:order-2 lg:h-[560px]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/25 via-transparent to-transparent"
              />
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
                    style={{
                      transitionDuration: prefersReducedMotion
                        ? "0ms"
                        : `${TRANSITION_MS}ms`,
                    }}
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
                          "animate-slow-zoom",
                      )}
                      loading={
                        i === active || i === (active + 1) % total
                          ? "eager"
                          : "lazy"
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}