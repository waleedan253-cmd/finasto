"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "motion/react";
import { X, Loader2 } from "lucide-react";

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

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function onSubmit() {
    // TODO(auth step): replace with Supabase Auth sign-in and role-based
    // redirect (admin -> /admin, affiliate -> /affiliate/dashboard).
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-espresso-deep/45"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
              className="relative w-full max-w-[420px] rounded-2xl border border-border bg-cream-soft p-8 shadow-2xl"
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sign in"
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center text-espresso/70 transition-colors hover:text-espresso"
              >
                <X
                  className="h-5 w-5"
                  strokeWidth={1.6}
                  style={{
                    cursor: "pointer",
                  }}
                />
              </button>

              <div className="flex flex-col items-center text-center">
                <Image
                  src="/brand/finasto-logo.png"
                  alt="Finasto"
                  width={72}
                  height={54}
                  className="h-14 w-auto"
                />
                <h2
                  id="auth-modal-title"
                  className="mt-4 font-display text-[28px] text-espresso"
                >
                  Sign in
                </h2>
                <p className="mt-1 font-sans text-[13px] text-warm-gray">
                  For Finasto Admin and Affiliate accounts
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="mt-7 flex flex-col gap-4"
              >
                <Field
                  label="Email"
                  type="email"
                  autoComplete="email"
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
                  <button
                    type="button"
                    className="font-sans text-[13px] text-warm-gray transition-colors hover:text-espresso"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-espresso font-sans text-[15px] text-cream transition-colors hover:bg-espresso-deep disabled:opacity-70"
                  style={{
                    cursor: "pointer",
                  }}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign in
                </button>
              </form>

              <p className="mt-5 text-center font-sans text-[12px] leading-relaxed text-warm-gray">
                Not an admin or affiliate? You don&apos;t need an account — just
                shop and check out as a guest.
              </p>
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
      <span className="font-sans text-[13px] text-espresso/80">{label}</span>
      <input
        type={type}
        aria-invalid={!!error}
        className="h-12 rounded-lg border border-border bg-white px-4 font-sans text-[15px] text-espresso outline-none transition-colors focus:border-copper"
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
