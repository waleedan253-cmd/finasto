// import { philosophyContent } from "@/data/home";

// /**
//  * Deliberately quiet after two dark/photo-heavy sections above it — cream
//  * background, no imagery, just typography and thin copper dividers
//  * between the three ritual steps.
//  */
// export function ProductPhilosophy() {
//   const { eyebrow, heading, intro, steps } = philosophyContent;

//   return (
//     <section className="relative border-t border-copper/30 bg-cream py-20 lg:py-28">
//       <div className="mx-auto max-w-[1000px] px-5 text-center sm:px-8">
//         <p className="flex items-center justify-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
//           <span aria-hidden="true" className="h-px w-8 bg-copper-light" />
//           {eyebrow}
//           <span aria-hidden="true" className="h-px w-8 bg-copper-light" />
//         </p>
//         <h2 className="mt-4 font-display text-[36px] leading-tight text-green-deep sm:text-[44px]">
//           {heading}
//         </h2>
//         <p className="mx-auto mt-4 max-w-md font-sans text-[15px] leading-relaxed text-espresso/75">
//           {intro}
//         </p>

//         <div className="mt-14 grid grid-cols-1 divide-y divide-border-strong sm:grid-cols-3 sm:divide-x sm:divide-y-0">
//           {steps.map((step, i) => (
//             <div
//               key={step.id}
//               className="flex flex-col items-center px-4 py-8 first:pt-0 sm:py-0 sm:first:pl-0 sm:last:pr-0"
//             >
//               <span className="flex h-12 w-12 items-center justify-center rounded-full border border-copper/40 bg-green-bg font-display text-[18px] italic text-green-deep shadow-[0_4px_14px_rgba(50,30,24,0.08)]">
//                 {String(i + 1).padStart(2, "0")}
//               </span>
//               <h3 className="mt-4 font-display text-[24px] text-green-deep">
//                 {step.title}
//               </h3>
//               <p className="mt-3 max-w-[280px] font-sans text-[14px] leading-relaxed text-warm-gray">
//                 {step.description}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
"use client";

import { useState } from "react";
import {
  Droplets,
  Sparkles,
  Sun,
  Leaf,
  FlaskConical,
  HandHeart,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";
import { philosophyContent, philosophyPromises } from "@/data/home";

/** Swap these to match your ritual. Picked by step order (1, 2, 3). */
const STEP_ICONS: LucideIcon[] = [Droplets, Sparkles, Sun];

/** Swap these to match your promises. Picked by order. */
const PROMISE_ICONS: LucideIcon[] = [Leaf, FlaskConical, HandHeart, PackageCheck];

/**
 * Quiet cream section after two dark/photo-heavy ones.
 * Part 1: sticky statement on the left, connected icon stepper on the right.
 * Part 2: a promises row underneath, separated by thin dividers (no cards).
 */
export function ProductPhilosophy() {
  const { eyebrow, heading, intro, steps } = philosophyContent;
  const [active, setActive] = useState(0);
  const last = steps.length - 1;

  return (
    <section className="relative border-t border-copper/30 bg-cream py-24 lg:py-32">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        {/* Part 1: statement + stepper */}
        <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
              <span aria-hidden="true" className="h-px w-10 bg-copper-light" />
              {eyebrow}
            </p>
            <h2 className="mt-6 max-w-[14ch] font-display text-[40px] leading-[1.08] text-green-deep sm:text-[52px]">
              {heading}
            </h2>
            <p className="mt-6 max-w-[38ch] font-sans text-[16px] leading-[1.75] text-espresso/75">
              {intro}
            </p>
            <p
              className="mt-10 font-display text-[15px] italic text-warm-gray"
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
                <li key={step.id} className="relative pb-10 last:pb-0">
                  {i < last && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-7 top-16 w-px -translate-x-1/2 bg-border-strong"
                    >
                      <span
                        className={`absolute inset-x-0 top-0 block w-px bg-copper transition-[height] duration-700 ease-out motion-reduce:transition-none ${
                          isDone ? "h-full" : "h-0"
                        }`}
                      />
                    </span>
                  )}

                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isActive}
                    aria-controls={panelId}
                    onClick={() => setActive(i)}
                    className="group flex w-full items-center gap-6 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
                style={{
                  cursor:"pointer"
                }}
                >
                    <span
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-colors duration-500 motion-reduce:transition-none ${
                        isActive
                          ? "border-green-deep bg-green-deep text-cream shadow-[0_8px_22px_rgba(50,30,24,0.18)]"
                          : isDone
                            ? "border-copper bg-green-bg text-green-deep"
                            : "border-copper/40 bg-cream text-green-deep/60 group-hover:border-copper"
                      }`}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
                    </span>

                    <span className="flex items-baseline gap-3">
                      <span className="font-display text-[15px] italic text-copper">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-display text-[26px] leading-tight transition-colors duration-500 motion-reduce:transition-none sm:text-[30px] ${
                          isActive
                            ? "text-green-deep"
                            : "text-green-deep/50 group-hover:text-green-deep/80"
                        }`}
                      >
                        {step.title}
                      </span>
                    </span>
                  </button>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`grid pl-[80px] transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none ${
                      isActive
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[46ch] pt-4 font-sans text-[15px] leading-[1.8] text-warm-gray">
                        {step.description}
                      </p>
                      {i < last && (
                        <button
                          type="button"
                          onClick={() => setActive(i + 1)}
                          tabIndex={isActive ? 0 : -1}
                          className="mt-5 inline-flex items-center gap-2 border-b border-copper/60 pb-0.5 font-sans text-[13px] text-copper transition-colors hover:border-copper hover:text-green-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
                        style={{
                  cursor:"pointer"
                }}
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

        {/* Part 2: promises row */}
        <div className="mt-20 border-t border-copper/30 pt-14 lg:mt-28 lg:pt-16">
          <ul className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-border-strong">
            {philosophyPromises.map((promise, i) => {
              const Icon = PROMISE_ICONS[i % PROMISE_ICONS.length];
              return (
                <li key={promise.id} className="lg:px-8 lg:first:pl-0 lg:last:pr-0">
                  <Icon
                    className="h-7 w-7 text-copper"
                    strokeWidth={1.25}
                    aria-hidden="true"
                  />
                  <h3 className="mt-5 font-display text-[22px] leading-snug text-green-deep">
                    {promise.title}
                  </h3>
                  <p className="mt-2 max-w-[30ch] font-sans text-[14px] leading-[1.75] text-warm-gray">
                    {promise.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}