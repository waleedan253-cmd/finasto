
"use client";

import { motion } from "motion/react";
import { Coffee } from "lucide-react";

const BARS = [20, 32, 46, 62, 80, 100];
const CYCLE = 8;          // total loop time (seconds)
const FILL_START = 0.04;  // when bar 1 starts
const SLOT = 0.12;        // time slot per bar (fraction of CYCLE)
const FILL_TIME = 0.10;   // fill time inside the slot

export function GrowthStrip() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 z-0 w-full overflow-hidden opacity-40 sm:w-3/5 sm:opacity-100 lg:w-1/2"
    >
      {/* Ambient liquid gold lighting */}
      <motion.div
        className="absolute -inset-[35%] z-0 blur-[75px] will-change-transform"
        style={{
          background: `
            radial-gradient(ellipse at 25% 45%, rgba(214,169,104,0.35), transparent 35%),
            radial-gradient(ellipse at 70% 55%, rgba(230,195,153,0.28), transparent 32%),
            radial-gradient(ellipse at 45% 80%, rgba(172,131,78,0.25), transparent 35%)
          `,
        }}
        animate={{
          x: ["-12%", "12%", "-8%"],
          y: ["-5%", "8%", "-5%"],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 16,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* Flowing metallic gold reflection */}
      <motion.div
        className="absolute -inset-x-1/2 inset-y-0 z-0 w-[200%] blur-3xl will-change-transform"
        style={{
          background: `
            linear-gradient(
              105deg,
              transparent 15%,
              rgba(172,131,78,0.05) 28%,
              rgba(230,195,153,0.25) 42%,
              rgba(245,197,66,0.16) 48%,
              rgba(193,165,118,0.24) 55%,
              transparent 72%
            )
          `,
        }}
        animate={{
          x: ["-30%", "30%", "-30%"],
        }}
        transition={{
          duration: 12,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* Moving golden light reflection */}
      <motion.div
        className="absolute -inset-y-1/2 left-0 z-0 w-full blur-[65px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(241,204,156,0.20), transparent 65%)",
        }}
        animate={{
          x: ["-15%", "20%", "-15%"],
          y: ["-10%", "15%", "-10%"],
          opacity: [0.4, 0.9, 0.4],
        }}
        transition={{
          duration: 10,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* Subtle lighting overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-l from-transparent via-[#031807]/10 to-[#031807]/30" />

      {/* Sequential growth bars */}
      <div className="relative z-10 flex h-full items-end justify-center gap-3 px-6 pb-8 pt-8 sm:gap-4 lg:gap-5">
        {BARS.map((h, i) => {
         const start = FILL_START + i * SLOT;
const finish = start + FILL_TIME;

          return (
            <span
              key={h}
              style={{ height: `${h}%` }}
              className="relative block w-6 shrink-0 overflow-hidden rounded-t-lg border border-[#E6C399]/50 bg-[#E6C399]/[0.08] sm:w-8 lg:w-11"
            >
<motion.span
  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#AC834E] via-[#F1CC9C] to-[#D4AF37]"
  initial={{ height: "0%" }}
  animate={{ height: ["0%", "0%", "100%", "100%", "0%"] }}
  transition={{
    duration: CYCLE,
    times: [0, start, finish, 0.92, 1],
    ease: "linear",
    repeat: Infinity,
  }}
/>
            </span>
          );
        })}

        {/* Coffee cup after the final bar */}
        <motion.span
          className="ml-2 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#E6C399]/60 bg-[#031807]/80 text-[#F1CC9C] shadow-[0_0_26px_rgba(241,204,156,0.5)] sm:h-[72px] sm:w-[72px] lg:h-20 lg:w-20"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 0, 1.15, 1, 1, 0],
            opacity: [0, 0, 1, 1, 1, 0],
          }}
          transition={{
            duration: CYCLE,
            times: [0, 0.80, 0.87, 0.91, 0.96, 1],
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <Coffee
            className="h-7 w-7 lg:h-9 lg:w-9"
            strokeWidth={1.5}
          />
        </motion.span>
      </div>

      {/* Golden ground line */}
      <span className="absolute inset-x-6 bottom-8 z-10 h-px bg-gradient-to-r from-transparent via-[#E6C399]/60 to-transparent" />
    </div>
  );
}
