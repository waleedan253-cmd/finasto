"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { signInAction } from "@/lib/auth/actions";
import { useAuthLoading } from "@/components/AuthLoadingProvider";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type SignInValues = z.infer<typeof signInSchema>;

/**
 * Sign-in modal for Admin and Affiliate accounts only — customers check
 * out as guests and never see this. UI/validation is fully functional;
 * the actual submit handler is a stub until Supabase Auth is wired in
 * the backend/auth step, so it never claims a successful sign-in.
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
const authLoading = useAuthLoading();

  useEffect(() => {
    if (!open) {
      reset();
      setServerError(null);
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
    useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
        <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
  className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
  onClick={onClose}
  aria-hidden="true"
/>
          <div className=" pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
              style={
                {
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
                } as React.CSSProperties
              }
              className=" bg-pattern pointer-events-auto relative grid w-full max-w-[420px] overflow-hidden rounded-2xl border border-border-strong bg-cream-soft shadow-2xl lg:max-w-[880px] lg:grid-cols-[1.05fr_1fr]"
            >
             
             

              <button
                type="button"
                onClick={onClose}
                aria-label="Close sign in"
                className="absolute right-3 top-3 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-espresso/70 transition-colors hover:bg-green-bg hover:text-espresso lg:text-cream-soft/80 lg:hover:bg-white/10 lg:hover:text-white"
              >
                <X className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
              </button>

              <div className="p-8 sm:p-10 lg:py-12">
<div className="flex flex-col items-center text-center">
               
                <Link
                            href="/"
                          
                          >
                           
                            <Image
                              src="/brand/finasto-logo.png"
                              alt="Finasto"
                              width={120}
                              height={90}
                              priority
                              className="h-17 w-auto "
                            />
                          </Link>
                <h2
                  id="auth-modal-title"
                  className="mt-4 font-display text-[30px] leading-tight text-green-deep"
                >
                  Sign in
                </h2>
                <p className="mt-1.5 font-sans text-[13px] text-espresso/70">
                 Access Management
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="mt-7 flex flex-col gap-4"
              >
                {" "}
                {serverError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red/30 bg-red/5 px-4 py-3 font-sans text-[13px] text-red"
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
                  type="password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register("password")}
                />
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    onClick={onClose}
                    className="font-sans text-[13px] text-espresso/70 underline-offset-4 transition-colors hover:text-green-deep hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <button
                  type="submit"
             disabled={isSubmitting || redirecting}
                  className="mt-1 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-green-deep font-sans text-[15px] font-medium text-cream-soft transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {(isSubmitting || redirecting) && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign in
                </button>
              </form>
              </div>

              {/* Right brand panel */}
              <div className="relative hidden overflow-hidden rounded-l-[190px] bg-gradient-to-br from-green-deep via-[#1b3d22] to-espresso-deep lg:flex lg:flex-col lg:justify-center lg:pl-16 lg:pr-10">
                {/* Optional leaf image: drop a file in /public/brand/ and uncomment
                <Image
                  src="/brand/leaves.png"
                  alt=""
                  fill
                  sizes="440px"
                  className="object-cover opacity-40 mix-blend-soft-light"
                />
                */}
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
                <div className="relative">
                  <p className="font-display text-[28px] leading-snug text-cream-soft">
                    Manage
                    <br />
                    Grow
                    <br />
                    Succeed
                  </p>
                  <span className="mt-3 block h-[2px] w-10 bg-copper" />
                </div>
              </div>

              
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  error,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-sans text-[13px] font-medium text-espresso">{label}</span>
      <input
        type={type}
        aria-invalid={!!error}
        className="h-12 rounded-lg border border-border-strong bg-white px-4 font-sans text-[15px] text-espresso outline-none transition-all placeholder:text-warm-gray/60 focus:border-copper focus:ring-2 focus:ring-copper/25 aria-[invalid=true]:border-red"
        {...props}
      />
      {error && (
        <span role="alert" className="font-sans text-[12px] text-red">
          {error}
        </span>
      )}
    </label>
  );
}
