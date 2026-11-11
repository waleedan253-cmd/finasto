"use client";

import { motion } from "motion/react";

export function FooterHeadingLine({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      aria-hidden="true"
      className="mt-2 block h-[2px] w-10 origin-left rounded-full bg-gradient-to-r from-copper-light via-copper to-transparent"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    />
  );
}