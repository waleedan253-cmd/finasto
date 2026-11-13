"use client";

import type { ReactNode } from "react";
import { MotionConfig, motion } from "motion/react";

export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial={{ opacity: 0, y, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
          delay,
        }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}