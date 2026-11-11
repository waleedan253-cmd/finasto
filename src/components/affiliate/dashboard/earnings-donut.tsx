// "use client";

// import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
// import type { DashboardEarnings } from "@/lib/affiliate/dashboard-queries";
// import { withApprox, type RateMap } from "@/lib/currency";

// export function EarningsDonut({
//   earnings,
//   rates,
//   currency,
// }: {
//   earnings: DashboardEarnings;
//   rates: RateMap;
//   currency: string;
// }) {
//   const usd = (n: number) => withApprox(n, "USD", currency, rates).original;

//   // Negative values (refund adjustments) are shown as 0 in the donut.
//   const slices = [
//     {
//       name: "Available",
//       value: Math.max(earnings.availableUsd, 0),
//       color: "var(--color-copper)",
//     },
//     {
//       name: "Pending",
//       value: Math.max(earnings.pendingUsd, 0),
//       color: "var(--color-copper-light)",
//     },
//     {
//       name: "In review",
//       value: Math.max(earnings.inReviewUsd, 0),
//       color: "#6F9DB5",
//     },
//     {
//       name: "Paid out",
//       value: Math.max(earnings.paidUsd, 0),
//       color: "var(--color-green)",
//     },
//   ];

//   const total = slices.reduce((sum, s) => sum + s.value, 0);
//    const totalApprox = withApprox(total, "USD", currency, rates).approx;

//   const totalText = usd(total);
//   // Shrink the font as the amount gets longer, and wrap instead of cutting it.
//   const totalSize =
//     totalText.length > 18
//       ? "text-[20px]"
//       : totalText.length > 13
//         ? "text-[24px]"
//         : "text-[28px]";
//   const longTotal = totalText.length > 16;
//   const paidOut = slices.find((s) => s.name === "Paid out")?.value ?? 0;
//   const paidPct = total > 0 ? Math.round((paidOut / total) * 100) : 0;

//   return (
//     <div className="finasto-card flex flex-col p-4 sm:p-5">
//       <p className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-green-deep">
//         <span
//           aria-hidden
//           className="h-2 w-2 rotate-45 bg-gradient-to-br from-green to-green-deep"
//         />
//                Earnings split
//       </p>

//       {total > 0 && (
//         <div className="mt-2">
//           <p
//             className={`break-words font-display font-semibold leading-tight text-green-deep [font-variant-numeric:tabular-nums] ${totalSize}`}
//           >
//             {totalText}
//           </p>
//           {totalApprox && (
//             <p className="mt-0.5 break-words font-sans text-[12px] text-warm-gray [font-variant-numeric:tabular-nums]">
//               {totalApprox}
//             </p>
//           )}
//           <p className="mt-1 font-sans text-[12px] text-warm-gray">
//             Total across all statuses
//           </p>
//         </div>
//       )}

//       {total === 0 ? (
//         <div className="flex flex-col items-center gap-3 py-8">
//           <span
//             aria-hidden
//             className="h-20 w-20 rounded-full border-[6px] border-dashed border-green/30"
//           />
//           <p className="text-center font-sans text-[13px] text-warm-gray">
//             No earnings yet. Your split will appear here after your first
//             commission.
//           </p>
//         </div>
//       ) : (
//         <>
//           <div
//             className="relative mx-auto mt-3 h-[160px] w-full"
//             role="img"
//             aria-label={`Earnings split, total ${usd(total)}`}
//           >
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={slices}
//                   dataKey="value"
//                   nameKey="name"
//                   innerRadius="68%"
//                   outerRadius="92%"
//                   paddingAngle={
//                     slices.filter((s) => s.value > 0).length > 1 ? 3 : 0
//                   }
//                   startAngle={90}
//                   endAngle={-270}
//                   animationDuration={900}
//                   animationEasing="ease-out"
//                   stroke="none"
//                 >
//                   {slices.map((s) => (
//                     <Cell key={s.name} fill={s.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   formatter={(value, name) => [
//                     usd(Number(value)),
//                     String(name),
//                   ]}
//                   contentStyle={{
//                     backgroundColor: "var(--color-white)",
//                     border: "1px solid var(--color-border-strong)",
//                     borderRadius: 12,
//                     fontSize: 12,
//                   }}
//                   itemStyle={{ color: "var(--color-espresso)" }}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//             <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
//               <span className="font-display text-[30px] font-semibold leading-none text-green-deep">
//                 {paidPct}%
//               </span>
//               <span className="mt-1 font-sans text-[11px] text-warm-gray">
//                 paid out
//               </span>
//             </div>
//           </div>

//           <ul
//             className={`mt-4 grid grid-cols-1 gap-2 ${
//               longTotal ? "" : "min-[420px]:grid-cols-2"
//             }`}
//           >
//             {slices.map((s) => {
//               const pct = Math.round((s.value / total) * 100);
//               return (
//                 <li
//                   key={s.name}
//                   className="rounded-xl border border-border bg-green-bg/60 px-3 py-2 font-sans"
//                 >
//                   <div className="flex items-center gap-2 text-[12px]">
//                     <span
//                       aria-hidden
//                       className="h-2.5 w-2.5 shrink-0 rounded-full"
//                       style={{ backgroundColor: s.color }}
//                     />
//                     <span className="truncate text-warm-gray">{s.name}</span>
//                     <span className="ml-auto text-[11px] font-medium text-green-deep">
//                       {pct}%
//                     </span>
//                   </div>
//                   <p className="mt-1 break-words text-[14px] font-semibold leading-snug text-espresso [font-variant-numeric:tabular-nums]">
//                     {usd(s.value)}
//                   </p>
//                 </li>
//               );
//             })}
//           </ul>
//         </>
//       )}
//     </div>
//   );
// }

"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "motion/react";
import { PieChart as PieIcon } from "lucide-react";
import type { DashboardEarnings } from "@/lib/affiliate/dashboard-queries";
import { withApprox, type RateMap } from "@/lib/currency";

const EASE = [0.22, 1, 0.36, 1] as const;

export function EarningsDonut({
  earnings,
  rates,
  currency,
}: {
  earnings: DashboardEarnings;
  rates: RateMap;
  currency: string;
}) {
  const usd = (n: number) => withApprox(n, "USD", currency, rates).original;

  // The card is always dark green (in light and dark mode), so the slice
  // colors are fixed, bright values that stay readable on it.
  // Negative values (refund adjustments) are shown as 0 in the donut.
  const slices = [
    {
      name: "Available",
      value: Math.max(earnings.availableUsd, 0),
      color: "#e0a56d",
    },
    {
      name: "Pending",
      value: Math.max(earnings.pendingUsd, 0),
      color: "#f3e3c1",
    },
    {
      name: "In review",
      value: Math.max(earnings.inReviewUsd, 0),
      color: "#7fb3cc",
    },
    {
      name: "Paid out",
      value: Math.max(earnings.paidUsd, 0),
      color: "#8fcb78",
    },
  ];

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const totalApprox = withApprox(total, "USD", currency, rates).approx;

  const totalText = usd(total);
  // Shrink the font as the amount gets longer, and wrap instead of cutting it.
  const totalSize =
    totalText.length > 18
      ? "text-[20px]"
      : totalText.length > 13
        ? "text-[24px]"
        : "text-[28px]";
  const longTotal = totalText.length > 16;
  const paidOut = slices.find((s) => s.name === "Paid out")?.value ?? 0;
  const paidPct = total > 0 ? Math.round((paidOut / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      // whileHover={{ y: -3 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative isolate flex flex-col overflow-hidden rounded-2xl border border-copper/30 bg-gradient-to-br from-[#10260f] via-[#1f5a3a] to-[#1b4a24] p-4 text-white shadow-[0_24px_50px_-26px_rgba(16,38,15,0.85)] sm:p-5"
    >
      {/* dots */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"
      />
      {/* static copper glow in the corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-14 -top-14 -z-10 h-44 w-44 rounded-full bg-copper/30 blur-[50px]"
      />
      {/* thin copper line on top, matching the other cards' accent bars */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-copper via-copper-light to-copper"
      />

      <p className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-copper-light">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-copper-light ring-1 ring-copper/40">
          <PieIcon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        </span>
        Earnings split
      </p>

      {total > 0 && (
        <div className="mt-2">
          <p
            className={`break-words font-display font-semibold leading-tight text-white [font-variant-numeric:tabular-nums] ${totalSize}`}
          >
            {totalText}
          </p>
          {totalApprox && (
            <p className="mt-0.5 break-words font-sans text-[12px] text-white/70 [font-variant-numeric:tabular-nums]">
              {totalApprox}
            </p>
          )}
          <p className="mt-1 font-sans text-[12px] text-white/60">
            Total across all statuses
          </p>
        </div>
      )}

      {total === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <span
            aria-hidden
            className="h-20 w-20 rounded-full border-[6px] border-dashed border-copper-light/30"
          />
          <p className="text-center font-sans text-[13px] text-white/70">
            No earnings yet. Your split will appear here after your first
            commission.
          </p>
        </div>
      ) : (
        <>
          <div
            className="relative mx-auto mt-3 h-[160px] w-full"
            role="img"
            aria-label={`Earnings split, total ${totalText}, ${paidPct}% paid out`}
          >
            {/* soft static glow behind the donut */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(224,165,109,0.22)_0%,rgba(224,165,109,0.06)_45%,transparent_70%)]"
            />

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="68%"
                  outerRadius="92%"
                  paddingAngle={
                    slices.filter((s) => s.value > 0).length > 1 ? 3 : 0
                  }
                  startAngle={90}
                  endAngle={-270}
                  animationDuration={900}
                  animationEasing="ease-out"
                  stroke="none"
                >
                  {slices.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    usd(Number(value)),
                    String(name),
                  ]}
                  contentStyle={{
                    backgroundColor: "#10260f",
                    border: "1px solid rgba(224,165,109,0.45)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "#ffffff",
                  }}
                  itemStyle={{ color: "#ffffff" }}
                  labelStyle={{ color: "#e0a56d" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* The hole only holds a short value ("100%" at most), so it can
                never be crossed by a long amount. */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-[30px] font-semibold leading-none text-white [font-variant-numeric:tabular-nums]">
                {paidPct}%
              </span>
              <span className="mt-1.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.12em] text-copper-light">
                paid out
              </span>
            </div>
          </div>

          <ul
            className={`mt-4 grid grid-cols-1 gap-2 ${
              longTotal ? "" : "min-[420px]:grid-cols-2"
            }`}
          >
            {slices.map((s, i) => {
              const pct = Math.round((s.value / total) * 100);
              return (
                <motion.li
                  key={s.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.3 + i * 0.08 }}
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 font-sans transition-colors [@media(hover:hover)]:hover:border-copper/50 [@media(hover:hover)]:hover:bg-white/10"
                >
                  <div className="flex items-center gap-2 text-[12px]">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/10"
                      style={{ backgroundColor: s.color, color: s.color }}
                    />
                    <span className="truncate text-white/70">{s.name}</span>
                    <span className="ml-auto text-[11px] font-medium text-copper-light">
                      {pct}%
                    </span>
                  </div>
                  <p className="mt-1 break-words text-[14px] font-semibold leading-snug text-white [font-variant-numeric:tabular-nums]">
                    {usd(s.value)}
                  </p>
                </motion.li>
              );
            })}
          </ul>
        </>
      )}
    </motion.div>
  );
}