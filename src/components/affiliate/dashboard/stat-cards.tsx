// "use client";

// // The four headline numbers on the affiliate Dashboard, plus one smaller
// // line for the rest of the money pipeline (pending and in review).
// //
// // Same look as the earnings cards on the Payout Requests page: Ant
// // Design Card + Statistic, the same theme colors, white text. It is a
// // client component because the chosen currency comes from useMarket().
// //
// // Amounts stay USD. The currency chosen in the header menu is shown
// // beside them as "approx." (same rule as withApprox). Nothing is
// // calculated here except formatting.

// import { Col, Row, Typography } from "antd";
// import {
//   BadgeCheck,
//   ShoppingBag,
//   Undo2,
//   Wallet,
//   type LucideIcon,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import type {
//   DashboardCounts,
//   DashboardEarnings,
// } from "@/lib/affiliate/dashboard-queries";

// import { withApprox, type RateMap } from "@/lib/currency";

// const count = new Intl.NumberFormat("en-US");

// // Static class names, so Tailwind can see them at build time.
// const ACCENTS = {
//   green: "bg-green/10 text-green",
//   copper: "bg-copper/10 text-copper",
//   red: "bg-red/10 text-red",
//   gray: "bg-espresso/5 text-warm-gray",
// } as const;

// type StatProps = {
//   title: string;
//   value: string;
//   icon: LucideIcon;
//   accent: keyof typeof ACCENTS;
//   approx?: string | null; // "approx." text in the chosen currency
//   hint?: string; // small extra line
// };

// function StatCard({
//   title,
//   value,
//   icon: Icon,
//   accent,
//   approx,
//   hint,
// }: StatProps) {
//   return (
//     <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-strong bg-white p-4 shadow-[0_1px_2px_rgba(50,30,24,0.06),0_6px_16px_rgba(50,30,24,0.05)] transition-shadow duration-200 hover:shadow-[0_2px_4px_rgba(50,30,24,0.08),0_10px_24px_rgba(50,30,24,0.08)] dark:border-border dark:shadow-none">
//       <span
//         aria-hidden
//         className="absolute inset-x-0 top-0 h-[2px] bg-copper/70 dark:hidden"
//       />
//       <div className="flex items-start justify-between gap-2">
//         <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-warm-gray">
//           {title}
//         </p>
//         <span
//           className={cn(
//             "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
//             ACCENTS[accent],
//           )}
//         >
//           <Icon className="h-4 w-4" strokeWidth={1.7} />
//         </span>
//       </div>

//       <p className="mt-3 font-display text-[28px] leading-none tabular-nums text-espresso">
//         {value}
//       </p>

//       {approx && (
//         <p className="mt-1.5 font-sans text-[12px] text-warm-gray">{approx}</p>
//       )}
//       {hint && (
//         <p className="mt-1.5 font-sans text-[12px] text-warm-gray">{hint}</p>
//       )}
//     </div>
//   );
// }

// export function StatCards({
//   counts,
//   earnings,
//   rates,
//   currency,
// }: {
//   counts: DashboardCounts;
//   earnings: DashboardEarnings;
//   rates: RateMap;
//   currency: string;
// }) {
//   // The currency chosen in the header menu. Amounts stay USD; the chosen
//   // currency is shown beside them as "approx.".
//   // Amounts stay USD; the affiliate's locked currency is shown as "approx.".
//   const amount = (n: number) => withApprox(n, "USD", currency, rates);
//   const usd = (n: number) => amount(n).original;

//   // If refund adjustments push the net below zero, show $0 rather than
//   // a negative "available" amount that would confuse the affiliate.
//   const available = Math.max(earnings.availableUsd, 0);
//   const hasAdjustment = earnings.refundAdjustmentsUsd < 0;

//   return (
//     <section aria-label="Summary" style={{ display: "grid", gap: 12 }}>
//       {/* 2 per row on phones, 4 on desktop. */}
//       <Row gutter={[12, 12]}>
//         <Col xs={12} lg={6}>
//           <StatCard
//             title="Total orders"
//             value={count.format(counts.totalOrders)}
//             icon={ShoppingBag}
//             accent="green"
//             hint={`${count.format(counts.paidOrders)} paid`}
//           />
//         </Col>

//         <Col xs={12} lg={6}>
//           <StatCard
//             title="Refunds"
//             value={count.format(counts.refundedOrders)}
//             icon={Undo2}
//             accent="red"
//             hint="Orders refunded"
//           />
//         </Col>

//         <Col xs={12} lg={6} className="hero-col">
//           <StatCard
//             title="Available to request"
//             value={usd(available)}
//             icon={Wallet}
//             accent="copper"
//             approx={amount(available).approx}
//             hint={
//               hasAdjustment
//                 ? `After ${usd(Math.abs(earnings.refundAdjustmentsUsd))} in refund adjustments`
//                 : undefined
//             }
//           />
//         </Col>

//         <Col xs={12} lg={6}>
//           <StatCard
//             title="Paid out"
//             value={usd(earnings.paidUsd)}
//             icon={BadgeCheck}
//             accent="green"
//             approx={amount(earnings.paidUsd).approx}
//           />
//         </Col>
//       </Row>

//       <Typography.Text type="secondary">
//         {usd(earnings.pendingUsd)} pending (still in the refund window) and{" "}
//         {usd(earnings.inReviewUsd)} in review.
//       </Typography.Text>
//     </section>
//   );
// }

// "use client";

// import { Col, Row } from "antd";
// import { motion } from "motion/react";
// import {
//   BadgeCheck,
//   ShoppingBag,
//   Undo2,
//   Wallet,
//   type LucideIcon,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import type {
//   DashboardCounts,
//   DashboardEarnings,
// } from "@/lib/affiliate/dashboard-queries";

// import { withApprox, type RateMap } from "@/lib/currency";

// const EASE = [0.22, 1, 0.36, 1] as const;

// const count = new Intl.NumberFormat("en-US");

// // Static class names, so Tailwind can see them at build time.
// // hero  = the one strong card (copper), the number the affiliate acts on
// // green = calm, positive information (light green tint)
// // red   = refunds (light red tint)
// const VARIANTS = {
//   hero: {
//     card: "border-copper/40 bg-gradient-to-br from-copper/10 to-white shadow-[0_10px_24px_-16px_rgba(201,128,63,0.6)]",
//     bar: "from-copper-light to-copper",
//     title: "text-[#8a5220]",
//     value: "text-espresso",
//     sub: "text-warm-gray",
//     badge:
//       "bg-gradient-to-br from-copper-light to-copper text-white shadow-[0_8px_18px_-8px_rgba(201,128,63,0.9)]",
//     hover: "[@media(hover:hover)]:hover:shadow-[0_18px_34px_-18px_rgba(201,128,63,0.7)]",
//   },
//   green: {
//     card: "border-green/20 bg-white shadow-[0_6px_16px_-12px_rgba(35,77,42,0.35)]",
//     bar: "from-[#10260f] via-green to-[#1b4a24]",
//     title: "text-green-deep",
//     value: "text-espresso",
//     sub: "text-warm-gray",
//     badge:
//       "bg-gradient-to-br from-[#10260f] via-[#1f5a3a] to-[#1b4a24] text-white shadow-[0_8px_18px_-8px_rgba(16,38,15,0.8)]",
//     hover: "[@media(hover:hover)]:hover:shadow-[0_18px_34px_-18px_rgba(35,77,42,0.55)]",
//   },
//   red: {
//     card: "border-red/20 bg-white shadow-[0_6px_16px_-12px_rgba(184,78,69,0.3)]",
//     bar: "from-[#7d2a24] to-[#b84e45]",
//     title: "text-red",
//     value: "text-espresso",
//     sub: "text-warm-gray",
//     badge:
//       "bg-gradient-to-br from-[#7d2a24] to-[#b84e45] text-white shadow-[0_8px_18px_-8px_rgba(125,42,36,0.8)]",
//     hover: "[@media(hover:hover)]:hover:shadow-[0_18px_34px_-18px_rgba(184,78,69,0.5)]",
//   },
// } as const;

// type StatProps = {
//   title: string;
//   value: string;
//   icon: LucideIcon;
//   variant: keyof typeof VARIANTS;
//   index: number;
//   approx?: string | null; // "approx." text in the chosen currency
//   hint?: string; // small extra line
// };

// function StatCard({
//   title,
//   value,
//   icon: Icon,
//   variant,
//   index,
//   approx,
//   hint,
// }: StatProps) {
//   const v = VARIANTS[variant];
//   // Shrink the number as it gets longer, and wrap instead of cutting it.
//   const size =
//     value.length > 16
//       ? "text-[18px]"
//       : value.length > 12
//         ? "text-[22px]"
//         : "text-[28px]";

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 22 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true, margin: "-30px" }}
//             whileHover={{ y: -2 }}
//       transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
//       className={cn(
//         "relative isolate flex h-full flex-col overflow-hidden rounded-2xl border p-4 pt-5 transition-shadow duration-300",
//         v.card,
//         v.hover,
//       )}
//     >
//       {/* thin colour bar on top: the only accent each card needs */}
//       <span
//         aria-hidden
//         className={cn(
//           "absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r",
//           v.bar,
//         )}
//       />

//       <div className="flex items-start justify-between gap-2">
//         <p
//           className={cn(
//             "font-sans text-[11px] font-semibold uppercase tracking-[0.14em]",
//             v.title,
//           )}
//         >
//           {title}
//         </p>
//         <span
//           className={cn(
//             "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
//             v.badge,
//           )}
//         >
//           <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
//         </span>
//       </div>

//       <p
//         className={cn(
//           "mt-3 break-words font-display font-semibold leading-tight [font-variant-numeric:tabular-nums]",
//           size,
//           v.value,
//         )}
//       >
//         {value}
//       </p>

//       {approx && (
//         <p
//           className={cn(
//             "mt-1.5 break-words font-sans text-[12px] [font-variant-numeric:tabular-nums]",
//             v.sub,
//           )}
//         >
//           {approx}
//         </p>
//       )}
//       {hint && (
//         <p className={cn("mt-1.5 break-words font-sans text-[12px]", v.sub)}>
//           {hint}
//         </p>
//       )}
//     </motion.div>
//   );
// }

// export function StatCards({
//   counts,
//   earnings,
//   rates,
//   currency,
// }: {
//   counts: DashboardCounts;
//   earnings: DashboardEarnings;
//   rates: RateMap;
//   currency: string;
// }) {
//   // Amounts stay USD; the affiliate's locked currency is shown as "approx.".
//   const amount = (n: number) => withApprox(n, "USD", currency, rates);
//   const usd = (n: number) => amount(n).original;

//   // If refund adjustments push the net below zero, show $0 rather than
//   // a negative "available" amount that would confuse the affiliate.
//   const available = Math.max(earnings.availableUsd, 0);
//   const hasAdjustment = earnings.refundAdjustmentsUsd < 0;

//   return (
//     <section aria-label="Summary" className="grid gap-3">
//       {/* 2 per row on phones, 4 on desktop. */}
//       <Row gutter={[12, 12]}>
//         <Col xs={12} lg={6}>
//           <StatCard
//             index={0}
//             title="Total orders"
//             value={count.format(counts.totalOrders)}
//             icon={ShoppingBag}
//             variant="green"
//             hint={`${count.format(counts.paidOrders)} paid`}
//           />
//         </Col>

//         <Col xs={12} lg={6}>
//           <StatCard
//             index={1}
//             title="Refunds"
//             value={count.format(counts.refundedOrders)}
//             icon={Undo2}
//             variant="red"
//             hint="Orders refunded"
//           />
//         </Col>

//         <Col xs={12} lg={6}>
//           <StatCard
//             index={2}
//             title="Available to request"
//             value={usd(available)}
//             icon={Wallet}
//             variant="hero"
//             approx={amount(available).approx}
//             hint={
//               hasAdjustment
//                 ? `After ${usd(Math.abs(earnings.refundAdjustmentsUsd))} in refund adjustments`
//                 : undefined
//             }
//           />
//         </Col>

//         <Col xs={12} lg={6}>
//           <StatCard
//             index={3}
//             title="Paid out"
//             value={usd(earnings.paidUsd)}
//             icon={BadgeCheck}
//             variant="green"
//             approx={amount(earnings.paidUsd).approx}
//           />
//         </Col>
//       </Row>

//       <ul className="flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-border-strong bg-white px-4 py-2.5 font-sans text-[12px] text-warm-gray dark:border-border">
//         <li className="flex items-center gap-2">
//           <span
//             aria-hidden="true"
//             className="h-2 w-2 rounded-full bg-[#c9803f]"
//           />
//           Pending (in refund window)
//           <span className="font-semibold text-espresso [font-variant-numeric:tabular-nums]">
//             {usd(earnings.pendingUsd)}
//           </span>
//         </li>
//         <li className="flex items-center gap-2">
//           <span
//             aria-hidden="true"
//             className="h-2 w-2 rounded-full bg-[#7fb3cc]"
//           />
//           In review
//           <span className="font-semibold text-espresso [font-variant-numeric:tabular-nums]">
//             {usd(earnings.inReviewUsd)}
//           </span>
//         </li>
//       </ul>
//     </section>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ShoppingBag,
  Undo2,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DashboardCounts,
  DashboardEarnings,
} from "@/lib/affiliate/dashboard-queries";

import { withApprox, type RateMap } from "@/lib/currency";

const EASE = [0.22, 1, 0.36, 1] as const;

const count = new Intl.NumberFormat("en-US");

/* ------------------------------------------------------------------ */
/* Count-up: the number rises from 0 once (about 0.8s).                 */
/* The state holds the raw number, so formatting stays in one place.    */
/* With "reduce motion" on, the final value shows immediately.          */
/* ------------------------------------------------------------------ */

function CountUp({
  value,
  format,
}: {
  value: number;
  format: (n: number) => string;
}) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce || value === 0) {
      setShown(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.8,
      ease: EASE,
      onUpdate: setShown,
    });
    return () => controls.stop();
  }, [value, reduce]);

  return <>{format(shown)}</>;
}

// Shrink the number as it gets longer, so big amounts never overflow.
function sizeFor(text: string, sizes: [string, string, string]) {
  return text.length > 16 ? sizes[0] : text.length > 12 ? sizes[1] : sizes[2];
}

/* ------------------------------------------------------------------ */
/* Quiet card: Total orders, Refunds, Paid out                          */
/* One look for all three: ivory card, one thin gold line, green chip.  */
/* ------------------------------------------------------------------ */

// One muted accent per card. Full class names (not built strings) so
// Tailwind can see them.
const TONE = {
  orders: {
    card: "border-[#D6E4EA] bg-[#F5F9FB]",
    line: "from-[#2E6F86] via-[#6FA8BD] to-[#2E6F86]",
    chip: "bg-[#1F4E5F] text-[#CFE8F1]",
  },
  refunds: {
    card: "border-[#EBD3CC] bg-[#FCF6F4]",
    line: "from-[#B5523F] via-[#E0907F] to-[#B5523F]",
    chip: "bg-[#8A3B2E] text-[#F7D3CA]",
  },
  paid: {
    card: "border-[#CFE6DA] bg-[#F4FAF7]",
    line: "from-[#2F9E6B] via-[#7CCBA1] to-[#2F9E6B]",
    chip: "bg-[#14573A] text-[#C6EFD7]",
  },
} as const;

type QuietProps = {
  title: string;
  icon: LucideIcon;
  value: number;
  format: (n: number) => string;
  tone: keyof typeof TONE;
  index: number;
  approx?: string | null;
  hint?: string;
};

function QuietCard({
  title,
  icon: Icon,
  value,
  format,
  tone,
  index,
  approx,
  hint,
}: QuietProps) {
  const t = TONE[tone];
  const reduce = useReducedMotion();
  const size = sizeFor(format(value), [
    "text-[18px]",
    "text-[22px]",
    "text-[28px]",
  ]);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
      className={cn(
        "relative isolate flex h-full flex-col overflow-hidden rounded-2xl border p-4 pt-5 shadow-[0_6px_16px_-12px_rgba(3,24,7,0.3)] transition-shadow duration-300 [@media(hover:hover)]:hover:shadow-[0_16px_30px_-18px_rgba(172,131,78,0.55)]",
        t.card,
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r", t.line)}
      />

      <div className="flex items-start justify-between gap-2">
        <p className="font-sans text-[13px] font-medium text-aff-muted">
          {title}
        </p>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            t.chip,
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </span>
      </div>

      <p
        className={cn(
          "mt-3 break-words font-display font-semibold leading-tight text-aff-green-900 [font-variant-numeric:tabular-nums]",
          size,
        )}
      >
        <CountUp value={value} format={format} />
      </p>

      {approx && (
        <p className="mt-1.5 break-words font-sans text-[12px] text-aff-muted [font-variant-numeric:tabular-nums]">
          {approx}
        </p>
      )}
      {hint && (
        <p className="mt-1.5 break-words font-sans text-[12px] text-aff-muted">
          {hint}
        </p>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero card: Available to request, with Pending and In review inside   */
/* The only dark card in the row, so the eye goes to the money first.   */
/* ------------------------------------------------------------------ */

type HeroProps = {
  value: number;
  format: (n: number) => string;
  approx?: string | null;
  hint?: string;
   pending: string;
  inReview: string;
  canRequestPayout: boolean;
  payoutHref: string;
};

function HeroCard({
  value,
  format,
  approx,
  hint,
  pending,
  inReview,
  canRequestPayout,
  payoutHref,
}: HeroProps) {
  const reduce = useReducedMotion();
  const size = sizeFor(format(value), [
    "text-[26px] sm:text-[30px]",
    "text-[32px] sm:text-[38px]",
    "text-[36px] sm:text-[46px]",
  ]);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className="rounded-2xl bg-gradient-to-br from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 p-[1.5px] shadow-[0_18px_44px_-22px_rgba(172,131,78,0.6)]"
    >
      <div className="relative isolate overflow-hidden rounded-[15px] bg-gradient-to-br from-aff-green-950 via-aff-green-900 to-aff-green-800 p-5 sm:p-6">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-aff-gold-300 to-transparent"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 -z-10 h-44 w-44 rounded-full bg-aff-gold-400/15 blur-3xl"
        />

        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-aff-gold-400/40 bg-aff-green-950/60 text-aff-gold-300">
            <Wallet className="h-5 w-5" strokeWidth={1.7} />
          </span>
          <p className="font-sans text-[14px] font-medium text-aff-cream-50/80">
            Available to request
          </p>
        </div>

        <p
          className={cn(
            "mt-4 break-words font-display font-semibold leading-tight text-aff-gold-300 [font-variant-numeric:tabular-nums]",
            size,
          )}
        >
          <CountUp value={value} format={format} />
        </p>

        {approx && (
          <p className="mt-1.5 break-words font-sans text-[13px] text-aff-cream-50/70 [font-variant-numeric:tabular-nums]">
            {approx}
          </p>
        )}
        {hint && (
          <p className="mt-1.5 break-words font-sans text-[12px] text-aff-cream-50/70">
            {hint}
          </p>
        )}

        {canRequestPayout && value > 0 && (
          <Link
            href={payoutHref}
            className="group mt-5 inline-flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-gradient-to-r from-aff-gold-600 via-aff-gold-300 to-aff-gold-500 px-6 font-sans text-[14px] font-semibold text-aff-green-950 shadow-[0_10px_26px_-12px_rgba(241,204,156,0.7)] transition-all duration-200 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aff-gold-300 sm:w-fit [@media(hover:hover)]:hover:-translate-y-0.5"
          >
            Request payout
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={2}
              aria-hidden="true"
            />
          </Link>
        )}

        <dl className="mt-5 grid grid-cols-1 gap-3 border-t border-aff-gold-400/20 pt-4 font-sans text-[13px] sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-aff-cream-50/70">
              <span
                aria-hidden
                className="h-2 w-2 rounded-full bg-aff-gold-300"
              />
              Pending (refund window)
            </dt>
            <dd className="font-semibold text-aff-cream-50 [font-variant-numeric:tabular-nums]">
              {pending}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-aff-cream-50/70">
              <span
                aria-hidden
                className="h-2 w-2 rounded-full bg-aff-cream-50/60"
              />
              In review
            </dt>
            <dd className="font-semibold text-aff-cream-50 [font-variant-numeric:tabular-nums]">
              {inReview}
            </dd>
          </div>
        </dl>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                              */
/* ------------------------------------------------------------------ */

export function StatCards({
  counts,
  earnings,
  rates,
  currency,
  canRequestPayout,
  // Change this if your Payout Requests page lives at a different path.
  payoutHref = "/affiliate/payouts",
}: {
  counts: DashboardCounts;
  earnings: DashboardEarnings;
  rates: RateMap;
  currency: string;
  canRequestPayout: boolean;
  payoutHref?: string;
}) {
  // Amounts stay USD; the affiliate's locked currency is shown as "approx.".
  const amount = (n: number) => withApprox(n, "USD", currency, rates);
  const usd = (n: number) => amount(n).original;

  // If refund adjustments push the net below zero, show $0 rather than
  // a negative "available" amount that would confuse the affiliate.
  const available = Math.max(earnings.availableUsd, 0);
  const hasAdjustment = earnings.refundAdjustmentsUsd < 0;

  return (
    <section aria-label="Summary" className="grid gap-3">
      <HeroCard
        value={available}
        format={usd}
        approx={amount(available).approx}
        hint={
          hasAdjustment
            ? `After ${usd(Math.abs(earnings.refundAdjustmentsUsd))} in refund adjustments`
            : undefined
        }
        pending={usd(earnings.pendingUsd)}
        inReview={usd(earnings.inReviewUsd)}
        canRequestPayout={canRequestPayout}
        payoutHref={payoutHref}
      />

      {/* 1 per row on small phones, 3 across from 640px. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuietCard
          index={1}
          tone="orders"
          title="Total orders"
          icon={ShoppingBag}
          value={counts.totalOrders}
          format={(n) => count.format(Math.round(n))}
          hint={`${count.format(counts.paidOrders)} paid`}
        />
        <QuietCard
          index={2}
          tone="refunds"
          title="Refunds"
          icon={Undo2}
          value={counts.refundedOrders}
          format={(n) => count.format(Math.round(n))}
          hint="Orders refunded"
        />
        <QuietCard
          index={3}
          tone="paid"
          title="Paid out"
          icon={BadgeCheck}
          value={earnings.paidUsd}
          format={usd}
          approx={amount(earnings.paidUsd).approx}
        />
      </div>
    </section>
  );
}