"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { requestResetAction } from "@/lib/auth/password-actions";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});
type Values = z.infer<typeof schema>;

export function ForgotPasswordForm({
  linkExpired = false,
}: {
  linkExpired?: boolean;
}) {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setServerError(null);
    const result = await requestResetAction(values);
    if ("error" in result) setServerError(result.error);
    else setSent(true);
  }

  return (
    <div className="grid w-full max-w-[420px] overflow-hidden rounded-2xl border border-border-strong bg-cream-soft shadow-2xl lg:max-w-[880px] lg:grid-cols-[1.05fr_1fr]">
      {/* Left: form */}
      <div className="p-8 sm:p-10 lg:py-12">
        <div className="flex flex-col items-center text-center">
          <Link href="/">
            <Image
              src="/brand/finasto-logo.png"
              alt="Finasto"
              width={120}
              height={90}
              priority
              className="h-17 w-auto"
            />
          </Link>
          <h1 className="mt-4 font-display text-[30px] leading-tight text-green-deep">
            Forgot password
          </h1>
          <p className="mt-1.5 font-sans text-[13px] text-espresso/70">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {linkExpired && !sent && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-red/30 bg-red/5 px-4 py-3 text-center font-sans text-[13px] text-red"
          >
            That link is invalid or expired. Request a new one.
          </p>
        )}

        {sent ? (
          <p
            role="status"
            className="mt-7 rounded-lg border border-border bg-white px-4 py-4 text-center font-sans text-[14px] leading-relaxed text-espresso"
          >
            If an account exists for that email, a reset link is on its way.
            Check your inbox (and spam).
          </p>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-7 flex flex-col gap-4"
          >
            {serverError && (
              <p
                role="alert"
                className="rounded-lg border border-red/30 bg-red/5 px-4 py-3 font-sans text-[13px] text-red"
              >
                {serverError}
              </p>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-[13px] font-medium text-espresso">
                Email
              </span>
              <input
                type="email"
                autoComplete="email"
                autoFocus
                aria-invalid={!!errors.email}
                className="h-12 rounded-lg border border-border-strong bg-white px-4 font-sans text-[15px] text-espresso outline-none transition-all placeholder:text-warm-gray/60 focus:border-copper focus:ring-2 focus:ring-copper/25 aria-[invalid=true]:border-red"
                {...register("email")}
              />
              {errors.email && (
                <span role="alert" className="font-sans text-[12px] text-red">
                  {errors.email.message}
                </span>
              )}
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-green-deep font-sans text-[15px] font-medium text-cream-soft transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Send reset link
            </button>
          </form>
        )}

        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-sans text-[13px] text-espresso/70 underline-offset-4 transition-colors hover:text-green-deep hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Right: brand panel */}
      <div className="relative hidden overflow-hidden rounded-l-[190px] bg-gradient-to-br from-green-deep via-[#1b3d22] to-espresso-deep lg:flex lg:flex-col lg:justify-center lg:pl-16 lg:pr-10">
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
            Reset
            <br />
            Your
            <br />
            Password
          </p>
          <span className="mt-3 block h-[2px] w-10 bg-copper" />
        </div>
      </div>
    </div>
  );
}