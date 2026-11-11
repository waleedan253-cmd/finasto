// // import type { ReactNode } from "react";
// // import Link from "next/link";
// // import { ChevronRight } from "lucide-react";

// // const PAGES = [
// //   { href: "/shipping", label: "Shipping & Delivery" },
// //   { href: "/returns", label: "Returns & Refunds" },

// //   { href: "/privacy-policy", label: "Privacy Policy" },
// //   { href: "/terms", label: "Terms of Service" },
// // ] as const;

// // // Shared layout for the store's information pages (Shipping, Returns, FAQ).
// // // Server component, no state. Uses theme tokens only, so it works in
// // // light and dark mode.

// // export function PolicyPage({
// //   path,
// //   eyebrow,
// //   title,
// //   intro,
// //   updated,
// //   children,
// // }: {
// //   path: (typeof PAGES)[number]["href"];
// //   eyebrow: string;
// //   title: string;
// //   intro: string;
// //   updated?: string;
// //   children: ReactNode;
// // }) {
// //   return (
// //     <div className="bg-pattern mx-auto max-w-[1000px] px-5 py-8 sm:px-8 lg:py-12">
// //       <nav aria-label="Breadcrumb">
// //         <ol className="flex flex-wrap items-center gap-1.5 font-sans text-[13px] text-warm-gray">
// //           <li>
// //             <Link
// //               href="/"
// //               className="transition-colors hover:text-copper hover:underline hover:underline-offset-4"
// //             >
// //               Home
// //             </Link>
// //           </li>
// //           <li aria-hidden="true">
// //             <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.6} />
// //           </li>
// //           <li aria-current="page" className="font-medium text-espresso">
// //             {title}
// //           </li>
// //         </ol>
// //       </nav>

// //       <ul
// //         aria-label="Help pages"
// //         className="mt-4 flex flex-wrap gap-2"
// //       >
// //         {PAGES.map((page) => {
// //           const active = page.href === path;
// //           return (
// //             <li key={page.href}>
// //               <Link
// //                 href={page.href}
// //                 aria-current={active ? "page" : undefined}
// //                 className={
// //                   active
// //                     ? "inline-flex h-9 items-center rounded-full border border-copper/40 bg-copper/10 px-4 font-sans text-[13px] font-medium text-espresso"
// //                     : "inline-flex h-9 items-center rounded-full border border-border-strong bg-white px-4 font-sans text-[13px] text-warm-gray transition-colors hover:border-copper hover:text-copper dark:border-border"
// //                 }
// //               >
// //                 {page.label}
// //               </Link>
// //             </li>
// //           );
// //         })}
// //       </ul>

// //       <header className="mt-10 max-w-2xl">
// //         <p className="flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
// //           {eyebrow}
// //           <span aria-hidden="true" className="h-px w-10 bg-copper-light" />
// //         </p>
// //         {/* <h1 className="mt-3 font-display text-[40px] leading-tight text-espresso md:text-[56px]">
// //           {title}
// //         </h1> */}
// //         <p className="mt-4 font-sans text-[15px] leading-relaxed text-warm-gray md:text-[16px]">
// //           {intro}
// //         </p>
// //         {updated && (
// //           <p className="mt-3 font-sans text-[12px] text-warm-gray">
// //             Last updated: {updated}
// //           </p>
// //         )}
// //       </header>

// //       <div className="mt-10 flex flex-col gap-10">{children}</div>
// //     </div>
// //   );
// // }

// // export function PolicySection({
// //   id,
// //   title,
// //   children,
// // }: {
// //   id: string;
// //   title: string;
// //   children: ReactNode;
// // }) {
// //   return (
// //     <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
// //       <h2
// //         id={`${id}-heading`}
// //         className="font-display text-[26px] leading-tight text-espresso"
// //       >
// //         {title}
// //       </h2>
// //       <div className="mt-3 flex flex-col gap-3 font-sans text-[15px] leading-relaxed text-warm-gray">
// //         {children}
// //       </div>
// //     </section>
// //   );
// // }
// import type { ReactNode } from "react";
// import Link from "next/link";
// import { CalendarDays, ChevronRight } from "lucide-react";

// const PAGES = [
//   { href: "/shipping", label: "Shipping & Delivery" },
//   { href: "/returns", label: "Returns & Refunds" },

//   { href: "/privacy-policy", label: "Privacy Policy" },
//   { href: "/terms", label: "Terms of Service" },
// ] as const;

// // Shared layout for the store's information pages (Shipping, Returns, FAQ).
// // Server component, no state. Green theme: a green banner header, green
// // active tab and green section headings. The pattern sits on the outer
// // wrapper, so it covers the full page width.

// export function PolicyPage({
//   path,
//   eyebrow,
//   title,
//   intro,
//   updated,
//   children,
// }: {
//   path: (typeof PAGES)[number]["href"];
//   eyebrow: string;
//   title: string;
//   intro: string;
//   updated?: string;
//   children: ReactNode;
// }) {
//   return (
//     <div className="bg-pattern">
//       <div className="mx-auto max-w-[1000px] px-5 py-8 sm:px-8 lg:py-12">
//         {/* The page needs one H1 for SEO and screen readers. */}
//         <h1 className="sr-only">{title}</h1>

//         <nav aria-label="Breadcrumb">
//           <ol className="flex flex-wrap items-center gap-1.5 font-sans text-[13px] text-warm-gray">
//             <li>
//               <Link
//                 href="/"
//                 className="transition-colors hover:text-green hover:underline hover:underline-offset-4"
//               >
//                 Home
//               </Link>
//             </li>
//             <li aria-hidden="true">
//               <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.6} />
//             </li>
//             <li aria-current="page" className="font-medium text-green-deep">
//               {title}
//             </li>
//           </ol>
//         </nav>

//         <ul aria-label="Help pages" className="mt-4 flex flex-wrap gap-2">
//           {PAGES.map((page) => {
//             const active = page.href === path;
//             return (
//               <li key={page.href}>
//                 <Link
//                   href={page.href}
//                   aria-current={active ? "page" : undefined}
//                   className={
//                     active
//                       ? "inline-flex h-9 items-center rounded-full border border-green-deep bg-green-deep px-4 font-sans text-[13px] font-medium text-white shadow-[0_8px_20px_-10px_rgba(35,77,42,0.7)]"
//                       : "inline-flex h-9 items-center rounded-full border border-border-strong bg-white px-4 font-sans text-[13px] text-warm-gray transition-colors hover:border-green hover:bg-green-bg hover:text-green-deep dark:border-border"
//                   }
//                 >
//                   {page.label}
//                 </Link>
//               </li>
//             );
//           })}
//         </ul>

//         {/* Green banner header */}
//         <header className="relative mt-8 overflow-hidden rounded-3xl border border-copper/30 bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24] px-6 py-9 text-white shadow-[0_30px_60px_-30px_rgba(16,38,15,0.85)] sm:px-10 sm:py-12">
//           <div
//             aria-hidden="true"
//             className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-copper/30 blur-[60px]"
//           />
//           <div
//             aria-hidden="true"
//             className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]"
//           />

//           <div className="relative max-w-2xl">
//             <p className="flex items-center gap-3 font-sans text-[12px] font-medium uppercase tracking-[0.22em] text-copper-light">
//               <span
//                 aria-hidden="true"
//                 className="h-px w-10 bg-copper-light/70"
//               />
//               {eyebrow}
//             </p>
//             <span
//               aria-hidden="true"
//               className="mt-4 block h-[2px] w-20 rounded-full bg-gradient-to-r from-copper-light via-copper to-transparent"
//             />
//             <p className="mt-5 font-sans text-[15px] leading-relaxed text-white/85 md:text-[17px]">
//               {intro}
//             </p>
//             {updated && (
//               <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-copper-light/40 bg-white/10 px-3.5 py-1.5 font-sans text-[12px] text-white/85">
//                 <CalendarDays
//                   className="h-3.5 w-3.5 text-copper-light"
//                   strokeWidth={1.7}
//                   aria-hidden="true"
//                 />
//                 Last updated: {updated}
//               </p>
//             )}
//           </div>
//         </header>

//         <div className="mt-10 flex flex-col gap-10">{children}</div>
//       </div>
//     </div>
//   );
// }

// export function PolicySection({
//   id,
//   title,
//   children,
// }: {
//   id: string;
//   title: string;
//   children: ReactNode;
// }) {
//   return (
//     <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
//       <h2
//         id={`${id}-heading`}
//         className="flex items-center gap-3 font-display text-[26px] font-semibold leading-tight text-green-deep sm:text-[30px]"
//       >
//         <span
//           aria-hidden="true"
//           className="h-2.5 w-2.5 shrink-0 rotate-45 bg-gradient-to-br from-green to-green-deep"
//         />
//         {title}
//       </h2>
//       <span
//         aria-hidden="true"
//         className="mt-3 block h-[2px] w-14 rounded-full bg-gradient-to-r from-green to-transparent"
//       />
//       <div className="mt-4 flex flex-col gap-3 font-sans text-[15px] leading-relaxed text-warm-gray">
//         {children}
//       </div>
//     </section>
//   );
// }


"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { CalendarDays, ChevronRight } from "lucide-react";

const PAGES = [
  { href: "/shipping", label: "Shipping & Delivery" },
  { href: "/returns", label: "Returns & Refunds" },

  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

// Shared layout for the store's information pages (Shipping, Returns, FAQ).
// Green theme with motion. Only transform and opacity are animated (cheap on
// phones). Animations always run, ignoring the device "reduce motion" setting.
// This is a client component, but server pages can still pass it children.

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function PolicyPage({
  path,
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  path: (typeof PAGES)[number]["href"];
  eyebrow: string;
  title: string;
  intro: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-pattern">
      <div className="mx-auto max-w-[1000px] px-5 py-8 sm:px-8 lg:py-12">
        {/* The page needs one H1 for SEO and screen readers. */}
        <h1 className="sr-only">{title}</h1>

        <motion.nav
          aria-label="Breadcrumb"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <ol className="flex flex-wrap items-center gap-1.5 font-sans text-[13px] text-warm-gray">
            <li>
              <Link
                href="/"
                className="transition-colors hover:text-green hover:underline hover:underline-offset-4"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.6} />
            </li>
            <li aria-current="page" className="font-medium text-green-deep">
              {title}
            </li>
          </ol>
        </motion.nav>

        <motion.ul
          aria-label="Help pages"
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mt-4 flex flex-wrap gap-2"
        >
          {PAGES.map((page) => {
            const active = page.href === path;
            return (
              <motion.li
                key={page.href}
                variants={rise}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
              >
                <Link
                  href={page.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "inline-flex h-9 items-center rounded-full border border-green-deep bg-green-deep px-4 font-sans text-[13px] font-medium text-white shadow-[0_8px_20px_-10px_rgba(35,77,42,0.7)]"
                      : "inline-flex h-9 items-center rounded-full border border-border-strong bg-white px-4 font-sans text-[13px] text-warm-gray transition-colors hover:border-green hover:bg-green-bg hover:text-green-deep dark:border-border"
                  }
                >
                  {page.label}
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>

        {/* Green banner header */}
        <motion.header
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="relative mt-8 overflow-hidden rounded-3xl border border-copper/30 bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24] px-6 py-9 text-white shadow-[0_30px_60px_-30px_rgba(16,38,15,0.85)] sm:px-10 sm:py-12"
        >
          {/* static glow (a moving blur is expensive on phones) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-copper/30 blur-[50px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]"
          />
          {/* shine sweep: moved with a transform, so it runs on the GPU */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent will-change-transform"
            initial={{ x: "-150%" }}
            animate={{ x: "450%" }}
            transition={{
              duration: 2.4,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 5,
              delay: 1.2,
            }}
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="relative max-w-2xl"
          >
            <motion.p
              variants={rise}
              className="flex items-center gap-3 font-sans text-[12px] font-medium uppercase tracking-[0.22em] text-copper-light"
            >
              <motion.span
                aria-hidden="true"
                className="h-px w-10 origin-left bg-copper-light/70"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
              />
              {eyebrow}
            </motion.p>
            <motion.span
              variants={rise}
              aria-hidden="true"
              className="mt-4 block h-[2px] w-20 rounded-full bg-gradient-to-r from-copper-light via-copper to-transparent"
            />
            <motion.p
              variants={rise}
              className="mt-5 font-sans text-[15px] leading-relaxed text-white/85 md:text-[17px]"
            >
              {intro}
            </motion.p>
            {updated && (
              <motion.p
                variants={rise}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-copper-light/40 bg-white/10 px-3.5 py-1.5 font-sans text-[12px] text-white/85"
              >
                <CalendarDays
                  className="h-3.5 w-3.5 text-copper-light"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                Last updated: {updated}
              </motion.p>
            )}
          </motion.div>
        </motion.header>

        <div className="mt-10 flex flex-col gap-10">{children}</div>
      </div>
    </div>
  );
}

export function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <h2
        id={`${id}-heading`}
        className="flex items-center gap-3 font-display text-[26px] font-semibold leading-tight text-green-deep sm:text-[30px]"
      >
        <motion.span
          aria-hidden="true"
          className="h-2.5 w-2.5 shrink-0 bg-gradient-to-br from-green to-green-deep"
          initial={{ scale: 0, rotate: 0 }}
          whileInView={{ scale: 1, rotate: 45 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}
        />
        {title}
      </h2>
      <motion.span
        aria-hidden="true"
        className="mt-3 block h-[2px] w-14 origin-left rounded-full bg-gradient-to-r from-green to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      />
      <motion.div
        className="mt-4 flex flex-col gap-3 font-sans text-[15px] leading-relaxed text-warm-gray"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.25 }}
      >
        {children}
      </motion.div>
    </motion.section>
  );
}

export function AnimatedCard({
  as = "div",
  className = "",
  delay = 0,
  children,
}: {
  as?: "div" | "li";
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  const Tag = as === "li" ? motion.li : motion.div;
  return (
    <Tag
      className={`transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgba(35,77,42,0.55)] ${className}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

export function GlowIcon({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className="relative inline-flex">
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-copper-light/70 blur-md will-change-transform"
        animate={{ opacity: [0.3, 0.9, 0.3], scale: [1, 1.4, 1] }}
        transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
      />
      <span
        className={`relative flex items-center justify-center rounded-full ${className}`}
      >
        {children}
      </span>
    </span>
  );
}