"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { requestResetAction } from "@/lib/auth/password-actions";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});
type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
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

  if (sent) {
    return (
      <p
        role="status"
        className="rounded-lg border border-border bg-cream-soft px-4 py-4 text-center font-sans text-[14px] leading-relaxed text-espresso"
      >
        If an account exists for that email, a reset link is on its way. Check
        your inbox (and spam).
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
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
        <span className="font-sans text-[13px] text-espresso/80">Email</span>
        <input
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          className="h-12 rounded-lg border border-border bg-white px-4 font-sans text-[15px] text-espresso outline-none transition-colors focus:border-copper"
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
        className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-espresso font-sans text-[15px] text-cream transition-colors hover:bg-espresso-deep disabled:opacity-70"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Send reset link
      </button>
    </form>
  );
}
