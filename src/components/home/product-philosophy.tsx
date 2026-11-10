// // import { philosophyContent } from "@/data/home";

// // /**
// //  * Deliberately quiet after two dark/photo-heavy sections above it — cream
// //  * background, no imagery, just typography and thin copper dividers
// //  * between the three ritual steps.
// //  */
// // export function ProductPhilosophy() {
// //   const { eyebrow, heading, intro, steps } = philosophyContent;

// //   return (
// //     <section className="relative border-t border-copper/30 bg-cream py-20 lg:py-28">
// //       <div className="mx-auto max-w-[1000px] px-5 text-center sm:px-8">
// //         <p className="flex items-center justify-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
// //           <span aria-hidden="true" className="h-px w-8 bg-copper-light" />
// //           {eyebrow}
// //           <span aria-hidden="true" className="h-px w-8 bg-copper-light" />
// //         </p>
// //         <h2 className="mt-4 font-display text-[36px] leading-tight text-green-deep sm:text-[44px]">
// //           {heading}
// //         </h2>
// //         <p className="mx-auto mt-4 max-w-md font-sans text-[15px] leading-relaxed text-espresso/75">
// //           {intro}
// //         </p>

// //         <div className="mt-14 grid grid-cols-1 divide-y divide-border-strong sm:grid-cols-3 sm:divide-x sm:divide-y-0">
// //           {steps.map((step, i) => (
// //             <div
// //               key={step.id}
// //               className="flex flex-col items-center px-4 py-8 first:pt-0 sm:py-0 sm:first:pl-0 sm:last:pr-0"
// //             >
// //               <span className="flex h-12 w-12 items-center justify-center rounded-full border border-copper/40 bg-green-bg font-display text-[18px] italic text-green-deep shadow-[0_4px_14px_rgba(50,30,24,0.08)]">
// //                 {String(i + 1).padStart(2, "0")}
// //               </span>
// //               <h3 className="mt-4 font-display text-[24px] text-green-deep">
// //                 {step.title}
// //               </h3>
// //               <p className="mt-3 max-w-[280px] font-sans text-[14px] leading-relaxed text-warm-gray">
// //                 {step.description}
// //               </p>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </section>
// //   );
// // }
// "use client";

// import { useState } from "react";
// import {
//   Droplets,
//   Sparkles,
//   Sun,
//   Leaf,
//   FlaskConical,
//   HandHeart,
//   PackageCheck,
//   type LucideIcon,
//   Coffee,
// } from "lucide-react";
// import { philosophyContent, philosophyPromises } from "@/data/home";
// import { withTM } from "@/lib/brand";

// /** Swap these to match your ritual. Picked by step order (1, 2, 3). */
// const STEP_ICONS: LucideIcon[] = [Droplets, Sparkles, Sun];

// /** Swap these to match your promises. Picked by order. */
// const PROMISE_ICONS: LucideIcon[] = [Leaf, FlaskConical, HandHeart, Coffee];

// /**
//  * Quiet cream section after two dark/photo-heavy ones.
//  * Part 1: sticky statement on the left, connected icon stepper on the right.
//  * Part 2: a promises row underneath, separated by thin dividers (no cards).
//  */
// export function ProductPhilosophy() {
//   const { eyebrow, heading, intro, steps } = philosophyContent;
//   const [active, setActive] = useState(0);
//   const last = steps.length - 1;

//   return (
//    <section className="bg-pattern dark relative overflow-x-clip border-t border-copper/30 bg-green-bg py-24 lg:py-32">
//   {/* Glow blobs (sit under the content, over the pattern; translucent so the pattern still shows) */}
//   <div
//     aria-hidden="true"
//     className="pointer-events-none absolute -left-24 -top-24 h-[320px] w-[320px] rounded-full bg-green/20 blur-3xl motion-safe:animate-pulse"
//   />
//   <div
//     aria-hidden="true"
//     className="pointer-events-none absolute -bottom-32 -right-16 h-[280px] w-[200px] rounded-full bg-copper/25 blur-3xl motion-safe:animate-pulse [animation-delay:1.5s]"
//   />

//   <div className="relative z-10 mx-auto max-w-[1180px] px-5 sm:px-8">
//     {/* Part 1: statement + stepper */}
//     <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-24">
//       <div className="lg:sticky lg:top-28 lg:self-start">
//         <p className="flex items-center gap-3 font-sans text-[12px] font-medium uppercase tracking-[0.22em] text-copper">
//           <span aria-hidden="true" className="h-px w-10 bg-copper" />
//           {eyebrow}
//         </p>
//         <h2 className="mt-6 max-w-[14ch] font-display text-[40px] leading-[1.08] text-green-deep sm:text-[52px]">
//           {withTM(heading)}
//         </h2>
//         <p className="mt-6 max-w-[38ch] font-sans text-[16px] leading-[1.75] text-espresso/90">
//           {intro}
//         </p>
//         <p
//           className="mt-10 font-display text-[15px] italic text-espresso/70"
//           aria-live="polite"
//         >
//           Step {active + 1} of {steps.length}
//         </p>
//       </div>

//       <ol className="relative">
//         {steps.map((step, i) => {
//           const Icon = STEP_ICONS[i % STEP_ICONS.length];
//           const isActive = i === active;
//           const isDone = i < active;
//           const panelId = `philosophy-panel-${step.id}`;
//           const buttonId = `philosophy-tab-${step.id}`;

//           return (
//             <li key={step.id} className="relative pb-10 last:pb-0">
//               {i < last && (
//                 <span
//                   aria-hidden="true"
//                   className="absolute bottom-0 left-7 top-16 w-px -translate-x-1/2 bg-border-strong"
//                 >
//                   <span
//                     className={`absolute inset-x-0 top-0 block w-px bg-copper transition-[height] duration-700 ease-out motion-reduce:transition-none ${
//                       isDone ? "h-full" : "h-0"
//                     }`}
//                   />
//                 </span>
//               )}

//               <button
//                 type="button"
//                 id={buttonId}
//                 aria-expanded={isActive}
//                 aria-controls={panelId}
//                 onClick={() => setActive(i)}
//                 className="group flex w-full items-center gap-6 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
//                 style={{
//                   cursor: "pointer",
//                 }}
//               >
//                 <span
//                   className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all duration-500 motion-reduce:transition-none ${
//                     isActive
//                       ? "border-copper bg-copper text-cream shadow-[0_0_0_6px_rgba(184,115,51,0.2),0_10px_30px_rgba(184,115,51,0.4)]"
//                       : isDone
//                         ? "border-copper bg-copper/15 text-copper"
//                         : "border-copper/40 bg-cream text-green-deep/80 group-hover:border-copper"
//                   }`}
//                 >
//                   <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
//                 </span>

//                 <span className="flex items-baseline gap-3">
//                   <span className="font-display text-[15px] italic text-copper">
//                     {String(i + 1).padStart(2, "0")}
//                   </span>
//                   <span
//                     className={`font-display text-[26px] leading-tight transition-colors duration-500 motion-reduce:transition-none sm:text-[30px] ${
//                       isActive
//                         ? "text-copper"
//                         : "text-green-deep/70 group-hover:text-green-deep"
//                     }`}
//                   >
//                     {step.title}
//                   </span>
//                 </span>
//               </button>

//               <div
//                 id={panelId}
//                 role="region"
//                 aria-labelledby={buttonId}
//                 className={`grid pl-[80px] transition-[grid-template-rows,opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
//                   isActive
//                     ? "grid-rows-[1fr] translate-y-0 opacity-100"
//                     : "grid-rows-[0fr] -translate-y-2 opacity-0"
//                 }`}
//               >
//                 <div className="overflow-hidden">
//                   <p className="max-w-[46ch] pt-4 font-sans text-[15px] leading-[1.8] text-espresso/80">
//                     {step.description}
//                   </p>
//                   {i < last && (
//                     <button
//                       type="button"
//                       onClick={() => setActive(i + 1)}
//                       tabIndex={isActive ? 0 : -1}
//                       className="mt-5 inline-flex items-center gap-2 border-b border-copper/60 pb-0.5 font-sans text-[13px] text-copper transition-colors hover:border-copper hover:text-green-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
//                       style={{
//                         cursor: "pointer",
//                       }}
//                     >
//                       Next step
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </li>
//           );
//         })}
//       </ol>
//     </div>

//     {/* Part 2: promises row */}
//     <div className="mt-20 border-t border-copper/30 pt-14 lg:mt-28 lg:pt-16">
//       <ul className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-border-strong">
//         {philosophyPromises.map((promise, i) => {
//           const Icon = PROMISE_ICONS[i % PROMISE_ICONS.length];
//           return (
//             <li key={promise.id} className="lg:px-8 lg:first:pl-0 lg:last:pr-0">
//               <Icon
//                 className="h-7 w-7 text-copper drop-shadow-[0_0_8px_rgba(184,115,51,0.35)]"
//                 strokeWidth={1.25}
//                 aria-hidden="true"
//               />
//               <h3 className="mt-5 font-display text-[22px] leading-snug text-green-deep">
//                 {promise.title}
//               </h3>
//               <p className="mt-2 max-w-[30ch] font-sans text-[14px] leading-[1.75] text-espresso/80">
//                 {promise.description}
//               </p>
//             </li>
//           );
//         })}
//       </ul>
//     </div>
//   </div>
// </section>
//   );
// }

"use client";

import { useRef, useState, type PointerEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Droplets,
  Sparkles,
  Sun,
  Leaf,
  FlaskConical,
  HandHeart,
  Coffee,
  type LucideIcon,
} from "lucide-react";
import { philosophyContent, philosophyPromises } from "@/data/home";
import { withTM } from "@/lib/brand";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Swap these to match your ritual. Picked by step order (1, 2, 3). */
const STEP_ICONS: LucideIcon[] = [Droplets, Sparkles, Sun];

/** Swap these to match your promises. Picked by order. */
const PROMISE_ICONS: LucideIcon[] = [Leaf, FlaskConical, HandHeart, Coffee];

type Ripple = { id: number; x: number; y: number };

/**
 * Green Vision-card theme: gradient, dots, animated blobs, shine sweep.
 * Part 1: sticky statement on the left, connected icon stepper on the right.
 * Part 2: promise cards underneath.
 * Tap / click anywhere on the section: copper ripple from the touch point.
 */
export function ProductPhilosophy() {
  const { eyebrow, heading, intro, steps } = philosophyContent;
  const [active, setActive] = useState(0);
  const last = steps.length - 1;
  const reduce = useReducedMotion();

  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleId = useRef(0);

  const addRipple = (e: PointerEvent<HTMLElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = ++rippleId.current;
    setRipples((r) => [
      ...r.slice(-5), // keep at most 6 on screen
      { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
    ]);
  };
  const removeRipple = (id: number) =>
    setRipples((r) => r.filter((x) => x.id !== id));

  return (
    <section
      onPointerDown={addRipple}
      className="group relative isolate overflow-hidden border-t border-copper/30 bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24] py-20 text-white sm:py-24 lg:py-32"
    >
      {/* animated blobs */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 -z-10 h-72 w-72 rounded-full bg-copper/35 blur-[90px]"
        animate={reduce ? undefined : { x: [0, -24, 0], y: [0, 18, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 -z-10 h-64 w-64 rounded-full bg-emerald-300/10 blur-[90px]"
        animate={reduce ? undefined : { x: [0, 20, 0], y: [0, -16, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* dots */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]"
      />
      {/* slow shine sweep (runs by itself, works on touch) */}
     {/* shine sweep */}
<span
  aria-hidden="true"
  className="pointer-events-none absolute inset-y-0 -left-1/2 -z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-[1400ms] ease-out group-hover:left-[130%] group-hover:opacity-100"
/>

      {/* tap / click ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          className="pointer-events-none absolute z-[5]"
          style={{ left: r.x, top: r.y }}
        >
          {/* soft glow */}
          <motion.span
            className="absolute -left-20 -top-20 block h-40 w-40 rounded-full bg-copper/40 blur-2xl"
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.2, ease: EASE }}
          />
          {/* main ring */}
          <motion.span
            className="absolute -left-5 -top-5 block h-10 w-10 rounded-full border-2 border-copper-light/80"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 14, opacity: 0 }}
            transition={{ duration: 1.1, ease: EASE }}
            onAnimationComplete={() => removeRipple(r.id)}
          />
          {/* second ring, slightly behind */}
          <motion.span
            className="absolute -left-5 -top-5 block h-10 w-10 rounded-full border border-white/40"
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 9, opacity: 0 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.12 }}
          />
        </span>
      ))}

      <div className="relative z-10 mx-auto max-w-[1180px] px-5 sm:px-8">
        {/* Part 1: statement + stepper */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="flex items-center gap-3 font-sans text-[12px] font-medium uppercase tracking-[0.22em] text-copper-light">
              <span aria-hidden="true" className="h-px w-10 bg-copper-light/60" />
              {eyebrow}
            </p>
            <motion.span
              aria-hidden="true"
              className="mt-4 block h-[2px] w-24 origin-left bg-gradient-to-r from-copper-light via-copper to-transparent"
              initial={{ scaleX: reduce ? 1 : 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
            />
            <h2 className="mt-6 max-w-[14ch] font-display text-[38px] leading-[1.08] text-white sm:text-[52px]">
              {withTM(heading)}
            </h2>
            <p className="mt-6 max-w-[38ch] font-sans text-[16px] leading-[1.75] text-white/80">
              {intro}
            </p>
            <p
              className="mt-8 font-display text-[15px] italic text-copper-light/90"
              aria-live="polite"
            >
              Step {active + 1} of {steps.length}
            </p>
          </div>

          <ol className="relative">
            {steps.map((step, i) => {
              const Icon = STEP_ICONS[i % STEP_ICONS.length];
              const isActive = i === active;
              const isDone = i < active;
              const panelId = `philosophy-panel-${step.id}`;
              const buttonId = `philosophy-tab-${step.id}`;

              return (
                <li key={step.id} className="relative pb-8 last:pb-0 sm:pb-10">
                  {i < last && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-7 top-16 w-px -translate-x-1/2 bg-white/15"
                    >
                      <span
                        className={`absolute inset-x-0 top-0 block w-px bg-copper-light transition-[height] duration-700 ease-out motion-reduce:transition-none ${
                          isDone ? "h-full" : "h-0"
                        }`}
                      />
                    </span>
                  )}

                  <motion.button
                    type="button"
                    id={buttonId}
                    aria-expanded={isActive}
                    aria-controls={panelId}
                    onClick={() => setActive(i)}
                    whileTap={reduce ? undefined : { scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="group flex w-full items-center gap-5 rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-light focus-visible:ring-offset-4 focus-visible:ring-offset-[#10260f] sm:gap-6"
                  >
                    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                      {/* rotating dashed ring + pulse on the active step */}
                      {isActive && (
                        <>
                          <motion.span
                            aria-hidden="true"
                            className="absolute -inset-1 rounded-full border border-dashed border-copper/70"
                            animate={reduce ? undefined : { rotate: 360 }}
                            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                          />
                          <motion.span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full bg-copper/30"
                            animate={
                              reduce
                                ? undefined
                                : { scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }
                            }
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </>
                      )}
                      <span
                        className={`relative flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-500 motion-reduce:transition-none ${
                          isActive
                            ? "border-copper-light bg-gradient-to-br from-cream to-copper-light text-green-deep shadow-[0_10px_30px_rgba(184,115,51,0.5)]"
                            : isDone
                              ? "border-copper bg-copper/25 text-copper-light"
                              : "border-copper/40 bg-white/5 text-white/80 md:group-hover:border-copper"
                        }`}
                      >
                        <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
                      </span>
                    </span>

                    <span className="flex items-baseline gap-3">
                      <span className="font-display text-[15px] italic text-copper-light">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-display text-[24px] leading-tight transition-colors duration-500 motion-reduce:transition-none sm:text-[30px] ${
                          isActive
                            ? "text-white"
                            : "text-white/65 md:group-hover:text-white"
                        }`}
                      >
                        {step.title}
                      </span>
                    </span>
                  </motion.button>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`grid pl-[76px] transition-[grid-template-rows,opacity,transform] duration-500 ease-out motion-reduce:transition-none sm:pl-[80px] ${
                      isActive
                        ? "translate-y-0 grid-rows-[1fr] opacity-100"
                        : "-translate-y-2 grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[46ch] pt-4 font-sans text-[15px] leading-[1.8] text-white/80">
                        {step.description}
                      </p>
                      {i < last && (
                        <button
                          type="button"
                          onClick={() => setActive(i + 1)}
                          tabIndex={isActive ? 0 : -1}
                          className="mt-5 inline-flex min-h-[44px] items-center gap-2 border-b border-copper-light/60 pb-0.5 font-sans text-[14px] text-copper-light transition-colors active:text-white md:hover:border-copper-light md:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-light focus-visible:ring-offset-4 focus-visible:ring-offset-[#10260f]"
                        >
                          Next step
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Part 2: promise cards */}
        <div className="mt-16 border-t border-copper/30 pt-12 lg:mt-24 lg:pt-16">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {philosophyPromises.map((promise, i) => {
              const Icon = PROMISE_ICONS[i % PROMISE_ICONS.length];
              return (
                <li key={promise.id}>
                  <motion.article
                    initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    whileHover={reduce ? undefined : { y: -8 }}
                    whileTap={reduce ? undefined : { scale: 0.97, y: -3 }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.08,
                      ease: EASE,
                    }}
                    className="group/card relative h-full overflow-hidden rounded-[22px] border border-copper/30 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur-sm transition-colors duration-500 hover:border-copper/70 sm:p-6"
                  >
                    {/* glow: always on for touch, hover-only on desktop */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-copper/30 opacity-60 blur-[60px] transition-opacity duration-500 group-active/card:opacity-100 md:opacity-0 md:group-hover/card:opacity-100"
                    />
                    {/* dots */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]"
                    />
                    {/* shine sweep */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-[1200ms] ease-out group-hover/card:left-[130%] group-hover/card:opacity-100 group-active/card:left-[130%] group-active/card:opacity-100"
                    />

                    <div className="relative">
                      <motion.div
                        className="relative inline-flex h-14 w-14 items-center justify-center"
                        animate={reduce ? undefined : { y: [0, -5, 0] }}
                        transition={{
                          duration: 3 + i * 0.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <motion.span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full border border-dashed border-copper/60"
                          animate={reduce ? undefined : { rotate: 360 }}
                          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.span
                          aria-hidden="true"
                          className="absolute inset-1 rounded-full bg-copper/25"
                          animate={
                            reduce
                              ? undefined
                              : { scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }
                          }
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.3,
                          }}
                        />
                        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cream to-copper-light/70 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover/card:rotate-[360deg] group-active/card:rotate-[360deg]">
                          <Icon
                            className="h-5 w-5 text-green-deep"
                            strokeWidth={1.75}
                            aria-hidden="true"
                          />
                        </span>
                      </motion.div>

                      <h3 className="mt-5 font-display text-[22px] leading-snug text-white">
                        {promise.title}
                      </h3>

                      <span
                        aria-hidden="true"
                        className="mt-3 block h-[2px] w-16 rounded-full bg-gradient-to-r from-copper-light to-transparent transition-all duration-500 group-hover/card:w-full group-active/card:w-full"
                      />

                      <p className="mt-3 font-sans text-[14px] leading-[1.75] text-white/70 transition-colors duration-500 group-hover/card:text-white/90 group-active/card:text-white/90">
                        {promise.description}
                      </p>
                    </div>
                  </motion.article>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}