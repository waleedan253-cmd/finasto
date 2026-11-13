// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { AnimatePresence, motion } from "motion/react";
// import {
//   Eye,
//   EyeOff,
//   Loader2,
//   Home,
//   ChevronRight,
//   LayoutDashboard,
//   ClipboardList,
//   Boxes,
// } from "lucide-react";
// import { signInAction } from "@/lib/auth/actions";
// import { useAuthLoading } from "@/components/AuthLoadingProvider";

// const signInSchema = z.object({
//   email: z.string().min(1, "Email is required").email("Enter a valid email"),
//   password: z.string().min(1, "Password is required"),
// });

// type SignInValues = z.infer<typeof signInSchema>;

// // Always render in the brand palette, even when the site is in dark mode
// const brandVars = {
//   colorScheme: "light",
//   "--color-cream": "#f7f1e7",
//   "--color-cream-soft": "#fbf8f3",
//   "--color-white": "#ffffff",
//   "--color-espresso": "#321e18",
//   "--color-espresso-deep": "#1f1512",
//   "--color-green": "#3e762f",
//   "--color-green-deep": "#234d2a",
//   "--color-green-bg": "#eef2e8",
//   "--color-copper": "#c98245",
//   "--color-copper-light": "#e0a56d",
//   "--color-red": "#b84e45",
//   "--color-warm-gray": "#756b62",
//   "--color-border": "#e6ded3",
//   "--color-border-strong": "#d8ccbe",
// } as React.CSSProperties;

// const EASE = [0.22, 1, 0.36, 1] as const;

// const GOLD_LIGHT = "#fbe7a6";
// const GOLD = "#e8c06a";
// const GOLD_DEEP = "#b8862b";

// // Intro timeline (seconds)
// const BLOOM_PETAL_STAGGER = 0.09;
// const BLOOM_END = 1.45;
// const SPLIT_AT = 1.75;
// const SPLIT_DURATION = 1.0;
// const CONTENT_DELAY = SPLIT_AT + 0.35;
// const PETALS = 12;

// const FEATURES = [
//   {
//     icon: LayoutDashboard,
//     title: "Dashboard Overview",
//     text: "View your account information and stay up to date with your latest activities.",
//   },
//   {
//     icon: ClipboardList,
//     title: "Order Management",
//     text: "Access your orders, purchase records, order history and detailed order information.",
//   },
//   {
//     icon: Boxes,
//     title: "Inventory Insights",
//     text: "Access your orders, purchase records, order history and detailed order information.",
//   },
// ];

// // Floating gold particles (fixed values so server and client render the same)
// const PARTICLES = [
//   { left: 6, size: 4, dur: 14, delay: 0 },
//   { left: 14, size: 3, dur: 18, delay: 3 },
//   { left: 22, size: 5, dur: 16, delay: 6 },
//   { left: 31, size: 3, dur: 20, delay: 1 },
//   { left: 40, size: 4, dur: 15, delay: 8 },
//   { left: 49, size: 3, dur: 19, delay: 4 },
//   { left: 57, size: 5, dur: 17, delay: 10 },
//   { left: 66, size: 3, dur: 21, delay: 2 },
//   { left: 74, size: 4, dur: 15, delay: 7 },
//   { left: 82, size: 3, dur: 18, delay: 5 },
//   { left: 90, size: 5, dur: 16, delay: 9 },
//   { left: 96, size: 3, dur: 20, delay: 12 },
// ];

// // GPU hint so transform/opacity animations stay on the compositor (smooth on mobile)
// const gpu = { willChange: "transform" } as React.CSSProperties;

// /**
//  * Full-page sign-in for Admin and Affiliate accounts only — customers check
//  * out as guests and never see this.
//  */
// export default function SignInPage() {
//   const reduce = false;
//   const router = useRouter();
//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<SignInValues>({
//     resolver: zodResolver(signInSchema),
//   });
//   const [serverError, setServerError] = useState<string | null>(null);
//   const [redirecting, setRedirecting] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   // Starts true so the intro covers the page from the very first paint (no flash)
//   const [intro, setIntro] = useState(true);
//   const authLoading = useAuthLoading();

//   // Safety net: always clear the intro once its timeline has finished
//   useEffect(() => {
//     const t = setTimeout(
//       () => setIntro(false),
//       (SPLIT_AT + SPLIT_DURATION) * 1000 + 300,
//     );
//     return () => clearTimeout(t);
//   }, []);

//   async function onSubmit(values: SignInValues) {
//     setServerError(null);
//     authLoading.show(); // full-page loading starts immediately
//     try {
//       const result = await signInAction(values);
//       if ("error" in result) {
//         authLoading.hide();
//         setServerError(result.error);
//         return;
//       }
//       setRedirecting(true); // keep the page covered until the dashboard opens
//       router.replace(result.redirectTo);
//     } catch {
//       authLoading.hide();
//       setServerError("Something went wrong. Please try again.");
//     }
//   }

//   const busy = isSubmitting || redirecting;

//   const stack = {
//     hidden: {},
//     show: {
//       transition: {
//         staggerChildren: reduce ? 0 : 0.08,
//         delayChildren: CONTENT_DELAY,
//       },
//     },
//   };
//   const rise = {
//     hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 14 },
//     show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
//   };

//   return (
//     <main
//       style={brandVars}
//       className="relative min-h-dvh overflow-x-hidden bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24]"
//     >
//       {/* ───────── INTRO: FLOWER BLOOM, THEN SPLIT LEFT / RIGHT ───────── */}
//       {intro && <FlowerIntro onDone={() => setIntro(false)} />}

//       {/* ───────── GREEN DOTS THEME BACKDROP (no image) ───────── */}
//       <div
//         aria-hidden="true"
//         className="pointer-events-none absolute inset-0 overflow-hidden"
//       >
//         {/* animated blobs */}
//         <motion.div
//           style={gpu}
//           className="absolute -right-24 -top-24 h-[260px] w-[260px] rounded-full bg-copper/35 blur-[90px] sm:h-[360px] sm:w-[360px] sm:blur-[110px]"
//           animate={{ x: [0, -28, 0], y: [0, 22, 0] }}
//           transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
//         />
//         <motion.div
//           style={gpu}
//           className="absolute -bottom-28 -left-20 h-[240px] w-[240px] rounded-full bg-emerald-300/15 blur-[90px] sm:h-[320px] sm:w-[320px] sm:blur-[110px]"
//           animate={{ x: [0, 24, 0], y: [0, -18, 0] }}
//           transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
//         />
//         <motion.div
//           style={gpu}
//           className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e8c06a]/10 blur-[90px] sm:h-[520px] sm:w-[520px] sm:blur-[120px]"
//           animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
//           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//         />

//         {/* dots */}
//         <div className="absolute inset-0 opacity-[0.09] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />

//         {/* soft vignette to focus the card */}
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,14,6,0.55)_100%)]" />

//         {/* big orbit rings behind the text, with a travelling gold dot */}
//         <div className="absolute -left-56 top-1/2 hidden h-[680px] w-[680px] -translate-y-1/2 lg:block">
//           <motion.div
//             style={gpu}
//             className="absolute inset-0 rounded-full border border-dashed border-[#e8c06a]/25"
//             animate={{ rotate: 360 }}
//             transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
//           >
//             <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e8c06a] shadow-[0_0_20px_6px_rgba(232,192,106,0.6)]" />
//           </motion.div>
//           <motion.div
//             style={gpu}
//             className="absolute inset-16 rounded-full border border-[#e8c06a]/15"
//             animate={{ rotate: -360 }}
//             transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
//           >
//             <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-300 shadow-[0_0_16px_4px_rgba(110,231,183,0.5)]" />
//           </motion.div>
//         </div>

//         {/* rising gold particles (fewer on small screens) */}
//         {PARTICLES.map((pt, i) => (
//           <motion.span
//             key={i}
//             style={{
//               ...gpu,
//               left: `${pt.left}%`,
//               width: pt.size,
//               height: pt.size,
//               boxShadow: "0 0 10px 2px rgba(232,192,106,0.55)",
//             }}
//             className={`absolute bottom-[-10px] rounded-full bg-[#fbe7a6] ${
//               i % 2 === 1 ? "hidden sm:block" : ""
//             }`}
//             animate={{ y: [0, -900], opacity: [0, 0.9, 0.9, 0] }}
//             transition={{
//               duration: pt.dur,
//               delay: pt.delay,
//               repeat: Infinity,
//               ease: "linear",
//             }}
//           />
//         ))}

//         {/* slow shine sweep */}
//         <motion.span
//           style={gpu}
//           className="absolute inset-y-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
//           initial={{ left: "-40%" }}
//           animate={{ left: "140%" }}
//           transition={{
//             duration: 2.6,
//             ease: "easeInOut",
//             repeat: Infinity,
//             repeatDelay: 5,
//             delay: CONTENT_DELAY + 1.5,
//           }}
//         />
//       </div>

//       {/* ───────── BREADCRUMBS (above the intro so Home is always reachable) ───────── */}
//       <nav
//         aria-label="Breadcrumb"
//         className="relative z-[70] mx-auto w-full max-w-[1240px] px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 sm:pt-[max(1.25rem,env(safe-area-inset-top))] lg:px-10"
//       >
//         <ol className="flex items-center gap-1.5 font-sans text-[13px] text-white/70 sm:gap-2 sm:text-[14px]">
//           <li>
//             <Link
//               href="/"
//               className="inline-flex items-center gap-1.5 rounded-full border border-[#e8c06a]/50 bg-black/20 px-3 py-1.5 backdrop-blur-sm transition-colors hover:border-[#e8c06a] hover:text-[#fbe7a6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c06a]"
//             >
//               <Home className="h-4 w-4" aria-hidden="true" />
//               Home
//             </Link>
//           </li>
//           <li aria-hidden="true">
//             <ChevronRight className="h-4 w-4 text-white/40" />
//           </li>
//           <li aria-current="page" className="font-medium text-[#fbe7a6]">
//             Sign In
//           </li>
//         </ol>
//       </nav>

//       {/* ───────── TWO SECTIONS: TEXT LEFT, FORM RIGHT ───────── */}
//       <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-4.5rem)] w-full max-w-[1240px] items-center gap-8 px-4 py-8 sm:gap-10 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16 lg:px-10">
//         {/* ── LEFT: brand story ── */}
//         <motion.div
//           variants={stack}
//           initial="hidden"
//           animate="show"
//           className="order-2 text-center lg:order-1 lg:text-left"
//         >
//           <motion.span
//             variants={rise}
//             aria-hidden="true"
//             className="mx-auto block h-[2px] w-24 origin-left bg-gradient-to-r from-copper-light via-copper to-transparent sm:mt-4 lg:mx-0"
//           />

//           <motion.h1
//             variants={rise}
//             className="mt-5 font-display text-[34px] leading-[1.08] text-white sm:mt-6 sm:text-[54px] sm:leading-[1.06] lg:text-[64px]"
//           >
//             Welcome to FINASTO™{" "}
//           </motion.h1>

//           <ul className="mx-auto mt-8 hidden max-w-[460px] flex-col gap-4 sm:mt-10 sm:flex lg:mx-0">
//             {FEATURES.map((f, i) => {
//               const Icon = f.icon;
//               return (
//                 <motion.li
//                   key={f.title}
//                   variants={rise}
//                   whileHover={{ x: 6 }}
//                   className="group/feat relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[#e8c06a]/25 bg-white/[0.06] p-4 text-left backdrop-blur-sm transition-colors duration-500 hover:border-[#e8c06a]/60"
//                 >
//                   <span
//                     aria-hidden="true"
//                     className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-[1200ms] ease-out group-hover/feat:left-[130%] group-hover/feat:opacity-100"
//                   />
//                   <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
//                     <motion.span
//                       aria-hidden="true"
//                       style={gpu}
//                       className="absolute inset-0 rounded-full border border-dashed border-copper/70"
//                       animate={{ rotate: 360 }}
//                       transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
//                     />
//                     <motion.span
//                       aria-hidden="true"
//                       style={gpu}
//                       className="absolute inset-1 rounded-full bg-copper/30"
//                       animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
//                       transition={{
//                         duration: 3,
//                         repeat: Infinity,
//                         ease: "easeInOut",
//                         delay: i * 0.4,
//                       }}
//                     />
//                     <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cream to-copper-light/80 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)]">
//                       <Icon
//                         className="h-[18px] w-[18px] text-green-deep"
//                         strokeWidth={1.8}
//                         aria-hidden="true"
//                       />
//                     </span>
//                   </span>
//                   <span className="relative">
//                     <span className="block font-display text-[19px] leading-snug text-white">
//                       {f.title}
//                     </span>
//                     <span className="mt-0.5 block font-sans text-[13.5px] leading-relaxed text-white/65">
//                       {f.text}
//                     </span>
//                   </span>
//                 </motion.li>
//               );
//             })}
//           </ul>
//         </motion.div>

//         {/* ── RIGHT: sign-in form ── */}
//         <motion.div
//           variants={stack}
//           initial="hidden"
//           animate="show"
//           className="relative order-1 mx-auto w-full max-w-[460px] lg:order-2 lg:ml-auto"
//         >
//           {/* gold glow behind the card */}
//           <div
//             aria-hidden="true"
//             className="pointer-events-none absolute -inset-3 rounded-[40px] bg-gradient-to-br from-[#e8c06a]/40 via-transparent to-[#b8862b]/30 blur-2xl sm:-inset-4 sm:rounded-[44px]"
//           />

//           {/* animated gold light running around the card edge */}
//           <div className="relative overflow-hidden rounded-[31px] p-[1.5px]">
//             <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
//               <motion.span
//                 className="block aspect-square w-[220%] shrink-0"
//                 style={{
//                   ...gpu,
//                   background:
//                     "conic-gradient(from 0deg, transparent 0deg, #e8c06a 40deg, #fbe7a6 70deg, transparent 120deg, transparent 220deg, #b8862b 260deg, transparent 310deg)",
//                 }}
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
//               />
//             </div>
//             <span aria-hidden="true" className="absolute inset-0 bg-[#e8c06a]/50" />

//             <div className="relative overflow-hidden rounded-[30px] bg-[#fdf3e4] px-5 py-8 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.7)] sm:px-10 sm:py-12">
//               {/* gold hairline on top */}
//               <span
//                 aria-hidden="true"
//                 className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#e8c06a] to-transparent"
//               />
//               {/* faint green dots inside the card */}
//               <div
//                 aria-hidden="true"
//                 className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#234d2a_1px,transparent_1px)] [background-size:18px_18px]"
//               />
//               {/* warm glow in the corner */}
//               <motion.div
//                 aria-hidden="true"
//                 style={gpu}
//                 className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#e8c06a]/30 blur-3xl"
//                 animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
//                 transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
//               />

//               <div className="relative">
//                 <div className="flex flex-col items-center text-center">
//                   <motion.div variants={rise}>
//                     <Link href="/" aria-label="Finasto home">
//                       <Image
//                         src="/brand/finasto-logo.png"
//                         alt="Finasto"
//                         width={120}
//                         height={90}
//                         priority
//                         className="h-[68px] w-auto sm:h-[78px]"
//                       />
//                     </Link>
//                   </motion.div>
//                   <motion.h2
//                     variants={rise}
//                     id="auth-modal-title"
//                     className="mt-3 font-display text-[38px] leading-tight text-green sm:text-[44px]"
//                   >
//                     Sign In
//                   </motion.h2>
//                   <motion.p
//                     variants={rise}
//                     className="mt-1 font-sans text-[15px] text-espresso/65 sm:text-[16px]"
//                   >
//                     Business Signature Portal
//                   </motion.p>
//                   <motion.span
//                     variants={rise}
//                     className="mt-4 block h-[2px] w-14 rounded-full bg-gradient-to-r from-[#e8c06a] to-[#b8862b]"
//                   />
//                 </div>

//                 <form
//                   onSubmit={handleSubmit(onSubmit)}
//                   noValidate
//                   className="mt-7 flex flex-col gap-4 sm:mt-8"
//                 >
//                   <AnimatePresence initial={false}>
//                     {serverError && (
//                       <motion.p
//                         key="server-error"
//                         role="alert"
//                         initial={{ opacity: 0, y: -6 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -6 }}
//                         transition={{ duration: 0.25, ease: EASE }}
//                         className="rounded-xl border border-red/30 bg-red/5 px-4 py-3 font-sans text-[13px] leading-snug text-red"
//                       >
//                         {serverError}
//                       </motion.p>
//                     )}
//                   </AnimatePresence>

//                   <motion.div variants={rise}>
//                     <Field
//                       label="Email Address"
//                       type="email"
//                       autoComplete="email"
//                       gold
//                       error={errors.email?.message}
//                       {...register("email")}
//                     />
//                   </motion.div>

//                   <motion.div variants={rise}>
//                     <Field
//                       label="Password"
//                       type={showPassword ? "text" : "password"}
//                       autoComplete="current-password"
//                       error={errors.password?.message}
//                       trailing={
//                         <button
//                           type="button"
//                           onClick={() => setShowPassword((s) => !s)}
//                           aria-label={showPassword ? "Hide password" : "Show password"}
//                           className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-warm-gray transition-colors hover:bg-[#e8c06a]/20 hover:text-[#8a6420] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c06a]/70"
//                         >
//                           {showPassword ? (
//                             <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" />
//                           ) : (
//                             <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
//                           )}
//                         </button>
//                       }
//                       {...register("password")}
//                     />
//                   </motion.div>

//                   <motion.div variants={rise} className="-mt-1 flex justify-end">
//                     <Link
//                       href="/forgot-password"
//                       className="rounded font-sans text-[14px] text-espresso/70 underline-offset-4 transition-colors hover:text-[#8a6420] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c06a]/70"
//                     >
//                       Forgot password?
//                     </Link>
//                   </motion.div>

//                   <motion.div variants={rise}>
//                     <button
//                       type="submit"
//                       disabled={busy}
//                       className="relative mt-1 flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-green-deep font-sans text-[15px] font-medium text-white shadow-[0_12px_28px_-10px_rgba(35,77,42,0.7),inset_0_1px_0_0_rgba(255,255,255,0.18)] transition-all hover:bg-green active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_3s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent"
//                     >
//                       <motion.span
//                         aria-hidden="true"
//                         style={gpu}
//                         className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
//                         initial={{ left: "-40%" }}
//                         animate={{ left: "140%" }}
//                         transition={{
//                           duration: 1.4,
//                           ease: "easeInOut",
//                           repeat: Infinity,
//                           repeatDelay: 3.2,
//                           delay: CONTENT_DELAY + 1,
//                         }}
//                       />
//                       {busy && <Loader2 className="relative h-4 w-4 animate-spin" />}
//                       <span className="relative">Sign In</span>
//                     </button>
//                   </motion.div>

//                   <motion.div variants={rise} className="flex flex-col items-center gap-3">
//                     <span
//                       aria-hidden="true"
//                       className="block h-[2px] w-14 rounded-full bg-gradient-to-r from-green to-copper"
//                     />
//                     <p className="text-center font-sans text-[13px] leading-relaxed text-espresso/65">
//                       Exclusive access for registered FINASTO™ Brand Promoters and Stockists.
//                     </p>
//                   </motion.div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </main>
//   );
// }

// /** Gold flower blooms, then the screen splits left and right. */
// function FlowerIntro({ onDone }: { onDone: () => void }) {
//   return (
//     <div
//       aria-hidden="true"
//       className="pointer-events-none fixed inset-0 z-[65] overflow-hidden"
//     >
//       <motion.div
//         initial={{ x: 0 }}
//         animate={{ x: "-101%" }}
//         transition={{ duration: SPLIT_DURATION, delay: SPLIT_AT, ease: [0.76, 0, 0.24, 1] }}
//         style={gpu}
//         className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(ellipse_at_100%_50%,#1d3a22_0%,#0f1d12_55%,#0b0806_100%)]"
//       >
//         <span className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#e8c06a]/70 to-transparent" />
//       </motion.div>
//       <motion.div
//         initial={{ x: 0 }}
//         animate={{ x: "101%" }}
//         transition={{ duration: SPLIT_DURATION, delay: SPLIT_AT, ease: [0.76, 0, 0.24, 1] }}
//         onAnimationComplete={onDone}
//         style={gpu}
//         className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_0%_50%,#1d3a22_0%,#0f1d12_55%,#0b0806_100%)]"
//       >
//         <span className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#e8c06a]/70 to-transparent" />
//       </motion.div>

//       <div className="absolute inset-0 grid place-items-center">
//         <motion.div
//           initial={{ scale: 0.85, opacity: 1, rotate: -20 }}
//           animate={{
//             scale: [0.85, 1, 1, 2.4],
//             opacity: [1, 1, 1, 0],
//             rotate: [-20, 0, 0, 25],
//           }}
//           transition={{
//             duration: SPLIT_AT + 0.45,
//             times: [0, BLOOM_END / (SPLIT_AT + 0.45), SPLIT_AT / (SPLIT_AT + 0.45), 1],
//             ease: "easeInOut",
//           }}
//           style={gpu}
//           className="relative h-[190px] w-[190px] sm:h-[260px] sm:w-[260px]"
//         >
//           <motion.div
//             initial={{ opacity: 0, scale: 0.4 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 1.2, ease: EASE }}
//             className="absolute inset-[-40%] rounded-full"
//             style={{
//               background: `radial-gradient(circle, ${GOLD}55 0%, ${GOLD}1a 40%, transparent 68%)`,
//             }}
//           />
//           <svg viewBox="0 0 200 200" className="relative h-full w-full overflow-visible">
//             <defs>
//               <linearGradient id="auth-petal-gold" x1="0" y1="1" x2="0" y2="0">
//                 <stop offset="0%" stopColor={GOLD_DEEP} />
//                 <stop offset="55%" stopColor={GOLD} />
//                 <stop offset="100%" stopColor={GOLD_LIGHT} />
//               </linearGradient>
//               <radialGradient id="auth-core-gold" cx="50%" cy="40%" r="60%">
//                 <stop offset="0%" stopColor="#fff6d6" />
//                 <stop offset="60%" stopColor={GOLD} />
//                 <stop offset="100%" stopColor={GOLD_DEEP} />
//               </radialGradient>
//             </defs>

//             <motion.circle
//               cx="100"
//               cy="100"
//               r="96"
//               fill="none"
//               stroke={GOLD}
//               strokeOpacity="0.55"
//               strokeWidth="1"
//               initial={{ pathLength: 0 }}
//               animate={{ pathLength: 1 }}
//               transition={{ duration: 1.2, ease: EASE }}
//             />

//             <g transform="translate(100 100)">
//               {Array.from({ length: PETALS }).map((_, i) => (
//                 <g key={i} transform={`rotate(${(360 / PETALS) * i})`}>
//                   <motion.path
//                     d="M0 0 C-17 -22 -15 -56 0 -80 C15 -56 17 -22 0 0Z"
//                     fill="url(#auth-petal-gold)"
//                     fillOpacity={i % 2 === 0 ? 0.95 : 0.7}
//                     stroke={GOLD_LIGHT}
//                     strokeOpacity="0.6"
//                     strokeWidth="0.6"
//                     style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
//                     initial={{ scale: 0, opacity: 0 }}
//                     animate={{ scale: 1, opacity: 1 }}
//                     transition={{
//                       duration: 0.8,
//                       delay: 0.15 + i * BLOOM_PETAL_STAGGER,
//                       ease: EASE,
//                     }}
//                   />
//                 </g>
//               ))}
//               {Array.from({ length: PETALS }).map((_, i) => (
//                 <g key={`in-${i}`} transform={`rotate(${(360 / PETALS) * i + 360 / PETALS / 2})`}>
//                   <motion.path
//                     d="M0 0 C-10 -14 -9 -34 0 -48 C9 -34 10 -14 0 0Z"
//                     fill={GOLD_LIGHT}
//                     fillOpacity="0.9"
//                     style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
//                     initial={{ scale: 0, opacity: 0 }}
//                     animate={{ scale: 1, opacity: 1 }}
//                     transition={{ duration: 0.7, delay: 0.7 + i * 0.05, ease: EASE }}
//                   />
//                 </g>
//               ))}
//               <motion.circle
//                 r="11"
//                 fill="url(#auth-core-gold)"
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ duration: 0.6, delay: 1.0, ease: EASE }}
//               />
//             </g>
//           </svg>
//         </motion.div>
//       </div>
//     </div>
//   );
// }

// function Field({
//   label,
//   error,
//   trailing,
//   gold,
//   ...props
// }: React.InputHTMLAttributes<HTMLInputElement> & {
//   label: string;
//   error?: string;
//   trailing?: React.ReactNode;
//   /** Gold outline, like the highlighted email field in the design */
//   gold?: boolean;
// }) {
//   return (
//     <label className="flex flex-col gap-2">
//       <span className="font-sans text-[15px] font-medium text-espresso">
//         {label}
//       </span>
//       <span className="relative block">
//         <input
//           aria-invalid={!!error}
//           className={`h-[54px] w-full rounded-2xl border bg-white/60 px-4 font-sans text-[16px] text-espresso shadow-[inset_0_1px_2px_rgba(50,30,24,0.04)] outline-none transition-all placeholder:text-warm-gray/60 hover:border-[#e8c06a] focus:border-[#b8862b] focus:bg-white/80 focus:ring-4 focus:ring-[#e8c06a]/30 aria-[invalid=true]:border-red aria-[invalid=true]:focus:ring-red/15 ${
//             gold ? "border-[#e0b24f]" : "border-border-strong"
//           } ${trailing ? "pr-14" : ""}`}
//           {...props}
//         />
//         {trailing && (
//           <span className="absolute inset-y-0 right-2 flex items-center">
//             {trailing}
//           </span>
//         )}
//       </span>
//       {error && (
//         <span role="alert" className="font-sans text-[12px] text-red">
//           {error}
//         </span>
//       )}
//     </label>
//   );
// }
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "motion/react";
import {
  Eye,
  EyeOff,
  Loader2,
  Home,
  ChevronRight,
  LayoutDashboard,
  ClipboardList,
  Boxes,
} from "lucide-react";
import { signInAction } from "@/lib/auth/actions";
import { useAuthLoading } from "@/components/AuthLoadingProvider";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type SignInValues = z.infer<typeof signInSchema>;

// Always render in the brand palette, even when the site is in dark mode
const brandVars = {
  colorScheme: "light",
  "--color-cream": "#f7f1e7",
  "--color-cream-soft": "#fbf8f3",
  "--color-white": "#ffffff",
  "--color-espresso": "#321e18",
  "--color-espresso-deep": "#1f1512",
  "--color-green": "#3e762f",
  "--color-green-deep": "#234d2a",
  "--color-green-bg": "#eef2e8",
  "--color-copper": "#c98245",
  "--color-copper-light": "#e0a56d",
  "--color-red": "#b84e45",
  "--color-warm-gray": "#756b62",
  "--color-border": "#e6ded3",
  "--color-border-strong": "#d8ccbe",
} as React.CSSProperties;

const EASE = [0.22, 1, 0.36, 1] as const;

const GOLD_LIGHT = "#fbe7a6";
const GOLD = "#e8c06a";
const GOLD_DEEP = "#b8862b";

// Intro timeline (seconds)
const BLOOM_PETAL_STAGGER = 0.09;
const BLOOM_END = 1.45;
const SPLIT_AT = 1.75;
const SPLIT_DURATION = 1.0;
const CONTENT_DELAY = SPLIT_AT + 0.35;
const PETALS = 12;

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Dashboard Overview",
    text: "View your account information and stay up to date with your latest activities.",
  },
  {
    icon: ClipboardList,
    title: "Order Management",
    text: "Access your orders, purchase records, order history and detailed order information.",
  },
  {
    icon: Boxes,
    title: "Inventory Insights",
    text: "Access your orders, purchase records, order history and detailed order information.",
  },
];

// Floating gold particles (fixed values so server and client render the same)
const PARTICLES = [
  { left: 6, size: 4, dur: 14, delay: 0 },
  { left: 14, size: 3, dur: 18, delay: 3 },
  { left: 22, size: 5, dur: 16, delay: 6 },
  { left: 31, size: 3, dur: 20, delay: 1 },
  { left: 40, size: 4, dur: 15, delay: 8 },
  { left: 49, size: 3, dur: 19, delay: 4 },
  { left: 57, size: 5, dur: 17, delay: 10 },
  { left: 66, size: 3, dur: 21, delay: 2 },
  { left: 74, size: 4, dur: 15, delay: 7 },
  { left: 82, size: 3, dur: 18, delay: 5 },
  { left: 90, size: 5, dur: 16, delay: 9 },
  { left: 96, size: 3, dur: 20, delay: 12 },
];

// GPU hint so transform/opacity animations stay on the compositor (smooth on mobile)
const gpu = { willChange: "transform" } as React.CSSProperties;

/**
 * Full-page sign-in for Admin and Affiliate accounts only — customers check
 * out as guests and never see this.
 */
export default function SignInPage() {
  const reduce = false;
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Starts true so the intro covers the page from the very first paint (no flash)
  const [intro, setIntro] = useState(true);
  const authLoading = useAuthLoading();

  // Safety net: always clear the intro once its timeline has finished
  useEffect(() => {
    const t = setTimeout(
      () => setIntro(false),
      (SPLIT_AT + SPLIT_DURATION) * 1000 + 300,
    );
    return () => clearTimeout(t);
  }, []);

  async function onSubmit(values: SignInValues) {
    setServerError(null);
    authLoading.show(); // full-page loading starts immediately
    try {
      const result = await signInAction(values);
      if ("error" in result) {
        authLoading.hide();
        setServerError(result.error);
        return;
      }
      setRedirecting(true); // keep the page covered until the dashboard opens
      router.replace(result.redirectTo);
    } catch {
      authLoading.hide();
      setServerError("Something went wrong. Please try again.");
    }
  }

  const busy = isSubmitting || redirecting;

  const stack = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.08,
        delayChildren: CONTENT_DELAY,
      },
    },
  };
  const rise = {
    hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  };

  return (
    <main
      style={brandVars}
      className="relative min-h-dvh overflow-x-clip bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24]"
    >
      {/* ───────── INTRO: FLOWER BLOOM, THEN SPLIT LEFT / RIGHT ───────── */}
      {intro && <FlowerIntro onDone={() => setIntro(false)} />}

      {/* ───────── GREEN DOTS THEME BACKDROP (no image) ───────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* animated blobs */}
        <motion.div
          style={gpu}
          className="absolute -right-24 -top-24 h-[260px] w-[260px] rounded-full bg-copper/35 blur-[90px] sm:h-[360px] sm:w-[360px] sm:blur-[110px]"
          animate={{ x: [0, -28, 0], y: [0, 22, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={gpu}
          className="absolute -bottom-28 -left-20 h-[240px] w-[240px] rounded-full bg-emerald-300/15 blur-[90px] sm:h-[320px] sm:w-[320px] sm:blur-[110px]"
          animate={{ x: [0, 24, 0], y: [0, -18, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={gpu}
          className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e8c06a]/10 blur-[90px] sm:h-[520px] sm:w-[520px] sm:blur-[120px]"
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* dots */}
        <div className="absolute inset-0 opacity-[0.09] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />

        {/* soft vignette to focus the card */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,14,6,0.55)_100%)]" />

        {/* big orbit rings behind the text, with a travelling gold dot */}
        <div className="absolute -left-56 top-1/2 hidden h-[680px] w-[680px] -translate-y-1/2 lg:block">
          <motion.div
            style={gpu}
            className="absolute inset-0 rounded-full border border-dashed border-[#e8c06a]/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e8c06a] shadow-[0_0_20px_6px_rgba(232,192,106,0.6)]" />
          </motion.div>
          <motion.div
            style={gpu}
            className="absolute inset-16 rounded-full border border-[#e8c06a]/15"
            animate={{ rotate: -360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-300 shadow-[0_0_16px_4px_rgba(110,231,183,0.5)]" />
          </motion.div>
        </div>

        {/* rising gold particles (fewer on small screens) */}
        {PARTICLES.map((pt, i) => (
          <motion.span
            key={i}
            style={{
              ...gpu,
              left: `${pt.left}%`,
              width: pt.size,
              height: pt.size,
              boxShadow: "0 0 10px 2px rgba(232,192,106,0.55)",
            }}
            className={`absolute bottom-[-10px] rounded-full bg-[#fbe7a6] ${
              i % 2 === 1 ? "hidden sm:block" : ""
            }`}
            animate={{ y: [0, -900], opacity: [0, 0.9, 0.9, 0] }}
            transition={{
              duration: pt.dur,
              delay: pt.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* slow shine sweep */}
        <motion.span
          style={gpu}
          className="absolute inset-y-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
          initial={{ left: "-40%" }}
          animate={{ left: "140%" }}
          transition={{
            duration: 2.6,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 5,
            delay: CONTENT_DELAY + 1.5,
          }}
        />
      </div>

      {/* ───────── BREADCRUMBS (above the intro so Home is always reachable) ───────── */}
      <nav
        aria-label="Breadcrumb"
        className="relative z-[70] mx-auto w-full max-w-[1240px] px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 sm:pt-[max(1.25rem,env(safe-area-inset-top))] lg:px-10"
      >
        <ol className="flex items-center gap-1.5 font-sans text-[13px] text-white/70 sm:gap-2 sm:text-[14px]">
          <li>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e8c06a]/50 bg-black/20 px-3 py-1.5 backdrop-blur-sm transition-colors hover:border-[#e8c06a] hover:text-[#fbe7a6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c06a]"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-4 w-4 text-white/40" />
          </li>
          <li aria-current="page" className="font-medium text-[#fbe7a6]">
            Sign In
          </li>
        </ol>
      </nav>

      {/* ───────── TWO SECTIONS: TEXT LEFT, FORM RIGHT ───────── */}
      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-4.5rem)] w-full max-w-[1240px] items-center gap-8 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 sm:gap-10 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16 lg:px-10">
        {/* ── LEFT: brand story ── */}
        <motion.div
          variants={stack}
          initial="hidden"
          animate="show"
          className="order-2 hidden text-center sm:block lg:order-1 lg:text-left"
        >
          <motion.span
            variants={rise}
            aria-hidden="true"
            className="mx-auto block h-[2px] w-24 origin-left bg-gradient-to-r from-copper-light via-copper to-transparent sm:mt-4 lg:mx-0"
          />

          <motion.h1
            variants={rise}
            className="mt-5 font-display text-[34px] leading-[1.08] text-white sm:mt-6 sm:text-[54px] sm:leading-[1.06] lg:text-[64px]"
          >
            Welcome to FINASTO™{" "}
          </motion.h1>

          <ul className="mx-auto mt-8 hidden max-w-[460px] flex-col gap-4 sm:mt-10 sm:flex lg:mx-0">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.li
                  key={f.title}
                  variants={rise}
                  whileHover={{ x: 6 }}
                  className="group/feat relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[#e8c06a]/25 bg-white/[0.06] p-4 text-left backdrop-blur-sm transition-colors duration-500 hover:border-[#e8c06a]/60"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-[1200ms] ease-out group-hover/feat:left-[130%] group-hover/feat:opacity-100"
                  />
                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                    <motion.span
                      aria-hidden="true"
                      style={gpu}
                      className="absolute inset-0 rounded-full border border-dashed border-copper/70"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.span
                      aria-hidden="true"
                      style={gpu}
                      className="absolute inset-1 rounded-full bg-copper/30"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.4,
                      }}
                    />
                    <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cream to-copper-light/80 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)]">
                      <Icon
                        className="h-[18px] w-[18px] text-green-deep"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                  <span className="relative">
                    <span className="block font-display text-[19px] leading-snug text-white">
                      {f.title}
                    </span>
                    <span className="mt-0.5 block font-sans text-[13.5px] leading-relaxed text-white/65">
                      {f.text}
                    </span>
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        {/* ── RIGHT: sign-in form ── */}
        <motion.div
          variants={stack}
          initial="hidden"
          animate="show"
          className="relative order-1 mx-auto w-full max-w-[460px] lg:order-2 lg:ml-auto"
        >
          {/* gold glow behind the card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1 rounded-[36px] bg-gradient-to-br from-[#e8c06a]/40 via-transparent to-[#b8862b]/30 blur-2xl sm:-inset-4 sm:rounded-[44px]"
          />

          {/* animated gold light running around the card edge */}
          <div className="relative overflow-hidden rounded-[31px] p-[1.5px]">
            <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
              <motion.span
                className="block aspect-square w-[220%] shrink-0"
                style={{
                  ...gpu,
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, #e8c06a 40deg, #fbe7a6 70deg, transparent 120deg, transparent 220deg, #b8862b 260deg, transparent 310deg)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <span aria-hidden="true" className="absolute inset-0 bg-[#e8c06a]/50" />

            <div className="relative overflow-hidden rounded-[30px] bg-[#fdf3e4] px-5 py-8 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.7)] sm:px-10 sm:py-12">
              {/* gold hairline on top */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#e8c06a] to-transparent"
              />
              {/* faint green dots inside the card */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#234d2a_1px,transparent_1px)] [background-size:18px_18px]"
              />
              {/* warm glow in the corner */}
              <motion.div
                aria-hidden="true"
                style={gpu}
                className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#e8c06a]/30 blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <motion.div variants={rise}>
                    <Link href="/" aria-label="Finasto home">
                      <Image
                        src="/brand/finasto-logo.png"
                        alt="Finasto"
                        width={120}
                        height={90}
                        priority
                        className="h-[68px] w-auto sm:h-[78px]"
                      />
                    </Link>
                  </motion.div>
                  <motion.h2
                    variants={rise}
                    id="auth-modal-title"
                    className="mt-3 font-display text-[38px] leading-tight text-green sm:text-[44px]"
                  >
                    Sign In
                  </motion.h2>
                  <motion.p
                    variants={rise}
                    className="mt-1 font-sans text-[15px] text-espresso/65 sm:text-[16px]"
                  >
                    Business Signature Portal
                  </motion.p>
                  <motion.span
                    variants={rise}
                    className="mt-4 block h-[2px] w-14 rounded-full bg-gradient-to-r from-[#e8c06a] to-[#b8862b]"
                  />
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="mt-7 flex flex-col gap-4 sm:mt-8"
                >
                  <AnimatePresence initial={false}>
                    {serverError && (
                      <motion.p
                        key="server-error"
                        role="alert"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        className="rounded-xl border border-red/30 bg-red/5 px-4 py-3 font-sans text-[13px] leading-snug text-red"
                      >
                        {serverError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.div variants={rise}>
                    <Field
                      label="Email Address"
                      type="email"
                      autoComplete="email"
                      gold
                      error={errors.email?.message}
                      {...register("email")}
                    />
                  </motion.div>

                  <motion.div variants={rise}>
                    <Field
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      error={errors.password?.message}
                      trailing={
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-warm-gray transition-colors hover:bg-[#e8c06a]/20 hover:text-[#8a6420] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c06a]/70"
                        >
                          {showPassword ? (
                            <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" />
                          ) : (
                            <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
                          )}
                        </button>
                      }
                      {...register("password")}
                    />
                  </motion.div>

                  <motion.div variants={rise} className="-mt-1 flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="rounded font-sans text-[14px] text-espresso/70 underline-offset-4 transition-colors hover:text-[#8a6420] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c06a]/70"
                    >
                      Forgot password?
                    </Link>
                  </motion.div>

                  <motion.div variants={rise}>
                    <button
                      type="submit"
                      disabled={busy}
                      className="relative mt-1 flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-green-deep font-sans text-[15px] font-medium text-white shadow-[0_12px_28px_-10px_rgba(35,77,42,0.7),inset_0_1px_0_0_rgba(255,255,255,0.18)] transition-all hover:bg-green active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_3s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent"
                    >
                      <motion.span
                        aria-hidden="true"
                        style={gpu}
                        className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                        initial={{ left: "-40%" }}
                        animate={{ left: "140%" }}
                        transition={{
                          duration: 1.4,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatDelay: 3.2,
                          delay: CONTENT_DELAY + 1,
                        }}
                      />
                      {busy && <Loader2 className="relative h-4 w-4 animate-spin" />}
                      <span className="relative">Sign In</span>
                    </button>
                  </motion.div>

                  <motion.div variants={rise} className="flex flex-col items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="block h-[2px] w-14 rounded-full bg-gradient-to-r from-green to-copper"
                    />
                    <p className="text-center font-sans text-[13px] leading-relaxed text-espresso/65">
                      Exclusive access for registered FINASTO™ Brand Promoters and Stockists.
                    </p>
                  </motion.div>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

/** Gold flower blooms, then the screen splits left and right. */
function FlowerIntro({ onDone }: { onDone: () => void }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[65] overflow-hidden"
    >
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: "-101%" }}
        transition={{ duration: SPLIT_DURATION, delay: SPLIT_AT, ease: [0.76, 0, 0.24, 1] }}
        style={gpu}
        className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(ellipse_at_100%_50%,#1d3a22_0%,#0f1d12_55%,#0b0806_100%)]"
      >
        <span className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#e8c06a]/70 to-transparent" />
      </motion.div>
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: "101%" }}
        transition={{ duration: SPLIT_DURATION, delay: SPLIT_AT, ease: [0.76, 0, 0.24, 1] }}
        onAnimationComplete={onDone}
        style={gpu}
        className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_0%_50%,#1d3a22_0%,#0f1d12_55%,#0b0806_100%)]"
      >
        <span className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#e8c06a]/70 to-transparent" />
      </motion.div>

      <div className="absolute inset-0 grid place-items-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 1, rotate: -20 }}
          animate={{
            scale: [0.85, 1, 1, 2.4],
            opacity: [1, 1, 1, 0],
            rotate: [-20, 0, 0, 25],
          }}
          transition={{
            duration: SPLIT_AT + 0.45,
            times: [0, BLOOM_END / (SPLIT_AT + 0.45), SPLIT_AT / (SPLIT_AT + 0.45), 1],
            ease: "easeInOut",
          }}
          style={gpu}
          className="relative h-[190px] w-[190px] sm:h-[260px] sm:w-[260px]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="absolute inset-[-40%] rounded-full"
            style={{
              background: `radial-gradient(circle, ${GOLD}55 0%, ${GOLD}1a 40%, transparent 68%)`,
            }}
          />
          <svg viewBox="0 0 200 200" className="relative h-full w-full overflow-visible">
            <defs>
              <linearGradient id="auth-petal-gold" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor={GOLD_DEEP} />
                <stop offset="55%" stopColor={GOLD} />
                <stop offset="100%" stopColor={GOLD_LIGHT} />
              </linearGradient>
              <radialGradient id="auth-core-gold" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#fff6d6" />
                <stop offset="60%" stopColor={GOLD} />
                <stop offset="100%" stopColor={GOLD_DEEP} />
              </radialGradient>
            </defs>

            <motion.circle
              cx="100"
              cy="100"
              r="96"
              fill="none"
              stroke={GOLD}
              strokeOpacity="0.55"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: EASE }}
            />

            <g transform="translate(100 100)">
              {Array.from({ length: PETALS }).map((_, i) => (
                <g key={i} transform={`rotate(${(360 / PETALS) * i})`}>
                  <motion.path
                    d="M0 0 C-17 -22 -15 -56 0 -80 C15 -56 17 -22 0 0Z"
                    fill="url(#auth-petal-gold)"
                    fillOpacity={i % 2 === 0 ? 0.95 : 0.7}
                    stroke={GOLD_LIGHT}
                    strokeOpacity="0.6"
                    strokeWidth="0.6"
                    style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.15 + i * BLOOM_PETAL_STAGGER,
                      ease: EASE,
                    }}
                  />
                </g>
              ))}
              {Array.from({ length: PETALS }).map((_, i) => (
                <g key={`in-${i}`} transform={`rotate(${(360 / PETALS) * i + 360 / PETALS / 2})`}>
                  <motion.path
                    d="M0 0 C-10 -14 -9 -34 0 -48 C9 -34 10 -14 0 0Z"
                    fill={GOLD_LIGHT}
                    fillOpacity="0.9"
                    style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.7 + i * 0.05, ease: EASE }}
                  />
                </g>
              ))}
              <motion.circle
                r="11"
                fill="url(#auth-core-gold)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 1.0, ease: EASE }}
              />
            </g>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  trailing,
  gold,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  trailing?: React.ReactNode;
  /** Gold outline, like the highlighted email field in the design */
  gold?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-sans text-[15px] font-medium text-espresso">
        {label}
      </span>
      <span className="relative block">
        <input
          aria-invalid={!!error}
          className={`h-[54px] w-full rounded-2xl border bg-white/60 px-4 font-sans text-[16px] text-espresso shadow-[inset_0_1px_2px_rgba(50,30,24,0.04)] outline-none transition-all placeholder:text-warm-gray/60 hover:border-[#e8c06a] focus:border-[#b8862b] focus:bg-white/80 focus:ring-4 focus:ring-[#e8c06a]/30 aria-[invalid=true]:border-red aria-[invalid=true]:focus:ring-red/15 ${
            gold ? "border-[#e0b24f]" : "border-border-strong"
          } ${trailing ? "pr-14" : ""}`}
          {...props}
        />
        {trailing && (
          <span className="absolute inset-y-0 right-2 flex items-center">
            {trailing}
          </span>
        )}
      </span>
      {error && (
        <span role="alert" className="font-sans text-[12px] text-red">
          {error}
        </span>
      )}
    </label>
  );
}