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

"use client";

import { Col, Row } from "antd";
import { motion } from "motion/react";
import {
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

// Static class names, so Tailwind can see them at build time.
// hero  = the one strong card (copper), the number the affiliate acts on
// green = calm, positive information (light green tint)
// red   = refunds (light red tint)
const VARIANTS = {
  hero: {
    card: "border-copper/40 bg-gradient-to-br from-copper/10 to-white shadow-[0_10px_24px_-16px_rgba(201,128,63,0.6)]",
    bar: "from-copper-light to-copper",
    title: "text-[#8a5220]",
    value: "text-espresso",
    sub: "text-warm-gray",
    badge:
      "bg-gradient-to-br from-copper-light to-copper text-white shadow-[0_8px_18px_-8px_rgba(201,128,63,0.9)]",
    hover: "[@media(hover:hover)]:hover:shadow-[0_18px_34px_-18px_rgba(201,128,63,0.7)]",
  },
  green: {
    card: "border-green/20 bg-white shadow-[0_6px_16px_-12px_rgba(35,77,42,0.35)]",
    bar: "from-[#10260f] via-green to-[#1b4a24]",
    title: "text-green-deep",
    value: "text-espresso",
    sub: "text-warm-gray",
    badge:
      "bg-gradient-to-br from-[#10260f] via-[#1f5a3a] to-[#1b4a24] text-white shadow-[0_8px_18px_-8px_rgba(16,38,15,0.8)]",
    hover: "[@media(hover:hover)]:hover:shadow-[0_18px_34px_-18px_rgba(35,77,42,0.55)]",
  },
  red: {
    card: "border-red/20 bg-white shadow-[0_6px_16px_-12px_rgba(184,78,69,0.3)]",
    bar: "from-[#7d2a24] to-[#b84e45]",
    title: "text-red",
    value: "text-espresso",
    sub: "text-warm-gray",
    badge:
      "bg-gradient-to-br from-[#7d2a24] to-[#b84e45] text-white shadow-[0_8px_18px_-8px_rgba(125,42,36,0.8)]",
    hover: "[@media(hover:hover)]:hover:shadow-[0_18px_34px_-18px_rgba(184,78,69,0.5)]",
  },
} as const;

type StatProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  variant: keyof typeof VARIANTS;
  index: number;
  approx?: string | null; // "approx." text in the chosen currency
  hint?: string; // small extra line
};

function StatCard({
  title,
  value,
  icon: Icon,
  variant,
  index,
  approx,
  hint,
}: StatProps) {
  const v = VARIANTS[variant];
  // Shrink the number as it gets longer, and wrap instead of cutting it.
  const size =
    value.length > 16
      ? "text-[18px]"
      : value.length > 12
        ? "text-[22px]"
        : "text-[28px]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
            whileHover={{ y: -2 }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
      className={cn(
        "relative isolate flex h-full flex-col overflow-hidden rounded-2xl border p-4 pt-5 transition-shadow duration-300",
        v.card,
        v.hover,
      )}
    >
      {/* thin colour bar on top: the only accent each card needs */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r",
          v.bar,
        )}
      />

      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "font-sans text-[11px] font-semibold uppercase tracking-[0.14em]",
            v.title,
          )}
        >
          {title}
        </p>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            v.badge,
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </span>
      </div>

      <p
        className={cn(
          "mt-3 break-words font-display font-semibold leading-tight [font-variant-numeric:tabular-nums]",
          size,
          v.value,
        )}
      >
        {value}
      </p>

      {approx && (
        <p
          className={cn(
            "mt-1.5 break-words font-sans text-[12px] [font-variant-numeric:tabular-nums]",
            v.sub,
          )}
        >
          {approx}
        </p>
      )}
      {hint && (
        <p className={cn("mt-1.5 break-words font-sans text-[12px]", v.sub)}>
          {hint}
        </p>
      )}
    </motion.div>
  );
}

export function StatCards({
  counts,
  earnings,
  rates,
  currency,
}: {
  counts: DashboardCounts;
  earnings: DashboardEarnings;
  rates: RateMap;
  currency: string;
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
      {/* 2 per row on phones, 4 on desktop. */}
      <Row gutter={[12, 12]}>
        <Col xs={12} lg={6}>
          <StatCard
            index={0}
            title="Total orders"
            value={count.format(counts.totalOrders)}
            icon={ShoppingBag}
            variant="green"
            hint={`${count.format(counts.paidOrders)} paid`}
          />
        </Col>

        <Col xs={12} lg={6}>
          <StatCard
            index={1}
            title="Refunds"
            value={count.format(counts.refundedOrders)}
            icon={Undo2}
            variant="red"
            hint="Orders refunded"
          />
        </Col>

        <Col xs={12} lg={6}>
          <StatCard
            index={2}
            title="Available to request"
            value={usd(available)}
            icon={Wallet}
            variant="hero"
            approx={amount(available).approx}
            hint={
              hasAdjustment
                ? `After ${usd(Math.abs(earnings.refundAdjustmentsUsd))} in refund adjustments`
                : undefined
            }
          />
        </Col>

        <Col xs={12} lg={6}>
          <StatCard
            index={3}
            title="Paid out"
            value={usd(earnings.paidUsd)}
            icon={BadgeCheck}
            variant="green"
            approx={amount(earnings.paidUsd).approx}
          />
        </Col>
      </Row>

      <ul className="flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-border-strong bg-white px-4 py-2.5 font-sans text-[12px] text-warm-gray dark:border-border">
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-[#c9803f]"
          />
          Pending (in refund window)
          <span className="font-semibold text-espresso [font-variant-numeric:tabular-nums]">
            {usd(earnings.pendingUsd)}
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-[#7fb3cc]"
          />
          In review
          <span className="font-semibold text-espresso [font-variant-numeric:tabular-nums]">
            {usd(earnings.inReviewUsd)}
          </span>
        </li>
      </ul>
    </section>
  );
}