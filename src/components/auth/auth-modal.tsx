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
            className="fixed inset-0 z-[60]"
            onClick={onClose}
            aria-hidden="true"
          >
            <Image
              src="/brand/Good Things.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
          <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-4 lg:justify-end lg:pr-24">
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
              className="pointer-events-auto relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-border-strong bg-cream-soft p-8 shadow-2xl sm:p-10"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-copper via-copper-light to-copper"
              />
             

              <button
                type="button"
                onClick={onClose}
                aria-label="Close sign in"
                className="absolute right-3 top-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-espresso/70 transition-colors hover:bg-green-bg hover:text-espresso"
              >
                <X className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
              </button>

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
