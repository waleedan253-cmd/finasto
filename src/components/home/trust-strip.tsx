// import { Check, Leaf, MapPin, Truck } from "lucide-react";
// import { trustItems } from "@/data/home";

// const icons = {
//   natural: Leaf,
//   origin: MapPin,
//   payment: Check,
//   delivery: Truck,
// } as const;

// /**
//  * Reads from `trustItems` (src/data/home.ts) — copy stays factual and
//  * editable there rather than hardcoded per-icon in this component.
//  */
// export function TrustStrip() {
//   return (
//     <section
//       aria-label="Why shop with Finasto"
//       className=" dark relative z-10 overflow-hidden bg-gradient-to-br from-green-deep via-green to-green-deep dark:from-green-deep dark:via-cream dark:to-cream-soft"
//     >
//       {/* Copper hairlines (top and bottom) */}
//       <span
//         aria-hidden="true"
//         className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper-light to-transparent"
//       />
//       <span
//         aria-hidden="true"
//         className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-copper/60 to-transparent"
//       />
//       {/* Soft copper glow */}
//       <div
//         aria-hidden="true"
//         className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(224,165,109,0.20),transparent_55%)]"
//       />

//       <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 gap-y-8 px-5 py-10 sm:grid-cols-2 sm:gap-x-8 sm:px-8 lg:grid-cols-4 lg:gap-0 lg:py-12">
//         {trustItems.map((item) => {
//           const Icon = icons[item.id as keyof typeof icons] ?? Check;
//           return (
//             <div
//               key={item.id}
//               className="group flex items-start gap-4 lg:border-l lg:border-[#ffffff]/15 lg:px-8 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0 dark:lg:border-copper/20"
//             >
//               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-copper-light bg-gradient-to-br from-[#fbf8f3] to-[#efe2cf] shadow-[0_4px_14px_rgba(0,0,0,0.22)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_20px_rgba(224,165,109,0.35)] dark:from-white dark:to-green-bg">
//                 <Icon
//                   className="h-[22px] w-[22px] text-copper transition-transform duration-300 group-hover:scale-110"
//                   strokeWidth={1.5}
//                   aria-hidden="true"
//                 />
//               </div>
//               <div>
//                 <p className="font-sans text-[15px] font-semibold leading-snug tracking-wide text-[#fbf8f3] dark:text-espresso">
//                   {item.title}
//                 </p>
//                 <p className="mt-1 font-sans text-[13px] leading-relaxed text-[#fbf8f3]/70 dark:text-copper">
//                   {item.description}
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// }
"use client";

import { Check, Leaf, MapPin, Truck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { trustItems } from "@/data/home";

const icons = {
  natural: Leaf,
  origin: MapPin,
  payment: Check,
  delivery: Truck,
} as const;

/**
 * Reads from `trustItems` (src/data/home.ts) — copy stays factual and
 * editable there rather than hardcoded per-icon in this component.
 */
export function TrustStrip() {
  const reduce = useReducedMotion();
  return (
    <section
      aria-label="Why shop with Finasto"
      className=" dark relative z-10 overflow-hidden bg-gradient-to-br from-green-deep via-green to-green-deep dark:from-green-deep dark:via-cream dark:to-cream-soft"
    >
      {/* Copper hairlines (top and bottom) */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper-light to-transparent"
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-copper/60 to-transparent"
      />
      {/* Soft copper glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(224,165,109,0.20),transparent_55%)]"
      />

      <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 gap-y-8 px-5 py-10 sm:grid-cols-2 sm:gap-x-8 sm:px-8 lg:grid-cols-4 lg:gap-0 lg:py-12">
        {trustItems.map((item, index) => {
          const Icon = icons[item.id as keyof typeof icons] ?? Check;
          return (
            <motion.div
              key={item.id}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="group flex items-start gap-4 lg:border-l lg:border-[#ffffff]/15 lg:px-8 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0 dark:lg:border-copper/20"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-copper-light bg-gradient-to-br from-[#fbf8f3] to-[#efe2cf] shadow-[0_4px_14px_rgba(0,0,0,0.22)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_20px_rgba(224,165,109,0.35)] dark:from-white dark:to-green-bg">
                <Icon
                  className="h-[22px] w-[22px] text-copper transition-transform duration-300 group-hover:scale-110"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="font-sans text-[15px] font-semibold leading-snug tracking-wide text-[#fbf8f3] dark:text-espresso">
                  {item.title}
                </p>
                <p className="mt-1 font-sans text-[13px] leading-relaxed text-[#fbf8f3]/70 dark:text-copper">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}