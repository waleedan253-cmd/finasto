// "use client";

// import { useEffect, useState, type ReactNode } from "react";
// import Link from "next/link";
// import { motion } from "motion/react";
// import { IconBadge } from "@/components/ui/icon-badge";
// import { InteractiveCard } from "@/components/ui/interactive-card";
// import { ShineCta } from "@/components/ui/shine-cta";
// import {
//   ArrowRight,
//   Eye,
//   Globe2,
//   Heart,
//   Layers,
//   ShieldCheck,
//   Sprout,
//   Target,
// } from "lucide-react";
// import {
//   BRAND_NAME,
//   brandContent as c,
//   brandNav,
// } from "@/lib/brand/brand-content";
// import Image from "next/image";

// const EASE = [0.22, 1, 0.36, 1] as const;

// const PRINCIPLE_ICONS = [Sprout, Layers, Heart, ShieldCheck] as const;

// // ───────── small building blocks ─────────

// function Reveal({
//   children,
//   delay = 0,
//   className,
// }: {
//   children: ReactNode;
//   delay?: number;
//   className?: string;
// }) {
//   const reduce = false; // always animate, ignoring the device setting
//   return (
//     <motion.div
//       className={className}
//       initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 24 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true, margin: "-80px" }}
//       transition={{ duration: 0.7, delay, ease: EASE }}
//     >
//       {children}
//     </motion.div>
//   );
// }

// function Eyebrow({
//   children,
//   light = false,
// }: {
//   children: ReactNode;
//   light?: boolean;
// }) {
//   return (
//     <p
//       className={`inline-flex items-center gap-3 font-sans text-[12px] font-medium uppercase tracking-[0.22em] ${
//         light ? "text-copper-light" : "text-copper"
//       }`}
//     >
//       <span
//         aria-hidden="true"
//         className={`h-px w-8 ${light ? "bg-copper-light/60" : "bg-copper/60"}`}
//       />
//       {children}
//     </p>
//   );
// }

// function Badge({
//   children,
//   dark = false,
// }: {
//   children: ReactNode;
//   dark?: boolean;
// }) {
//   const reduce = false; // always animate, ignoring the device setting
//   return (
//     <div className="relative inline-flex h-16 w-16 items-center justify-center">
//       <motion.span
//         aria-hidden="true"
//         className="absolute inset-0 rounded-full border border-dashed border-copper/60"
//         animate={reduce ? undefined : { rotate: 360 }}
//         transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
//       />
//       <motion.span
//         aria-hidden="true"
//         className="absolute inset-1 rounded-full bg-copper/20"
//         animate={reduce ? undefined : { scale: [1, 1.22, 1], opacity: [0.6, 0, 0.6] }}
//         transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <span
//         className={`relative flex h-12 w-12 items-center justify-center rounded-full shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] ${
//           dark
//             ? "bg-gradient-to-br from-cream to-copper-light/70"
//             : "bg-gradient-to-br from-white to-cream"
//         }`}
//       >
//         {children}
//       </span>
//     </div>
//   );
// }

// function SectionNav() {
//   const [active, setActive] = useState<string>(brandNav[0].id);

//   useEffect(() => {
//     const els = brandNav
//       .map((n) => document.getElementById(n.id))
//       .filter((el): el is HTMLElement => !!el);
//     const io = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((e) => {
//           if (e.isIntersecting) setActive(e.target.id);
//         });
//       },
//       { rootMargin: "-45% 0px -50% 0px" },
//     );
//     els.forEach((el) => io.observe(el));
//     return () => io.disconnect();
//   }, []);

//   return (
//     <nav
//       aria-label="Brand sections"
//       className="sticky top-0 z-30 border-b border-border bg-cream-soft/85 backdrop-blur-xl"
//     >
//       <ul className="mx-auto flex max-w-[1100px] gap-1 overflow-x-auto px-4 py-2.5 sm:justify-center sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
//         {brandNav.map(({ id, label }) => {
//           const isActive = active === id;
//           return (
//             <li key={id} className="shrink-0">
//               <a
//                 href={`#${id}`}
//                 aria-current={isActive ? "true" : undefined}
//                 className={`relative block rounded-full px-4 py-2 font-sans text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/50 ${
//                   isActive
//                     ? "bg-green-deep font-medium text-white"
//                     : "text-espresso/70 hover:bg-green-bg hover:text-green-deep"
//                 }`}
//               >
//                 {label}
//               </a>
//             </li>
//           );
//         })}
//       </ul>
//     </nav>
//   );
// }

// // ───────── page ─────────

// export function BrandPage() {
//   const reduce = false; // always animate, ignoring the device setting

//   return (
//     <main className="flex-1 ">
//       <style>{`html{scroll-behavior:smooth}`}</style>

//       {/* ───────── HERO ───────── */}
//       <section className="relative isolate overflow-hidden bg-gradient-to-br from-green-deep via-[#17391f] to-espresso-deep px-5 pb-12 pt-10 text-center sm:px-8 sm:pb-16 sm:pt-14">
     
//                 <Image
//                   src="/brand/brand hero.jpeg"
//                   alt=""
//                   fill
//                   priority
//                   sizes="100vw"
//                   className="-z-20 object-cover"
//                 />
//                 <div
//                   aria-hidden="true"
//                   className="absolute inset-0 -z-10 bg-gradient-to-br from-green/20 via-[#17391f]/80 to-espresso-deep/90"
//                 />
//                 <div
//                   aria-hidden="true"
//                   className="pointer-events-none absolute -bottom-40 right-[-8%] -z-10 h-[460px] w-[460px] rounded-full bg-copper/15 blur-[130px]"
//                 />
        
        

//         <motion.div
//           initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.9, ease: EASE }}
//           className="mx-auto max-w-[820px]"
//         >
//          <p className="inline-flex items-center gap-2 rounded-full border border-copper bg-copper/20 px-5 py-2 font-sans text-[12px] font-bold uppercase tracking-[0.24em] text-copper-light shadow-[0_0_20px_rgba(184,115,51,0.35)]">
//   <Globe2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
//   {c.hero.eyebrow}
// </p>
//           <h1 className="mt-5 bg-gradient-to-b from-white via-cream to-copper-light bg-clip-text font-display text-[44px] leading-[0.95] tracking-tight text-transparent sm:text-[64px] md:text-[80px]">
//           {BRAND_NAME}
//           </h1>
//           <span
//             aria-hidden="true"
//             className="mx-auto mt-5 block h-[2px] w-16 rounded-full bg-gradient-to-r from-copper-light to-copper"
//           />
//           <p className="mx-auto mt-5 max-w-[480px] font-sans text-[16px] leading-relaxed text-white/70 md:text-[18px]">
//             {c.hero.tagline}
//           </p>
//         </motion.div>
//       </section>

//       <SectionNav />

//       {/* ───────── BRAND (replaces "About Us") ───────── */}
//       <section
//         id="brand"
//         className="scroll-mt-16 px-5 py-20 sm:px-8 sm:py-28"
//       >
//         <div className="mx-auto grid max-w-[13000px] items-start gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
//           <Reveal className="mx-auto w-full max-w-[550px] lg:sticky lg:top-28">
//   <div className="relative aspect-[4/5] w-full  overflow-hidden rounded-3xl border border-copper/30 shadow-[0_30px_50px_-15px_rgba(35,77,42,0.35)]">
//     <Image
//       src="/brand/brands.jpeg"
//       alt="Golden morning light over a Finasto coffee and tea sanctuary"
//       fill
//       sizes="(min-width: 1024px) 400px, 100vw"
//       className="object-cover object-center"
//     />
//     <div
//       aria-hidden="true"
//       className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20"
//     />
//   </div>
// </Reveal>

//           <div className="flex flex-col gap-6">
//             <Reveal>
//               <Eyebrow>{c.intro.eyebrow}</Eyebrow>
//               <h2 className="mt-4 font-display text-[34px] leading-[1.1] text-green-deep sm:text-[44px] md:text-[52px]">
//                 {c.intro.title}
//               </h2>
//             </Reveal>

//             {c.intro.paragraphs.map((p, i) => (
//               <div key={i} className="flex flex-col gap-6">
//                 <Reveal>
//                   <p
//                     className={
//                       i === 0
//                         ? "font-sans text-[18px] leading-[1.75] text-espresso md:text-[20px]"
//                         : "font-sans text-[16px] leading-[1.85] text-warm-gray md:text-[17px]"
//                     }
//                   >
//                     {p}
//                   </p>
//                 </Reveal>
//                 {i === 1 && (
//                   <Reveal>
//                     <blockquote className="border-l-2 border-copper py-1 pl-6 font-display text-[26px] italic leading-snug text-green-deep md:text-[32px]">
//                       {c.intro.pullQuote}
//                     </blockquote>
//                   </Reveal>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ───────── OUR STORY ───────── */}
//       <section
//         id="story"
//         className="scroll-mt-16  px-5 py-20 sm:px-8 sm:py-28"
//       >
//         <div className="mx-auto max-w-[1100px]">
//           <div className="grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
//             <Reveal className="lg:sticky lg:top-28">
//               <Eyebrow>{c.story.eyebrow}</Eyebrow>
//               <h2 className="mt-4 font-display text-[34px] leading-[1.1] text-green-deep sm:text-[44px]">
//                 {c.story.title}
//               </h2>
//               <div className="mt-8 inline-flex items-end gap-4 rounded-2xl border border-copper/75  px-6 py-5 shadow-[0_18px_40px_-24px_rgba(35,77,42,0.45)]">
//                 <span className="font-display text-[64px] leading-none text-">
//                   {c.story.stat.value}
//                 </span>
//                 <span className="pb-2 font-sans text-[12px] font-medium uppercase tracking-[0.18em] text-green">
//                   {c.story.stat.label}
//                 </span>
//               </div>
//             </Reveal>

//             <ol className="relative flex flex-col gap-10 border-l border-copper/30 pl-8 sm:pl-10">
//               {c.story.paragraphs.map((p, i) => (
//                 <li key={i} className="relative">
//                   <span
//                     aria-hidden="true"
//                     className="absolute -left-[calc(2rem+14.5px)] top-0 flex h-7 w-7 items-center justify-center rounded-full border border-copper/50 bg-cream font-sans text-[11px] font-semibold text-copper sm:-left-[calc(2.5rem+14.5px)]"
//                   ><span className="relative flex h-2.5 w-2.5">
//   <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-copper opacity-75" />
//   <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-copper shadow-[0_0_8px_rgba(184,115,51,0.8)]" />
// </span>
//                   </span>
//                   <Reveal>
//                     <p className="font-sans text-[16px] leading-[1.85] text-espresso/80 md:text-[17px]">
//                       {p}
//                     </p>
//                   </Reveal>
//                 </li>
//               ))}
//             </ol>
//           </div>

//           <Reveal className="mt-20 text-center">
//             <span
//               aria-hidden="true"
//               className="mx-auto mb-8 block h-px w-24 bg-gradient-to-r from-transparent via-copper to-transparent"
//             />
           
//           </Reveal>
//         </div>
//       </section>

//       {/* ───────── VISION & MISSION ───────── */}
//             {/* ───────── VISION & MISSION ───────── */}
//       <section
//         id="vision-mission"
//         className="relative scroll-mt-16 overflow-hidden px-5 pb-20 pt-0 sm:px-8 sm:pb-28"
//       >
//         <div
//           aria-hidden="true"
//           className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_15%_20%,rgba(35,77,42,0.10),transparent_70%),radial-gradient(55%_45%_at_90%_80%,rgba(184,115,51,0.14),transparent_70%)]"
//         />

//         <div className="relative mx-auto grid max-w-[1100px] gap-6 md:grid-cols-2 md:gap-8">
//           {/* center diamond */}
//           <motion.div
//             aria-hidden="true"
//             className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gradient-to-br from-copper-light to-copper shadow-[0_0_24px_4px_rgba(184,115,51,0.55)] md:block"
//             animate={reduce ? undefined : { scale: [1, 1.35, 1] }}
//             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
//           />

//           {/* VISION */}
//           <Reveal>
//             <motion.article
//               whileHover={reduce ? undefined : { y: -8 }}
//               transition={{ type: "spring", stiffness: 220, damping: 20 }}
//               className="group relative h-full overflow-hidden rounded-[28px] bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24] p-8 text-white shadow-[0_40px_80px_-30px_rgba(16,38,15,0.85)] ring-1 ring-copper/30 sm:p-12"
//             >
//               <motion.div
//                 aria-hidden="true"
//                 className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-copper/35 blur-[80px]"
//                 animate={reduce ? undefined : { x: [0, -24, 0], y: [0, 18, 0] }}
//                 transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
//               />
//               <motion.div
//                 aria-hidden="true"
//                 className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-emerald-300/10 blur-[80px]"
//                 animate={reduce ? undefined : { x: [0, 20, 0], y: [0, -16, 0] }}
//                 transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
//               />
//               <div
//                 aria-hidden="true"
//                 className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]"
//               />
//               <span
//                 aria-hidden="true"
//                 className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-[1400ms] ease-out group-hover:left-[130%] group-hover:opacity-100"
//               />
//               <span
//                 aria-hidden="true"
//                 className="pointer-events-none absolute bottom-2 right-6 select-none font-display text-[120px] font-light leading-none text-white/[0.05] sm:text-[160px]"
//               >
//                 01
//               </span>

//               <Badge dark>
//                 <Eye className="h-6 w-6 text-green" strokeWidth={1.5} aria-hidden="true" />
//               </Badge>

//               <div className="relative mt-7">
//                 <Eyebrow light>{c.vision.eyebrow}</Eyebrow>
//                 <motion.span
//                   aria-hidden="true"
//                   className="mt-4 block h-[2px] w-24 origin-left bg-gradient-to-r from-copper-light via-copper to-transparent"
//                   initial={{ scaleX: reduce ? 1 : 0 }}
//                   whileInView={{ scaleX: 1 }}
//                   viewport={{ once: true }}
//                   transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
//                 />
//                 <p className="mt-5 font-sans text-[16px] leading-[1.9] text-white/85 md:text-[17px]">
//                   {c.vision.text}
//                 </p>
//               </div>
//             </motion.article>
//           </Reveal>

//           {/* MISSION */}
//           <Reveal delay={0.12}>
//             <motion.article
//               whileHover={reduce ? undefined : { y: -8 }}
//               transition={{ type: "spring", stiffness: 220, damping: 20 }}
//               className="group relative h-full overflow-hidden rounded-[28px] border border-copper/30 bg-gradient-to-br from-cream-soft via-white to-cream p-8 shadow-[0_40px_80px_-36px_rgba(50,30,24,0.45)] sm:p-12"
//             >
//               <motion.div
//                 aria-hidden="true"
//                 className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-green/20 blur-[80px]"
//                 animate={reduce ? undefined : { x: [0, -24, 0], y: [0, 18, 0] }}
//                 transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
//               />
//               <motion.div
//                 aria-hidden="true"
//                 className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-copper/20 blur-[80px]"
//                 animate={reduce ? undefined : { x: [0, 20, 0], y: [0, -16, 0] }}
//                 transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
//               />
//               <div
//                 aria-hidden="true"
//                 className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#6b4226_1px,transparent_1px)] [background-size:22px_22px]"
//               />
//               <span
//                 aria-hidden="true"
//                 className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-copper/15 to-transparent opacity-0 transition-all duration-[1400ms] ease-out group-hover:left-[130%] group-hover:opacity-100"
//               />
//               <span
//                 aria-hidden="true"
//                 className="pointer-events-none absolute bottom-2 right-6 select-none font-display text-[120px] font-light leading-none text-copper/[0.08] sm:text-[160px]"
//               >
//                 02
//               </span>
//               <span
//                 aria-hidden="true"
//                 className="pointer-events-none absolute left-0 top-0 h-16 w-16 rounded-tl-[28px] border-l-2 border-t-2 border-copper/60"
//               />

//               <Badge>
//                 <Target className="h-6 w-6 text-green-deep" strokeWidth={1.5} aria-hidden="true" />
//               </Badge>

//               <div className="relative mt-7">
//                 <Eyebrow>{c.mission.eyebrow}</Eyebrow>
//                 <motion.span
//                   aria-hidden="true"
//                   className="mt-4 block h-[2px] w-24 origin-left bg-gradient-to-r from-green via-copper to-transparent"
//                   initial={{ scaleX: reduce ? 1 : 0 }}
//                   whileInView={{ scaleX: 1 }}
//                   viewport={{ once: true }}
//                   transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
//                 />
//                 <p className="mt-5 font-sans text-[16px] leading-[1.9] text-espresso/80 md:text-[17px]">
//                   {c.mission.text}
//                 </p>
//               </div>
//             </motion.article>
//           </Reveal>
//         </div>
//       </section>

//       {/* ───────── QUALITY ───────── */}
//            {/* ───────── QUALITY ───────── */}
//       <section
//         id="quality"
//         className="group relative isolate scroll-mt-16 overflow-hidden bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24] px-5 py-20 text-white sm:px-8 sm:py-28"
//       >
//         {/* animated blobs */}
//         <motion.div
//           aria-hidden="true"
//           className="pointer-events-none absolute -right-16 -top-16 -z-10 h-72 w-72 rounded-full bg-copper/35 blur-[90px]"
//           animate={reduce ? undefined : { x: [0, -24, 0], y: [0, 18, 0] }}
//           transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
//         />
//         <motion.div
//           aria-hidden="true"
//           className="pointer-events-none absolute -bottom-24 -left-16 -z-10 h-64 w-64 rounded-full bg-emerald-300/10 blur-[90px]"
//           animate={reduce ? undefined : { x: [0, 20, 0], y: [0, -16, 0] }}
//           transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
//         />
//         {/* dots */}
//         <div
//           aria-hidden="true"
//           className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]"
//         />
//         {/* shine sweep */}
//         <span
//           aria-hidden="true"
//           className="pointer-events-none absolute inset-y-0 -left-1/2 -z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-[1400ms] ease-out group-hover:left-[130%] group-hover:opacity-100"
//         />
//         {/* big number */}
//         <span
//           aria-hidden="true"
//           className="pointer-events-none absolute bottom-2 right-6 -z-10 select-none font-display text-[120px] font-light leading-none text-white/[0.05] sm:text-[160px]"
//         >
//           03
//         </span>

//         <div className="mx-auto max-w-[1100px]">
//           <Reveal className="mx-auto max-w-[760px] text-center">
//             <Eyebrow light>{c.quality.eyebrow}</Eyebrow>
//             <motion.span
//               aria-hidden="true"
//               className="mx-auto mt-4 block h-[2px] w-24 origin-center bg-gradient-to-r from-transparent via-copper-light to-transparent"
//               initial={{ scaleX: reduce ? 1 : 0 }}
//               whileInView={{ scaleX: 1 }}
//               viewport={{ once: true }}
//               transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
//             />
//             <h2 className="mt-5 font-display text-[32px] leading-[1.12] text-white sm:text-[44px]">
//               {c.quality.title}
//             </h2>
//             <p className="mt-6 font-sans text-[16px] leading-[1.85] text-white/80 md:text-[17px]">
//               {c.quality.text}
//             </p>
//           </Reveal>

//           <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//             {c.quality.principles.map((p, i) => {
//               const Icon = PRINCIPLE_ICONS[i % PRINCIPLE_ICONS.length];
//               return (
//                 <li key={p.title}>
//                   <Reveal delay={i * 0.08} className="h-full">
//                    <motion.article
//   whileHover={reduce ? undefined : { y: -10, scale: 1.02 }}
//   transition={{ type: "spring", stiffness: 220, damping: 20 }}
//   className="group/card relative h-full overflow-hidden rounded-[22px] border border-copper/30 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur-sm transition-colors duration-500 hover:border-copper/70"
// >
//   {/* hover glow */}
//   <div
//     aria-hidden="true"
//     className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-copper/30 opacity-0 blur-[60px] transition-opacity duration-500 group-hover/card:opacity-100"
//   />
//   {/* dots */}
//   <div
//     aria-hidden="true"
//     className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]"
//   />
//   {/* shine sweep */}
//   <span
//     aria-hidden="true"
//     className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-[1200ms] ease-out group-hover/card:left-[130%] group-hover/card:opacity-100"
//   />
//   {/* big number */}
//   <span
//     aria-hidden="true"
//     className="pointer-events-none absolute -bottom-2 right-3 select-none font-display text-[88px] font-light leading-none text-white/[0.06]"
//   >
//     0{i + 1}
//   </span>

//   <div className="relative">
//     {/* icon with rotating ring + floating */}
//     <motion.div
//       className="relative inline-flex h-14 w-14 items-center justify-center"
//       animate={reduce ? undefined : { y: [0, -5, 0] }}
//       transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
//     >
//       <motion.span
//         aria-hidden="true"
//         className="absolute inset-0 rounded-full border border-dashed border-copper/60"
//         animate={reduce ? undefined : { rotate: 360 }}
//         transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
//       />
//       <motion.span
//         aria-hidden="true"
//         className="absolute inset-1 rounded-full bg-copper/25"
//         animate={reduce ? undefined : { scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
//         transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
//       />
//       <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cream to-copper-light/70 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover/card:rotate-[360deg]">
//         <Icon className="h-5 w-5 text-green-deep" strokeWidth={1.75} aria-hidden="true" />
//       </span>
//     </motion.div>

//     <h3 className="mt-5 font-display text-[22px] text-white">{p.title}</h3>

//     {/* underline grows on hover */}
//     <span
//       aria-hidden="true"
//       className="mt-3 block h-[2px] w-10 rounded-full bg-gradient-to-r from-copper-light to-transparent transition-all duration-500 group-hover/card:w-full"
//     />

//     <p className="mt-3 font-sans text-[14px] leading-relaxed text-white/70 transition-colors duration-500 group-hover/card:text-white/90">
//       {p.text}
//     </p>
//   </div>
// </motion.article>
//                   </Reveal>
//                 </li>
//               );
//             })}
//           </ul>

//           <Reveal className="mt-14 text-center">
//             <ShineCta href={c.cta.href}>{c.cta.label}</ShineCta>
//           </Reveal>
//         </div>
//       </section>
//     </main>
//   );
// }
 "use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { IconBadge } from "@/components/ui/icon-badge";
import { ShineCta } from "@/components/ui/shine-cta";
import {
  ArrowRight,
  Eye,
  Globe2,
  Heart,
  Layers,
  ShieldCheck,
  Sprout,
  Target,
} from "lucide-react";
import {
  BRAND_NAME,
  brandContent as c,
  brandNav,
} from "@/lib/brand/brand-content";
import Image from "next/image";

const EASE = [0.22, 1, 0.36, 1] as const;

const PRINCIPLE_ICONS = [Sprout, Layers, Heart, ShieldCheck] as const;

// ───────── small building blocks ─────────

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = false; // always animate, ignoring the device setting
  return (
    <motion.div
      className={className}
      initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={`inline-flex items-center gap-3 font-sans text-[12px] font-medium uppercase tracking-[0.22em] ${
        light ? "text-copper-light" : "text-copper"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-px w-8 ${light ? "bg-copper-light/60" : "bg-copper/60"}`}
      />
      {children}
    </p>
  );
}

function Badge({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  const reduce = false; // always animate, ignoring the device setting
  return (
    <div className="relative inline-flex h-16 w-16 items-center justify-center">
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full border border-dashed border-copper/60"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />
      <motion.span
        aria-hidden="true"
        className="absolute inset-1 rounded-full bg-copper/20"
        animate={reduce ? undefined : { scale: [1, 1.22, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <span
        className={`relative flex h-12 w-12 items-center justify-center rounded-full shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] ${
          dark
            ? "bg-gradient-to-br from-cream to-copper-light/70"
            : "bg-gradient-to-br from-white to-cream"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

function SectionNav() {
  const [active, setActive] = useState<string>(brandNav[0].id);

  useEffect(() => {
    const els = brandNav
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Brand sections"
      className="sticky top-0 z-30 border-b border-border bg-cream-soft/85 backdrop-blur-xl"
    >
      <ul className="mx-auto flex max-w-[1100px] gap-1 overflow-x-auto px-4 py-2.5 sm:justify-center sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {brandNav.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <li key={id} className="shrink-0">
              <a
                href={`#${id}`}
                aria-current={isActive ? "true" : undefined}
                className={`relative block rounded-full px-4 py-2 font-sans text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/50 ${
                  isActive
                    ? "bg-green-deep font-medium text-white"
                    : "text-espresso/70 hover:bg-green-bg hover:text-green-deep"
                }`}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ───────── page ─────────

export function BrandPage() {
  const reduce = false; // always animate, ignoring the device setting
  



  return (
    <main className="flex-1 ">
      <style>{`html{scroll-behavior:smooth}`}</style>

      {/* ───────── HERO ───────── */}
      {/* <section className="relative isolate  bg-gradient-to-br  px-5 pb-12 pt-10 text-center sm:px-8 sm:pb-16 sm:pt-14">
        <Image
           src="/brand/final.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
        

        <motion.div
          initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mx-auto max-w-[820px]"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-copper bg-copper/20 px-5 py-2 font-sans text-[12px] font-bold uppercase tracking-[0.24em] text-copper-light shadow-[0_0_20px_rgba(184,115,51,0.35)]">
            <Globe2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            {c.hero.eyebrow}
          </p>
          <h1 className="mt-5 bg-gradient-to-b from-white via-cream to-copper-light bg-clip-text font-display text-[44px] leading-[0.95] tracking-tight text-transparent sm:text-[64px] md:text-[80px]">
            {BRAND_NAME}
          </h1>
          <span
            aria-hidden="true"
            className="mx-auto mt-5 block h-[2px] w-16 rounded-full bg-gradient-to-r from-copper-light to-copper"
          />
          <p className="mx-auto mt-5 max-w-[480px] font-sans text-[16px] leading-relaxed text-white/70 md:text-[18px]">
            {c.hero.tagline}
          </p>
        </motion.div>
      </section> */}
      <section className="relative isolate h-[260px] overflow-hidden sm:h-[300px] md:h-[360px]">
  <h1 className="sr-only">{BRAND_NAME}</h1>
  <Image
    src="/brand/Finasto Sunrise Tea Plantation Banner.png" 
    alt=""
    fill 
    priority
    sizes="100vw"
    className="object-cover object-center"
  />
</section>

      <SectionNav />

      {/* ───────── BRAND (replaces "About Us") ───────── */}
      <section
        id="brand"
        className="scroll-mt-16 px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto grid max-w-[13000px] items-start gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal className="mx-auto w-full max-w-[550px] lg:sticky lg:top-28">
            <div className="relative aspect-[4/5] w-full  overflow-hidden rounded-3xl border border-copper/30 shadow-[0_30px_50px_-15px_rgba(35,77,42,0.35)]">
              <Image
                src="/brand/brands.jpeg"
                alt="Golden morning light over a Finasto coffee and tea sanctuary"
                fill
                sizes="(min-width: 1024px) 400px, 100vw"
                className="object-cover object-center"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20"
              />
            </div>
          </Reveal>

          <div className="flex flex-col gap-6">
            <Reveal>
              <Eyebrow>{c.intro.eyebrow}</Eyebrow>
              <h2 className="mt-4 font-display text-[34px] leading-[1.1] text-green-deep sm:text-[44px] md:text-[52px]">
                {c.intro.title}
              </h2>
            </Reveal>

            {c.intro.paragraphs.map((p, i) => (
              <div key={i} className="flex flex-col gap-6">
                <Reveal>
                  <p
                    className={
                      i === 0
                        ? "font-sans text-[18px] leading-[1.75] text-espresso md:text-[20px]"
                        : "font-sans text-[16px] leading-[1.85] text-warm-gray md:text-[17px]"
                    }
                  >
                    {p}
                  </p>
                </Reveal>
                {i === 1 && (
                  <Reveal>
                    <blockquote className="border-l-2 border-copper py-1 pl-6 font-display text-[26px] italic leading-snug text-green-deep md:text-[32px]">
                      {c.intro.pullQuote}
                    </blockquote>
                  </Reveal>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── OUR STORY ───────── */}
      <section
        id="story"
        className="scroll-mt-16  px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-[1100px]">
          <div className="grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal className="lg:sticky lg:top-28">
              <Eyebrow>{c.story.eyebrow}</Eyebrow>
              <h2 className="mt-4 font-display text-[34px] leading-[1.1] text-green-deep sm:text-[44px]">
                {c.story.title}
              </h2>
              <div className="mt-8 inline-flex items-end gap-4 rounded-2xl border border-copper/75  px-6 py-5 shadow-[0_18px_40px_-24px_rgba(35,77,42,0.45)]">
                <span className="font-display text-[64px] leading-none text-">
                  {c.story.stat.value}
                </span>
                <span className="pb-2 font-sans text-[12px] font-medium uppercase tracking-[0.18em] text-green">
                  {c.story.stat.label}
                </span>
              </div>
            </Reveal>

            <ol className="relative flex flex-col gap-10 border-l border-copper/30 pl-8 sm:pl-10">
              {c.story.paragraphs.map((p, i) => (
                <li key={i} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[calc(2rem+14.5px)] top-0 flex h-7 w-7 items-center justify-center rounded-full border border-copper/50 bg-cream font-sans text-[11px] font-semibold text-copper sm:-left-[calc(2.5rem+14.5px)]"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-copper opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-copper shadow-[0_0_8px_rgba(184,115,51,0.8)]" />
                    </span>
                  </span>
                  <Reveal>
                    <p className="font-sans text-[16px] leading-[1.85] text-espresso/80 md:text-[17px]">
                      {p}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>

          <Reveal className="mt-20 text-center">
            <span
              aria-hidden="true"
              className="mx-auto mb-8 block h-px w-24 bg-gradient-to-r from-transparent via-copper to-transparent"
            />
          </Reveal>
        </div>
      </section>

      {/* ───────── VISION & MISSION ───────── */}
      <section
        id="vision-mission"
        className="relative scroll-mt-16 overflow-hidden px-5 pb-20 pt-0 sm:px-8 sm:pb-28"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_15%_20%,rgba(35,77,42,0.10),transparent_70%),radial-gradient(55%_45%_at_90%_80%,rgba(184,115,51,0.14),transparent_70%)]"
        />

        <div className="relative mx-auto grid max-w-[1100px] gap-6 md:grid-cols-2 md:gap-8">
          {/* center diamond */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gradient-to-br from-copper-light to-copper shadow-[0_0_24px_4px_rgba(184,115,51,0.55)] md:block"
            animate={reduce ? undefined : { scale: [1, 1.35, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* VISION */}
          <Reveal>
            <motion.article
              whileHover={reduce ? undefined : { y: -8 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="group relative h-full overflow-hidden rounded-[28px] bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24] p-8 text-white shadow-[0_40px_80px_-30px_rgba(16,38,15,0.85)] ring-1 ring-copper/30 sm:p-12"
            >
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-copper/35 blur-[80px]"
                animate={reduce ? undefined : { x: [0, -24, 0], y: [0, 18, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-emerald-300/10 blur-[80px]"
                animate={reduce ? undefined : { x: [0, 20, 0], y: [0, -16, 0] }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-[1400ms] ease-out group-hover:left-[130%] group-hover:opacity-100"
              />
              {/* <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2 right-6 select-none font-display text-[120px] font-light leading-none text-white/[0.05] sm:text-[160px]"
              >
                01
              </span> */}

              <Badge dark>
                <Eye className="h-6 w-6 text-green" strokeWidth={1.5} aria-hidden="true" />
              </Badge>

              <div className="relative mt-7">
                <Eyebrow light>{c.vision.eyebrow}</Eyebrow>
                <motion.span
                  aria-hidden="true"
                  className="mt-4 block h-[2px] w-24 origin-left bg-gradient-to-r from-copper-light via-copper to-transparent"
                  initial={{ scaleX: reduce ? 1 : 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
                />
                <p className="mt-5 font-sans text-[16px] leading-[1.9] text-white/85 md:text-[17px]">
                  {c.vision.text}
                </p>
              </div>
            </motion.article>
          </Reveal>

          {/* MISSION */}
          <Reveal delay={0.12}>
            <motion.article
              whileHover={reduce ? undefined : { y: -8 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="group relative h-full overflow-hidden rounded-[28px] border border-copper/30 bg-gradient-to-br from-cream-soft via-white to-cream p-8 shadow-[0_40px_80px_-36px_rgba(50,30,24,0.45)] sm:p-12"
            >
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-green/20 blur-[80px]"
                animate={reduce ? undefined : { x: [0, -24, 0], y: [0, 18, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-copper/20 blur-[80px]"
                animate={reduce ? undefined : { x: [0, 20, 0], y: [0, -16, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#6b4226_1px,transparent_1px)] [background-size:22px_22px]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-copper/15 to-transparent opacity-0 transition-all duration-[1400ms] ease-out group-hover:left-[130%] group-hover:opacity-100"
              />
              {/* <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2 right-6 select-none font-display text-[120px] font-light leading-none text-copper/[0.08] sm:text-[160px]"
              >
                02
              </span> */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 h-16 w-16 rounded-tl-[28px] border-l-2 border-t-2 border-copper/60"
              />

              <Badge>
                <Target className="h-6 w-6 text-green-deep" strokeWidth={1.5} aria-hidden="true" />
              </Badge>

              <div className="relative mt-7">
                <Eyebrow>{c.mission.eyebrow}</Eyebrow>
                <motion.span
                  aria-hidden="true"
                  className="mt-4 block h-[2px] w-24 origin-left bg-gradient-to-r from-green via-copper to-transparent"
                  initial={{ scaleX: reduce ? 1 : 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
                />
                <p className="mt-5 font-sans text-[16px] leading-[1.9] text-espresso/80 md:text-[17px]">
                  {c.mission.text}
                </p>
              </div>
            </motion.article>
          </Reveal>
        </div>
      </section>

      {/* ───────── QUALITY ───────── */}
      <section
        id="quality"
        className="group relative isolate scroll-mt-16 overflow-hidden bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24] px-5 py-20 text-white sm:px-8 sm:py-28"
      >
        {/* animated blobs */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 -z-10 h-72 w-72 rounded-full bg-copper/35 blur-[90px]"
          animate={reduce ? undefined : { x: [0, -24, 0], y: [0, 18, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 -z-10 h-64 w-64 rounded-full bg-emerald-300/10 blur-[90px]"
          animate={reduce ? undefined : { x: [0, 20, 0], y: [0, -16, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* dots */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]"
        />
        {/* shine sweep */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/2 -z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-[1400ms] ease-out group-hover:left-[130%] group-hover:opacity-100"
        />

        <div className="mx-auto max-w-[1100px]">
          <Reveal className="mx-auto max-w-[760px] text-center">
            <Eyebrow light>{c.quality.eyebrow}</Eyebrow>
            <motion.span
              aria-hidden="true"
              className="mx-auto mt-4 block h-[2px] w-24 origin-center bg-gradient-to-r from-transparent via-copper-light to-transparent"
              initial={{ scaleX: reduce ? 1 : 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
            />
            <h2 className="mt-5 font-display text-[32px] leading-[1.12] text-white sm:text-[44px]">
              {c.quality.title}
            </h2>
            <p className="mt-6 font-sans text-[16px] leading-[1.85] text-white/80 md:text-[17px]">
              {c.quality.text}
            </p>
          </Reveal>

          <ul className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
            {c.quality.principles.map((p, i) => {
              const Icon = PRINCIPLE_ICONS[i % PRINCIPLE_ICONS.length];
              return (
                <li key={p.title}>
                  <Reveal delay={i * 0.08} className="h-full">
                    <motion.article
                      whileHover={reduce ? undefined : { y: -10, scale: 1.02 }}
                      whileTap={reduce ? undefined : { scale: 0.97, y: -4 }}
                      transition={{ type: "spring", stiffness: 220, damping: 20 }}
                      className="group/card relative h-full overflow-hidden rounded-[22px] border border-copper/30 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur-sm transition-colors duration-500 hover:border-copper/70 sm:p-6"
                    >
                      {/* glow: visible on touch, hover-only on desktop */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-copper/30 opacity-60 blur-[60px] transition-opacity duration-500 group-active/card:opacity-100 md:opacity-0 md:group-hover/card:opacity-100"
                      />
                      {/* dots */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]"
                      />
                      {/* shine sweep */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-[1200ms] ease-out group-hover/card:left-[130%] group-hover/card:opacity-100 group-active/card:left-[130%] group-active/card:opacity-100"
                      />

                      <div className="relative">
                        {/* icon with rotating ring + floating */}
                        <motion.div
                          className="relative inline-flex h-14 w-14 items-center justify-center"
                          animate={reduce ? undefined : { y: [0, -5, 0] }}
                          transition={{
                            duration: 3 + i * 0.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <motion.span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full border border-dashed border-copper/60"
                            animate={reduce ? undefined : { rotate: 360 }}
                            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                          />
                          <motion.span
                            aria-hidden="true"
                            className="absolute inset-1 rounded-full bg-copper/25"
                            animate={
                              reduce
                                ? undefined
                                : { scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }
                            }
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: i * 0.3,
                            }}
                          />
                          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cream to-copper-light/70 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover/card:rotate-[360deg] group-active/card:rotate-[360deg]">
                            <Icon
                              className="h-5 w-5 text-green-deep"
                              strokeWidth={1.75}
                              aria-hidden="true"
                            />
                          </span>
                        </motion.div>

                        <h3 className="mt-5 font-display text-[22px] text-white">
                          {p.title}
                        </h3>

                        {/* underline grows on hover / tap */}
                        <span
                          aria-hidden="true"
                          className="mt-3 block h-[2px] w-16 rounded-full bg-gradient-to-r from-copper-light to-transparent transition-all duration-500 group-hover/card:w-full group-active/card:w-full"
                        />

                        <p className="mt-3 font-sans text-[14px] leading-relaxed text-white/70 transition-colors duration-500 group-hover/card:text-white/90 group-active/card:text-white/90">
                          {p.text}
                        </p>
                      </div>
                    </motion.article>
                  </Reveal>
                </li>
              );
            })}
          </ul>

          <Reveal className="mt-14 text-center">
            <ShineCta href={c.cta.href}>{c.cta.label}</ShineCta>
          </Reveal>
        </div>
      </section>
    </main>
  );
}