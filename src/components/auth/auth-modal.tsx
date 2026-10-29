// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { AnimatePresence, motion } from "motion/react";
// import { X, Loader2 } from "lucide-react";
// import { signInAction } from "@/lib/auth/actions";
// import { useAuthLoading } from "@/components/AuthLoadingProvider";

// const signInSchema = z.object({
//   email: z.string().min(1, "Email is required").email("Enter a valid email"),
//   password: z.string().min(1, "Password is required"),
// });

// type SignInValues = z.infer<typeof signInSchema>;

// /**
//  * Sign-in modal for Admin and Affiliate accounts only — customers check
//  * out as guests and never see this. UI/validation is fully functional;
//  * the actual submit handler is a stub until Supabase Auth is wired in
//  * the backend/auth step, so it never claims a successful sign-in.
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
//  const [serverError, setServerError] = useState<string | null>(null);
// const [redirecting, setRedirecting] = useState(false);
// const authLoading = useAuthLoading();

//   useEffect(() => {
//     if (!open) {
//       reset();
//       setServerError(null);
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
//     useEffect(() => {
//     if (!open) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = prev;
//     };
//   }, [open]);

//   return (
//     <AnimatePresence>
//       {open && (
//         <>
//         <motion.div
//   initial={{ opacity: 0 }}
//   animate={{ opacity: 1 }}
//   exit={{ opacity: 0 }}
//   transition={{ duration: 0.2 }}
//   className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
//   onClick={onClose}
//   aria-hidden="true"
// />
//           <div className=" pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0, y: 16, scale: 0.98 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: 10, scale: 0.98 }}
//               transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
//               role="dialog"
//               aria-modal="true"
//               aria-labelledby="auth-modal-title"
//               style={
//                 {
//                   colorScheme: "light",
//                   "--color-cream": "#f7f1e7",
//                   "--color-cream-soft": "#fbf8f3",
//                   "--color-white": "#ffffff",
//                   "--color-espresso": "#321e18",
//                   "--color-espresso-deep": "#1f1512",
//                   "--color-green": "#3e762f",
//                   "--color-green-deep": "#234d2a",
//                   "--color-green-bg": "#eef2e8",
//                   "--color-copper": "#c98245",
//                   "--color-copper-light": "#e0a56d",
//                   "--color-red": "#b84e45",
//                   "--color-warm-gray": "#756b62",
//                   "--color-border": "#e6ded3",
//                   "--color-border-strong": "#d8ccbe",
//                 } as React.CSSProperties
//               }
//               className=" bg-pattern pointer-events-auto relative grid w-full max-w-[420px] overflow-hidden rounded-2xl border border-border-strong bg-cream-soft shadow-2xl lg:max-w-[880px] lg:grid-cols-[1.05fr_1fr]"
//             >
             
             

//               <button
//                 type="button"
//                 onClick={onClose}
//                 aria-label="Close sign in"
//                 className="absolute right-3 top-3 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-espresso/70 transition-colors hover:bg-green-bg hover:text-espresso lg:text-cream-soft/80 lg:hover:bg-white/10 lg:hover:text-white"
//               >
//                 <X className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
//               </button>

//               <div className="p-8 sm:p-10 lg:py-12">
// <div className="flex flex-col items-center text-center">
               
//                 <Link
//                             href="/"
                          
//                           >
                           
//                             <Image
//                               src="/brand/finasto-logo.png"
//                               alt="Finasto"
//                               width={120}
//                               height={90}
//                               priority
//                               className="h-17 w-auto "
//                             />
//                           </Link>
//                 <h2
//                   id="auth-modal-title"
//                   className="mt-4 font-display text-[30px] leading-tight text-green-deep"
//                 >
//                   Sign in
//                 </h2>
//                 <p className="mt-1.5 font-sans text-[13px] text-espresso/70">
//                  Access Management
//                 </p>
//               </div>

//               <form
//                 onSubmit={handleSubmit(onSubmit)}
//                 noValidate
//                 className="mt-7 flex flex-col gap-4"
//               >
//                 {" "}
//                 {serverError && (
//                   <p
//                     role="alert"
//                     className="rounded-lg border border-red/30 bg-red/5 px-4 py-3 font-sans text-[13px] text-red"
//                   >
//                     {serverError}
//                   </p>
//                 )}
//                 <Field
//                   label="Email"
//                   type="email"
//                   autoComplete="email"
//                   autoFocus
//                   error={errors.email?.message}
//                   {...register("email")}
//                 />
//                 <Field
//                   label="Password"
//                   type="password"
//                   autoComplete="current-password"
//                   error={errors.password?.message}
//                   {...register("password")}
//                 />
//                 <div className="flex justify-end">
//                   <Link
//                     href="/forgot-password"
//                     onClick={onClose}
//                     className="font-sans text-[13px] text-espresso/70 underline-offset-4 transition-colors hover:text-green-deep hover:underline"
//                   >
//                     Forgot password?
//                   </Link>
//                 </div>
//                 <button
//                   type="submit"
//              disabled={isSubmitting || redirecting}
//                   className="mt-1 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-green-deep font-sans text-[15px] font-medium text-cream-soft transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
//                 >
//                   {(isSubmitting || redirecting) && <Loader2 className="h-4 w-4 animate-spin" />}
//                   Sign in
//                 </button>
//               </form>
//               </div>

//               {/* Right brand panel */}
//               <div className="relative hidden overflow-hidden rounded-l-[190px] bg-gradient-to-br from-green-deep via-[#1b3d22] to-espresso-deep lg:flex lg:flex-col lg:justify-center lg:pl-16 lg:pr-10">
//                 {/* Optional leaf image: drop a file in /public/brand/ and uncomment
//                 <Image
//                   src="/brand/leaves.png"
//                   alt=""
//                   fill
//                   sizes="440px"
//                   className="object-cover opacity-40 mix-blend-soft-light"
//                 />
//                 */}
//                 <svg
//   aria-hidden="true"
//   viewBox="0 0 300 500"
//   preserveAspectRatio="xMidYMid slice"
//   className="pointer-events-none absolute inset-0 h-full w-full"
// >
//   <path d="M300 40 C220 90 200 190 230 300 C290 260 310 140 300 40Z" fill="#0f2f1a" opacity="0.55" />
//   <path d="M300 220 C230 270 215 370 245 480 C300 440 315 330 300 220Z" fill="#0c2615" opacity="0.5" />
//   <path d="M120 0 C90 70 110 150 170 210 C190 130 170 50 120 0Z" fill="#2f6a3a" opacity="0.35" />
//   <path d="M60 330 C90 390 150 420 210 430 C190 370 130 330 60 330Z" fill="#2f6a3a" opacity="0.3" />
// </svg>
//                 <div className="relative">
//                   <p className="font-display text-[28px] leading-snug text-cream-soft">
//                     Manage
//                     <br />
//                     Grow
//                     <br />
//                     Succeed
//                   </p>
//                   <span className="mt-3 block h-[2px] w-10 bg-copper" />
//                 </div>
//               </div>

              
//             </motion.div>
//           </div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }

// function Field({
//   label,
//   error,
//   type,
//   ...props
// }: React.InputHTMLAttributes<HTMLInputElement> & {
//   label: string;
//   error?: string;
// }) {
//   return (
//     <label className="flex flex-col gap-1.5">
//       <span className="font-sans text-[13px] font-medium text-espresso">{label}</span>
//       <input
//         type={type}
//         aria-invalid={!!error}
//         className="h-12 rounded-lg border border-border-strong bg-white px-4 font-sans text-[15px] text-espresso outline-none transition-all placeholder:text-warm-gray/60 focus:border-copper focus:ring-2 focus:ring-copper/25 aria-[invalid=true]:border-red"
//         {...props}
//       />
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
import { AnimatePresence, motion } from "motion/react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { signInAction } from "@/lib/auth/actions";
import { useAuthLoading } from "@/components/AuthLoadingProvider";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type SignInValues = z.infer<typeof signInSchema>;

// Always render in the light brand palette, even when the site is in dark mode
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
  const authLoading = useAuthLoading();

  useEffect(() => {
    if (!open) {
      reset();
      setServerError(null);
      setShowPassword(false);
    }
  }, [open, reset]);

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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          style={brandVars}
          className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-white/75 backdrop-blur-2xl"
        >
          {/* ───────── FULL-PAGE BACKGROUND (soft, transparent) ───────── */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-green/15 blur-[110px]" />
            <div className="absolute -bottom-40 left-[20%] h-[420px] w-[420px] rounded-full bg-copper/15 blur-[120px]" />
            <svg
              viewBox="0 0 800 900"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 h-full w-full"
            >
              <path d="M-30 90 C110 40 260 100 320 250 C190 300 40 270 -30 90Z" fill="#3e762f" opacity="0.07" />
              <path d="M60 900 C30 780 120 680 300 650 C340 770 250 870 60 900Z" fill="#234d2a" opacity="0.08" />
              <path d="M520 -10 C480 90 540 190 660 240 C700 140 640 40 520 -10Z" fill="#3e762f" opacity="0.06" />
            </svg>
          </div>

          <div className="grid min-h-dvh lg:grid-cols-[1fr_1fr]">
            {/* LEFT: form */}
            <section className="relative flex items-center justify-center px-5 py-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-10">
              <div className="w-full max-w-[400px]">
                <div className="flex flex-col items-center text-center">
                  <Link href="/" onClick={onClose} aria-label="Finasto home">
                    <Image
                      src="/brand/finasto-logo.png"
                      alt="Finasto"
                      width={120}
                      height={90}
                      priority
                      className="h-[68px] w-auto"
                    />
                  </Link>
                  <h2
                    id="auth-modal-title"
                    className="mt-6 font-display text-[32px] leading-tight text-green-deep sm:text-[36px]"
                  >
                    Sign in
                  </h2>
                  <p className="mt-2 font-sans text-[14px] text-espresso/65">
                    Access management
                  </p>
                  <span className="mt-5 block h-[2px] w-10 rounded-full bg-copper" />
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="mt-9 flex flex-col gap-5"
                >
                  {serverError && (
                    <p
                      role="alert"
                      className="rounded-xl border border-red/30 bg-red/5 px-4 py-3 font-sans text-[13px] leading-snug text-red"
                    >
                      {serverError}
                    </p>
                  )}

                  <Field
                    label="Email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    error={errors.email?.message}
                    {...register("email")}
                  />

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
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-warm-gray transition-colors hover:bg-green-bg hover:text-green-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/50"
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

                  <div className="-mt-1 flex justify-end">
                    <Link
                      href="/forgot-password"
                      onClick={onClose}
                      className="rounded font-sans text-[13px] text-espresso/70 underline-offset-4 transition-colors hover:text-copper hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/50"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-1 flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-green-deep font-sans text-[15px] font-medium text-white shadow-[0_12px_28px_-10px_rgba(35,77,42,0.7),inset_0_1px_0_0_rgba(255,255,255,0.18)] transition-all hover:bg-green active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    Sign in
                  </button>
                </form>
              </div>
            </section>

            {/* RIGHT: brand panel (desktop only) */}
            <section className="relative hidden overflow-hidden rounded-l-[160px] bg-gradient-to-br from-green-deep via-[#1b3d22] to-espresso-deep lg:flex lg:flex-col lg:justify-center lg:pl-20 lg:pr-12 xl:pl-28">
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
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-32 -right-24 h-[380px] w-[380px] rounded-full bg-copper/20 blur-[110px]"
              />

              <div className="relative">
                <p className="font-display text-[52px] leading-[1.08] text-white xl:text-[60px]">
                  Manage
                  <br />
                  Grow
                  <br />
                  Succeed
                </p>
                <span className="mt-6 block h-[2px] w-14 rounded-full bg-copper" />
                <p className="mt-5 max-w-[280px] font-sans text-[15px] leading-relaxed text-white/70">
                  Products, stock and pricing, all in one place.
                </p>
              </div>
            </section>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in"
            className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-white/70 text-espresso/80 backdrop-blur transition-colors hover:bg-white hover:text-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/60 lg:right-6 lg:top-6 lg:border-white/25 lg:bg-white/10 lg:text-white lg:hover:bg-white/20 lg:hover:text-white"
          >
            <X className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
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
          className={`h-[52px] w-full rounded-xl border border-border-strong bg-white/90 px-4 font-sans text-[16px] text-espresso shadow-[inset_0_1px_2px_rgba(50,30,24,0.04)] outline-none transition-all placeholder:text-warm-gray/60 hover:border-warm-gray/50 focus:border-copper focus:bg-white focus:ring-4 focus:ring-copper/20 aria-[invalid=true]:border-red aria-[invalid=true]:focus:ring-red/15 ${
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