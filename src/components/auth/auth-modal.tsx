// // "use client";

// // import Image from "next/image";
// // import Link from "next/link";
// // import { useEffect, useState } from "react";
// // import { useForm } from "react-hook-form";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import { z } from "zod";
// // import { AnimatePresence, motion } from "motion/react";
// // import { X, Loader2 } from "lucide-react";
// // import { signInAction } from "@/lib/auth/actions";
// // import { useAuthLoading } from "@/components/AuthLoadingProvider";

// // const signInSchema = z.object({
// //   email: z.string().min(1, "Email is required").email("Enter a valid email"),
// //   password: z.string().min(1, "Password is required"),
// // });

// // type SignInValues = z.infer<typeof signInSchema>;

// // /**
// //  * Sign-in modal for Admin and Affiliate accounts only — customers check
// //  * out as guests and never see this. UI/validation is fully functional;
// //  * the actual submit handler is a stub until Supabase Auth is wired in
// //  * the backend/auth step, so it never claims a successful sign-in.
// //  */
// // export function AuthModal({
// //   open,
// //   onClose,
// // }: {
// //   open: boolean;
// //   onClose: () => void;
// // }) {
// //   const {
// //     register,
// //     handleSubmit,
// //     reset,
// //     formState: { errors, isSubmitting },
// //   } = useForm<SignInValues>({
// //     resolver: zodResolver(signInSchema),
// //   });
// //  const [serverError, setServerError] = useState<string | null>(null);
// // const [redirecting, setRedirecting] = useState(false);
// // const authLoading = useAuthLoading();

// //   useEffect(() => {
// //     if (!open) {
// //       reset();
// //       setServerError(null);
// //     }
// //   }, [open, reset]);

// //   useEffect(() => {
// //     if (!open) return;
// //     const onKeyDown = (e: KeyboardEvent) => {
// //       if (e.key === "Escape") onClose();
// //     };
// //     document.addEventListener("keydown", onKeyDown);
// //     return () => document.removeEventListener("keydown", onKeyDown);
// //   }, [open, onClose]);

// //   async function onSubmit(values: SignInValues) {
// //     setServerError(null);
// //     authLoading.show(); // full-page loading starts immediately
// //     try {
// //       const result = await signInAction(values);
// //       if (result?.error) {
// //         authLoading.hide();
// //         setServerError(result.error);
// //         return;
// //       }
// //       setRedirecting(true); // keep the page covered until the dashboard opens
// //     } catch {
// //       authLoading.hide();
// //       setServerError("Something went wrong. Please try again.");
// //     }
// //   }
// //     useEffect(() => {
// //     if (!open) return;
// //     const prev = document.body.style.overflow;
// //     document.body.style.overflow = "hidden";
// //     return () => {
// //       document.body.style.overflow = prev;
// //     };
// //   }, [open]);

// //   return (
// //     <AnimatePresence>
// //       {open && (
// //         <>
// //         <motion.div
// //   initial={{ opacity: 0 }}
// //   animate={{ opacity: 1 }}
// //   exit={{ opacity: 0 }}
// //   transition={{ duration: 0.2 }}
// //   className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
// //   onClick={onClose}
// //   aria-hidden="true"
// // />
// //           <div className=" pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-4">
// //             <motion.div
// //               initial={{ opacity: 0, y: 16, scale: 0.98 }}
// //               animate={{ opacity: 1, y: 0, scale: 1 }}
// //               exit={{ opacity: 0, y: 10, scale: 0.98 }}
// //               transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
// //               role="dialog"
// //               aria-modal="true"
// //               aria-labelledby="auth-modal-title"
// //               style={
// //                 {
// //                   colorScheme: "light",
// //                   "--color-cream": "#f7f1e7",
// //                   "--color-cream-soft": "#fbf8f3",
// //                   "--color-white": "#ffffff",
// //                   "--color-espresso": "#321e18",
// //                   "--color-espresso-deep": "#1f1512",
// //                   "--color-green": "#3e762f",
// //                   "--color-green-deep": "#234d2a",
// //                   "--color-green-bg": "#eef2e8",
// //                   "--color-copper": "#c98245",
// //                   "--color-copper-light": "#e0a56d",
// //                   "--color-red": "#b84e45",
// //                   "--color-warm-gray": "#756b62",
// //                   "--color-border": "#e6ded3",
// //                   "--color-border-strong": "#d8ccbe",
// //                 } as React.CSSProperties
// //               }
// //               className=" bg-pattern pointer-events-auto relative grid w-full max-w-[420px] overflow-hidden rounded-2xl border border-border-strong bg-cream-soft shadow-2xl lg:max-w-[880px] lg:grid-cols-[1.05fr_1fr]"
// //             >
             
             

// //               <button
// //                 type="button"
// //                 onClick={onClose}
// //                 aria-label="Close sign in"
// //                 className="absolute right-3 top-3 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-espresso/70 transition-colors hover:bg-green-bg hover:text-espresso lg:text-cream-soft/80 lg:hover:bg-white/10 lg:hover:text-white"
// //               >
// //                 <X className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
// //               </button>

// //               <div className="p-8 sm:p-10 lg:py-12">
// // <div className="flex flex-col items-center text-center">
               
// //                 <Link
// //                             href="/"
                          
// //                           >
                           
// //                             <Image
// //                               src="/brand/finasto-logo.png"
// //                               alt="Finasto"
// //                               width={120}
// //                               height={90}
// //                               priority
// //                               className="h-17 w-auto "
// //                             />
// //                           </Link>
// //                 <h2
// //                   id="auth-modal-title"
// //                   className="mt-4 font-display text-[30px] leading-tight text-green-deep"
// //                 >
// //                   Sign in
// //                 </h2>
// //                 <p className="mt-1.5 font-sans text-[13px] text-espresso/70">
// //                  Access Management
// //                 </p>
// //               </div>

// //               <form
// //                 onSubmit={handleSubmit(onSubmit)}
// //                 noValidate
// //                 className="mt-7 flex flex-col gap-4"
// //               >
// //                 {" "}
// //                 {serverError && (
// //                   <p
// //                     role="alert"
// //                     className="rounded-lg border border-red/30 bg-red/5 px-4 py-3 font-sans text-[13px] text-red"
// //                   >
// //                     {serverError}
// //                   </p>
// //                 )}
// //                 <Field
// //                   label="Email"
// //                   type="email"
// //                   autoComplete="email"
// //                   autoFocus
// //                   error={errors.email?.message}
// //                   {...register("email")}
// //                 />
// //                 <Field
// //                   label="Password"
// //                   type="password"
// //                   autoComplete="current-password"
// //                   error={errors.password?.message}
// //                   {...register("password")}
// //                 />
// //                 <div className="flex justify-end">
// //                   <Link
// //                     href="/forgot-password"
// //                     onClick={onClose}
// //                     className="font-sans text-[13px] text-espresso/70 underline-offset-4 transition-colors hover:text-green-deep hover:underline"
// //                   >
// //                     Forgot password?
// //                   </Link>
// //                 </div>
// //                 <button
// //                   type="submit"
// //              disabled={isSubmitting || redirecting}
// //                   className="mt-1 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-green-deep font-sans text-[15px] font-medium text-cream-soft transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
// //                 >
// //                   {(isSubmitting || redirecting) && <Loader2 className="h-4 w-4 animate-spin" />}
// //                   Sign in
// //                 </button>
// //               </form>
// //               </div>

// //               {/* Right brand panel */}
// //               <div className="relative hidden overflow-hidden rounded-l-[190px] bg-gradient-to-br from-green-deep via-[#1b3d22] to-espresso-deep lg:flex lg:flex-col lg:justify-center lg:pl-16 lg:pr-10">
// //                 {/* Optional leaf image: drop a file in /public/brand/ and uncomment
// //                 <Image
// //                   src="/brand/leaves.png"
// //                   alt=""
// //                   fill
// //                   sizes="440px"
// //                   className="object-cover opacity-40 mix-blend-soft-light"
// //                 />
// //                 */}
// //                 <svg
// //   aria-hidden="true"
// //   viewBox="0 0 300 500"
// //   preserveAspectRatio="xMidYMid slice"
// //   className="pointer-events-none absolute inset-0 h-full w-full"
// // >
// //   <path d="M300 40 C220 90 200 190 230 300 C290 260 310 140 300 40Z" fill="#0f2f1a" opacity="0.55" />
// //   <path d="M300 220 C230 270 215 370 245 480 C300 440 315 330 300 220Z" fill="#0c2615" opacity="0.5" />
// //   <path d="M120 0 C90 70 110 150 170 210 C190 130 170 50 120 0Z" fill="#2f6a3a" opacity="0.35" />
// //   <path d="M60 330 C90 390 150 420 210 430 C190 370 130 330 60 330Z" fill="#2f6a3a" opacity="0.3" />
// // </svg>
// //                 <div className="relative">
// //                   <p className="font-display text-[28px] leading-snug text-cream-soft">
// //                     Manage
// //                     <br />
// //                     Grow
// //                     <br />
// //                     Succeed
// //                   </p>
// //                   <span className="mt-3 block h-[2px] w-10 bg-copper" />
// //                 </div>
// //               </div>

              
// //             </motion.div>
// //           </div>
// //         </>
// //       )}
// //     </AnimatePresence>
// //   );
// // }

// // function Field({
// //   label,
// //   error,
// //   type,
// //   ...props
// // }: React.InputHTMLAttributes<HTMLInputElement> & {
// //   label: string;
// //   error?: string;
// // }) {
// //   return (
// //     <label className="flex flex-col gap-1.5">
// //       <span className="font-sans text-[13px] font-medium text-espresso">{label}</span>
// //       <input
// //         type={type}
// //         aria-invalid={!!error}
// //         className="h-12 rounded-lg border border-border-strong bg-white px-4 font-sans text-[15px] text-espresso outline-none transition-all placeholder:text-warm-gray/60 focus:border-copper focus:ring-2 focus:ring-copper/25 aria-[invalid=true]:border-red"
// //         {...props}
// //       />
// //       {error && (
// //         <span role="alert" className="font-sans text-[12px] text-red">
// //           {error}
// //         </span>
// //       )}
// //     </label>
// //   );
// // }

// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { AnimatePresence, motion } from "motion/react";
// import { X, Eye, EyeOff, Loader2 } from "lucide-react";
// import { signInAction } from "@/lib/auth/actions";
// import { useAuthLoading } from "@/components/AuthLoadingProvider";

// const signInSchema = z.object({
//   email: z.string().min(1, "Email is required").email("Enter a valid email"),
//   password: z.string().min(1, "Password is required"),
// });

// type SignInValues = z.infer<typeof signInSchema>;

// // Always render in the light brand palette, even when the site is in dark mode
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

// /**
//  * Full-page sign-in for Admin and Affiliate accounts only — customers check
//  * out as guests and never see this.
//  */
// export function AuthModal({
//   open,
//   onClose,
// }: {
//   open: boolean;
//   onClose: () => void;
// }) {
//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm<SignInValues>({
//     resolver: zodResolver(signInSchema),
//   });
//   const [serverError, setServerError] = useState<string | null>(null);
//   const [redirecting, setRedirecting] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const authLoading = useAuthLoading();

//   useEffect(() => {
//     if (!open) {
//       reset();
//       setServerError(null);
//       setShowPassword(false);
//     }
//   }, [open, reset]);

//   useEffect(() => {
//     if (!open) return;
//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     document.addEventListener("keydown", onKeyDown);
//     return () => document.removeEventListener("keydown", onKeyDown);
//   }, [open, onClose]);

//   useEffect(() => {
//     if (!open) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = prev;
//     };
//   }, [open]);

//   async function onSubmit(values: SignInValues) {
//     setServerError(null);
//     authLoading.show(); // full-page loading starts immediately
//     try {
//       const result = await signInAction(values);
//       if (result?.error) {
//         authLoading.hide();
//         setServerError(result.error);
//         return;
//       }
//       setRedirecting(true); // keep the page covered until the dashboard opens
//     } catch {
//       authLoading.hide();
//       setServerError("Something went wrong. Please try again.");
//     }
//   }

//   const busy = isSubmitting || redirecting;

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
//           role="dialog"
//           aria-modal="true"
//           aria-labelledby="auth-modal-title"
//           style={brandVars}
//           className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-white/75 backdrop-blur-2xl"
//         >
//           {/* ───────── FULL-PAGE BACKGROUND (soft, transparent) ───────── */}
//           <div
//             aria-hidden="true"
//             className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
//           >
//             <div className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-green/15 blur-[110px]" />
//             <div className="absolute -bottom-40 left-[20%] h-[420px] w-[420px] rounded-full bg-copper/15 blur-[120px]" />
//             <svg
//               viewBox="0 0 800 900"
//               preserveAspectRatio="xMidYMid slice"
//               className="absolute inset-0 h-full w-full"
//             >
//               <path d="M-30 90 C110 40 260 100 320 250 C190 300 40 270 -30 90Z" fill="#3e762f" opacity="0.07" />
//               <path d="M60 900 C30 780 120 680 300 650 C340 770 250 870 60 900Z" fill="#234d2a" opacity="0.08" />
//               <path d="M520 -10 C480 90 540 190 660 240 C700 140 640 40 520 -10Z" fill="#3e762f" opacity="0.06" />
//             </svg>
//           </div>

//           <div className="grid min-h-dvh lg:grid-cols-[1fr_1fr]">
//             {/* LEFT: form */}
//             <section className="relative flex items-center justify-center px-5 py-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-10">
//               <div className="w-full max-w-[400px]">
//                 <div className="flex flex-col items-center text-center">
//                   <Link href="/" onClick={onClose} aria-label="Finasto home">
//                     <Image
//                       src="/brand/finasto-logo.png"
//                       alt="Finasto"
//                       width={120}
//                       height={90}
//                       priority
//                       className="h-[68px] w-auto"
//                     />
//                   </Link>
//                   <h2
//                     id="auth-modal-title"
//                     className="mt-6 font-display text-[32px] leading-tight text-green-deep sm:text-[36px]"
//                   >
//                     Sign in
//                   </h2>
//                   <p className="mt-2 font-sans text-[14px] text-espresso/65">
//                     Access management
//                   </p>
//                   <span className="mt-5 block h-[2px] w-10 rounded-full bg-copper" />
//                 </div>

//                 <form
//                   onSubmit={handleSubmit(onSubmit)}
//                   noValidate
//                   className="mt-9 flex flex-col gap-5"
//                 >
//                   {serverError && (
//                     <p
//                       role="alert"
//                       className="rounded-xl border border-red/30 bg-red/5 px-4 py-3 font-sans text-[13px] leading-snug text-red"
//                     >
//                       {serverError}
//                     </p>
//                   )}

//                   <Field
//                     label="Email"
//                     type="email"
//                     autoComplete="email"
//                     autoFocus
//                     error={errors.email?.message}
//                     {...register("email")}
//                   />

//                   <Field
//                     label="Password"
//                     type={showPassword ? "text" : "password"}
//                     autoComplete="current-password"
//                     error={errors.password?.message}
//                     trailing={
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword((s) => !s)}
//                         aria-label={showPassword ? "Hide password" : "Show password"}
//                         className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-warm-gray transition-colors hover:bg-green-bg hover:text-green-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/50"
//                       >
//                         {showPassword ? (
//                           <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" />
//                         ) : (
//                           <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
//                         )}
//                       </button>
//                     }
//                     {...register("password")}
//                   />

//                   <div className="-mt-1 flex justify-end">
//                     <Link
//                       href="/forgot-password"
//                       onClick={onClose}
//                       className="rounded font-sans text-[13px] text-espresso/70 underline-offset-4 transition-colors hover:text-copper hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/50"
//                     >
//                       Forgot password?
//                     </Link>
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={busy}
//                     className="mt-1 flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-green-deep font-sans text-[15px] font-medium text-white shadow-[0_12px_28px_-10px_rgba(35,77,42,0.7),inset_0_1px_0_0_rgba(255,255,255,0.18)] transition-all hover:bg-green active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
//                   >
//                     {busy && <Loader2 className="h-4 w-4 animate-spin" />}
//                     Sign in
//                   </button>
//                 </form>
//               </div>
//             </section>

//             {/* RIGHT: brand panel (desktop only) */}
//             <section className="relative hidden overflow-hidden rounded-l-[160px] bg-gradient-to-br from-green-deep via-[#1b3d22] to-espresso-deep lg:flex lg:flex-col lg:justify-center lg:pl-20 lg:pr-12 xl:pl-28">
//               <svg
//                 aria-hidden="true"
//                 viewBox="0 0 300 500"
//                 preserveAspectRatio="xMidYMid slice"
//                 className="pointer-events-none absolute inset-0 h-full w-full"
//               >
//                 <path d="M300 40 C220 90 200 190 230 300 C290 260 310 140 300 40Z" fill="#0f2f1a" opacity="0.55" />
//                 <path d="M300 220 C230 270 215 370 245 480 C300 440 315 330 300 220Z" fill="#0c2615" opacity="0.5" />
//                 <path d="M120 0 C90 70 110 150 170 210 C190 130 170 50 120 0Z" fill="#2f6a3a" opacity="0.35" />
//                 <path d="M60 330 C90 390 150 420 210 430 C190 370 130 330 60 330Z" fill="#2f6a3a" opacity="0.3" />
//               </svg>
//               <div
//                 aria-hidden="true"
//                 className="pointer-events-none absolute -bottom-32 -right-24 h-[380px] w-[380px] rounded-full bg-copper/20 blur-[110px]"
//               />

//               <div className="relative">
//                 <p className="font-display text-[52px] leading-[1.08] text-white xl:text-[60px]">
//                   Manage
//                   <br />
//                   Grow
//                   <br />
//                   Succeed
//                 </p>
//                 <span className="mt-6 block h-[2px] w-14 rounded-full bg-copper" />
//                 <p className="mt-5 max-w-[280px] font-sans text-[15px] leading-relaxed text-white/70">
//                   Products, stock and pricing, all in one place.
//                 </p>
//               </div>
//             </section>
//           </div>

//           {/* Close */}
//           <button
//             type="button"
//             onClick={onClose}
//             aria-label="Close sign in"
//             className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-white/70 text-espresso/80 backdrop-blur transition-colors hover:bg-white hover:text-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/60 lg:right-6 lg:top-6 lg:border-white/25 lg:bg-white/10 lg:text-white lg:hover:bg-white/20 lg:hover:text-white"
//           >
//             <X className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
//           </button>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

// function Field({
//   label,
//   error,
//   trailing,
//   ...props
// }: React.InputHTMLAttributes<HTMLInputElement> & {
//   label: string;
//   error?: string;
//   trailing?: React.ReactNode;
// }) {
//   return (
//     <label className="flex flex-col gap-2">
//       <span className="font-sans text-[13px] font-medium text-espresso">
//         {label}
//       </span>
//       <span className="relative block">
//         <input
//           aria-invalid={!!error}
//           className={`h-[52px] w-full rounded-xl border border-border-strong bg-white/90 px-4 font-sans text-[16px] text-espresso shadow-[inset_0_1px_2px_rgba(50,30,24,0.04)] outline-none transition-all placeholder:text-warm-gray/60 hover:border-warm-gray/50 focus:border-copper focus:bg-white focus:ring-4 focus:ring-copper/20 aria-[invalid=true]:border-red aria-[invalid=true]:focus:ring-red/15 ${
//             trailing ? "pr-14" : ""
//           }`}
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
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

/**
 * Full-page sign-in for Admin and Affiliate accounts only — customers check
 * out as guests and never see this.
 */
export function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [intro, setIntro] = useState(false);
  const authLoading = useAuthLoading();

  useEffect(() => {
    if (!open) {
      reset();
      setServerError(null);
      setShowPassword(false);
    }
  }, [open, reset]);

  // Play the flower intro every time the sign-in opens, and always clear it
  useEffect(() => {
    if (!open) {
      setIntro(false);
      return;
    }
    setIntro(true);
    const t = setTimeout(
      () => setIntro(false),
      (SPLIT_AT + SPLIT_DURATION) * 1000 + 300,
    );
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function onSubmit(values: SignInValues) {
    setServerError(null);
    authLoading.show(); // full-page loading starts immediately
    try {
      const result = await signInAction(values);
      if (result?.error) {
        authLoading.hide();
        setServerError(result.error);
        return;
      }
      setRedirecting(true); // keep the page covered until the dashboard opens
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
  const fromRight = {
    hidden: { opacity: reduce ? 1 : 0, x: reduce ? 0 : 36 },
    show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          style={brandVars}
          className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-[#fbf8f3]"
        >
          {/* ───────── INTRO: FLOWER BLOOM, THEN SPLIT LEFT / RIGHT ───────── */}
          {intro && <FlowerIntro onDone={() => setIntro(false)} />}

          {/* ───────── BACKGROUND ───────── */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,#fffdf6_0%,#fbf8f3_50%,#f3ead6_100%)]" />
            <div
              className="absolute -left-40 top-1/2 h-[640px] w-[640px] -translate-y-1/2 rounded-full"
              style={{
                background: `radial-gradient(circle, ${GOLD}38 0%, ${GOLD}14 40%, transparent 70%)`,
              }}
            />
            <div className="absolute -bottom-40 left-[20%] h-[420px] w-[420px] rounded-full bg-green/10 blur-[120px]" />
            <div className="absolute inset-0 opacity-[0.5] [background-image:linear-gradient(to_right,rgba(184,134,43,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(184,134,43,0.08)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_30%_50%,black_10%,transparent_70%)]" />
          </div>

          <div className="grid min-h-dvh lg:grid-cols-[1fr_1fr]">
            {/* LEFT: form */}
            <section className="relative flex items-center justify-center px-5 py-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-10">
              <motion.div
                variants={stack}
                initial="hidden"
                animate="show"
                className="relative w-full max-w-[420px]"
              >
                {/* gold-bordered card with a rotating light */}
                <div className="relative overflow-hidden rounded-[28px] p-[1.5px] shadow-[0_30px_80px_-24px_rgba(184,134,43,0.45)]">
                  <motion.div
                    aria-hidden="true"
                    animate={reduce ? undefined : { rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute left-1/2 top-1/2 h-[220%] w-[220%] -translate-x-1/2 -translate-y-1/2"
                    style={{
                      background: `conic-gradient(from 0deg, transparent 0deg, ${GOLD_DEEP} 60deg, ${GOLD_LIGHT} 110deg, ${GOLD} 140deg, transparent 220deg, transparent 360deg)`,
                    }}
                  />
                  <div className="absolute inset-0 bg-[#e8c06a]/30" aria-hidden="true" />

                  <div className="relative rounded-[26.5px] bg-white/95 px-6 py-10 backdrop-blur-xl sm:px-9 sm:py-11">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#e8c06a] to-transparent"
                    />

                    <div className="flex flex-col items-center text-center">
                      <motion.div variants={rise}>
                        <Link href="/" onClick={onClose} aria-label="Finasto home">
                          <Image
                            src="/brand/finasto-logo.png"
                            alt="Finasto"
                            width={120}
                            height={90}
                            priority
                            className="h-[64px] w-auto"
                          />
                        </Link>
                      </motion.div>
                      <motion.h2
                        variants={rise}
                        id="auth-modal-title"
                        className="mt-6 bg-gradient-to-b from-[#234d2a] to-[#3e762f] bg-clip-text font-display text-[34px] leading-tight text-transparent sm:text-[38px]"
                      >
                        Sign in
                      </motion.h2>
                      <motion.p
                        variants={rise}
                        className="mt-2 font-sans text-[14px] text-espresso/65"
                      >
                        Access management
                      </motion.p>
                      <motion.span
                        variants={rise}
                        className="mt-5 block h-[2px] w-12 rounded-full bg-gradient-to-r from-[#fbe7a6] via-[#e8c06a] to-[#b8862b]"
                      />
                    </div>

                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      noValidate
                      className="mt-9 flex flex-col gap-5"
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
                          label="Email"
                          type="email"
                          autoComplete="email"
                          autoFocus
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
                          onClick={onClose}
                          className="rounded font-sans text-[13px] text-espresso/70 underline-offset-4 transition-colors hover:text-[#8a6420] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c06a]/70"
                        >
                          Forgot password?
                        </Link>
                      </motion.div>

                      <motion.div variants={rise}>
                        <button
                          type="submit"
                          disabled={busy}
                          className="group relative flex h-[54px] w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-[#fbe7a6] via-[#e8c06a] to-[#b8862b] font-sans text-[15px] font-semibold text-[#2a1a08] shadow-[0_14px_34px_-10px_rgba(184,134,43,0.8),inset_0_1px_0_0_rgba(255,255,255,0.65)] transition-all hover:brightness-105 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#234d2a] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {!reduce && (
                            <motion.span
                              aria-hidden="true"
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
                          )}
                          {busy && <Loader2 className="relative h-4 w-4 animate-spin" />}
                          <span className="relative">Sign in</span>
                        </button>
                      </motion.div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* RIGHT: brand panel (desktop only) */}
            <section className="relative hidden overflow-hidden rounded-l-[160px] bg-gradient-to-br from-green-deep via-[#143018] to-[#0b0806] lg:flex lg:flex-col lg:justify-center lg:pl-20 lg:pr-12 xl:pl-28">
              <svg
                aria-hidden="true"
                viewBox="0 0 300 500"
                preserveAspectRatio="xMidYMid slice"
                className="pointer-events-none absolute inset-0 h-full w-full"
              >
                <path d="M300 40 C220 90 200 190 230 300 C290 260 310 140 300 40Z" fill="#0f2f1a" opacity="0.55" />
                <path d="M300 220 C230 270 215 370 245 480 C300 440 315 330 300 220Z" fill="#0c2615" opacity="0.5" />
                <path d="M120 0 C90 70 110 150 170 210 C190 130 170 50 120 0Z" fill="#2f6a3a" opacity="0.35" />
                <path d="M60 330 C90 390 150 420 210 430 C190 370 130 330 60 330Z" fill="#2f6a3a" opacity="0.3" />
              </svg>
              {/* gold rings + glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-40 -right-32 h-[460px] w-[460px] rounded-full"
                style={{
                  background: `radial-gradient(circle, ${GOLD}40 0%, ${GOLD}12 45%, transparent 70%)`,
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-52 -right-44 h-[620px] w-[620px] rounded-full border border-[#e8c06a]/20"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#e8c06a]/60 to-transparent"
              />
              {!reduce &&
                [
                  { l: "18%", t: "20%", d: 0 },
                  { l: "70%", t: "16%", d: 1.3 },
                  { l: "30%", t: "82%", d: 2.2 },
                  { l: "82%", t: "66%", d: 0.7 },
                ].map((s, i) => (
                  <motion.span
                    key={i}
                    aria-hidden="true"
                    className="pointer-events-none absolute h-1 w-1 rounded-full bg-[#fbe7a6]"
                    style={{ left: s.l, top: s.t, boxShadow: `0 0 12px 3px ${GOLD}aa` }}
                    animate={{ opacity: [0, 1, 0], y: [0, -14, -28], scale: [0.6, 1.2, 0.6] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: CONTENT_DELAY + s.d,
                      ease: "easeInOut",
                    }}
                  />
                ))}

              <motion.div
                variants={stack}
                initial="hidden"
                animate="show"
                className="relative"
              >
                <motion.p
                  variants={fromRight}
                  className="bg-gradient-to-b from-white via-[#fbe7a6] to-[#e8c06a] bg-clip-text font-display text-[56px] leading-[1.06] text-transparent xl:text-[68px]"
                >
                  Manage
                  <br />
                  Grow
                  <br />
                  Succeed
                </motion.p>
                <motion.span
                  variants={fromRight}
                  className="mt-6 block h-[2px] w-16 rounded-full bg-gradient-to-r from-[#fbe7a6] to-[#b8862b]"
                />
                <motion.p
                  variants={fromRight}
                  className="mt-5 max-w-[300px] font-sans text-[15px] leading-relaxed text-white/70"
                >
                  Products, stock and pricing, all in one place.
                </motion.p>
              </motion.div>
            </section>
          </div>

          {/* Close (stays above the intro so it can always be dismissed) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in"
            className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-[70] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#e8c06a]/50 bg-white/80 text-espresso/80 shadow-[0_6px_20px_-8px_rgba(184,134,43,0.6)] backdrop-blur transition-colors hover:bg-white hover:text-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c06a] lg:right-6 lg:top-6 lg:border-[#e8c06a]/40 lg:bg-white/10 lg:text-[#fbe7a6] lg:hover:bg-white/20 lg:hover:text-white"
          >
            <X className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
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
        className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(ellipse_at_100%_50%,#1d3a22_0%,#0f1d12_55%,#0b0806_100%)]"
      >
        <span className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#e8c06a]/70 to-transparent" />
      </motion.div>
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: "101%" }}
        transition={{ duration: SPLIT_DURATION, delay: SPLIT_AT, ease: [0.76, 0, 0.24, 1] }}
        onAnimationComplete={onDone}
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
          className="relative h-[220px] w-[220px] sm:h-[260px] sm:w-[260px]"
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
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-sans text-[13px] font-medium text-espresso">
        {label}
      </span>
      <span className="relative block">
        <input
          aria-invalid={!!error}
          className={`h-[52px] w-full rounded-xl border border-border-strong bg-white px-4 font-sans text-[16px] text-espresso shadow-[inset_0_1px_2px_rgba(50,30,24,0.04)] outline-none transition-all placeholder:text-warm-gray/60 hover:border-[#e8c06a] focus:border-[#b8862b] focus:ring-4 focus:ring-[#e8c06a]/30 aria-[invalid=true]:border-red aria-[invalid=true]:focus:ring-red/15 ${
            trailing ? "pr-14" : ""
          }`}
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