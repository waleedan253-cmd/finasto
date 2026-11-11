"use client";

/**
 * Shared Motion (motion.dev) building blocks for the FINASTO policy pages.
 * Install once:  npm i motion
 *
 * Put this file at: src/components/shop/motion.tsx
 *
 * Every component respects the visitor's "reduce motion" setting.
 */

import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  MotionConfig,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Variants,
} from "motion/react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

function Cfg({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/* -------------------------------------------------------------------------- */
/*  Staggered groups (cards, steps, checklists)                                */
/* -------------------------------------------------------------------------- */

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const itemShow = {
  opacity: 1,
  y: 0,
  transition: { duration: 0.7, ease: EASE },
};

const liftItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: itemShow,
  hover: {
    y: -4,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

const flatItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: itemShow,
  hover: {},
};

export function StaggerList({
  as = "ul",
  className,
  children,
  "aria-label": ariaLabel,
}: {
  as?: "ul" | "ol";
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  const Tag = as === "ol" ? motion.ol : motion.ul;
  return (
    <Cfg>
      <Tag
        className={className}
        aria-label={ariaLabel}
        variants={listVariants}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
      >
        {children}
      </Tag>
    </Cfg>
  );
}

/** A list item that fades in with its siblings. `lift` raises it on hover. */
export function StaggerItem({
  className,
  children,
  lift = true,
}: {
  className?: string;
  children: ReactNode;
  lift?: boolean;
}) {
  return (
    <motion.li
      className={className}
      variants={lift ? liftItem : flatItem}
      whileHover="hover"
    >
      {children}
    </motion.li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Icon badge: pops in, then tilts and grows when its card is hovered         */
/* -------------------------------------------------------------------------- */

const iconVariants: Variants = {
  hidden: { scale: 0.6, opacity: 0, rotate: -12 },
  show: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 260, damping: 16, delay: 0.15 },
  },
  hover: {
    scale: 1.1,
    rotate: -6,
    transition: { type: "spring", stiffness: 320, damping: 14 },
  },
};

export function IconBadge({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.span variants={iconVariants} className={className}>
      {children}
    </motion.span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reveal: one soft entrance for a panel, card or callout                     */
/* -------------------------------------------------------------------------- */

export function Reveal({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: ReactNode;
  delay?: number;
}) {
  const variants: Variants = {
    hidden: { opacity: 0, y: 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: EASE, delay },
    },
  };
  return (
    <Cfg>
      <motion.div
        className={className}
        variants={variants}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
      >
        {children}
      </motion.div>
    </Cfg>
  );
}

/* -------------------------------------------------------------------------- */
/*  DrawLine: a timeline connector that draws itself                           */
/* -------------------------------------------------------------------------- */

export function DrawLine({
  axis = "y",
  delay = 0,
  duration = 0.9,
  className = "",
}: {
  axis?: "x" | "y";
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const vertical = axis === "y";
  return (
    <Cfg>
      <motion.span
        aria-hidden="true"
        className={`${className} ${vertical ? "origin-top" : "origin-left"}`}
        initial={vertical ? { scaleY: 0 } : { scaleX: 0 }}
        whileInView={vertical ? { scaleY: 1 } : { scaleX: 1 }}
        viewport={VIEWPORT}
        transition={{ duration, delay, ease: EASE }}
      />
    </Cfg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Press: buttons that lift on hover and sink on press                        */
/* -------------------------------------------------------------------------- */

export function Press({
  className = "inline-block",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Cfg>
      <motion.div
        className={className}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
      >
        {children}
      </motion.div>
    </Cfg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Glow: slow breathing light behind dark green panels                        */
/* -------------------------------------------------------------------------- */

export function Glow({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className={className}
      animate={reduce ? undefined : { scale: [1, 1.18, 1], opacity: [0.75, 1, 0.75] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  CountUp / CountRange: numbers that count up when they scroll into view     */
/* -------------------------------------------------------------------------- */

export function CountUp({ to, duration = 1.4 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  // The invisible copy reserves the final width so nothing shifts while counting.
  return (
    <span ref={ref} className="relative inline-block tabular-nums" aria-label={String(to)}>
      <span aria-hidden="true" className="invisible">
        {to}
      </span>
      <span aria-hidden="true" className="absolute left-0 top-0">
        {value}
      </span>
    </span>
  );
}

export function CountRange({ from, to }: { from: number; to: number }) {
  return (
    <>
      <CountUp to={from} />–<CountUp to={to} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  RouteArc: Indonesia to your door. Line draws, parcel dot travels.          */
/* -------------------------------------------------------------------------- */

const ROUTE_PATH = "M60 105 C 200 -10, 400 -10, 540 105";
const P = [
  [60, 105],
  [200, -10],
  [400, -10],
  [540, 105],
];

function bezier(t: number, axis: 0 | 1) {
  const u = 1 - t;
  return (
    u * u * u * P[0][axis] +
    3 * u * u * t * P[1][axis] +
    3 * u * t * t * P[2][axis] +
    t * t * t * P[3][axis]
  );
}

export function RouteArc() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const show = inView || !!reduce;

  const t = useMotionValue(0);
  const cx = useTransform(t, (v) => bezier(v, 0));
  const cy = useTransform(t, (v) => bezier(v, 1));
  const dotOpacity = useTransform(t, [0, 0.06, 0.94, 1], [0, 1, 1, 0]);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(t, 1, {
      duration: 4.5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 1.5,
      delay: 2.2,
    });
    return () => controls.stop();
  }, [inView, reduce, t]);

  const pinStyle = { transformBox: "fill-box", transformOrigin: "center" } as const;

  return (
    <svg
      ref={ref}
      viewBox="0 0 600 140"
      role="img"
      aria-label="Shipping route from Indonesia to destinations worldwide"
      className="mx-auto h-auto w-full max-w-xl"
    >
      {/* Faint dotted track */}
      <path
        d={ROUTE_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="2 8"
        strokeLinecap="round"
        className="text-copper-light/40"
      />
      {/* Copper line that draws itself */}
      <motion.path
        d={ROUTE_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-copper-light"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: show ? 1 : 0 }}
        transition={{ duration: 1.8, ease: EASE, delay: 0.3 }}
      />

      {/* Origin */}
      {!reduce && (
        <motion.circle
          cx="60"
          cy="105"
          fill="currentColor"
          className="text-copper-light"
          initial={{ r: 6, opacity: 0.5 }}
          animate={{ r: [6, 18], opacity: [0.5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <circle cx="60" cy="105" r="6" className="fill-copper-light" />

      {/* Destination lands once the line arrives */}
      <motion.g
        style={pinStyle}
        initial={{ scale: reduce ? 1 : 0 }}
        animate={{ scale: show ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: 1.9 }}
      >
        <circle cx="540" cy="105" r="11" className="fill-cream/20" />
        <circle cx="540" cy="105" r="6" className="fill-cream" />
      </motion.g>

      {/* Parcel */}
      <motion.circle r={5} cx={cx} cy={cy} style={{ opacity: dotOpacity }} className="fill-cream" />

      <motion.text
        x="60"
        y="132"
        textAnchor="middle"
        className="fill-white/80 font-sans text-[13px]"
        initial={{ opacity: reduce ? 1 : 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Indonesia
      </motion.text>
      <motion.text
        x="540"
        y="132"
        textAnchor="middle"
        className="fill-white/80 font-sans text-[13px]"
        initial={{ opacity: reduce ? 1 : 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 1.9 }}
      >
        Your door
      </motion.text>
    </svg>
  );
}