"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { updatePasswordAction } from "@/lib/auth/password-actions";

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters").max(72),
    confirm: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  });
type Values = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setServerError(null);
    const result = await updatePasswordAction({ password: values.password });
    if (result?.error) setServerError(result.error);
  }

  const input =
    "h-12 rounded-lg border border-border bg-white px-4 font-sans text-[15px] text-espresso outline-none transition-colors focus:border-copper";

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
        <span className="font-sans text-[13px] text-espresso/80">
          New password
        </span>
        <input
          type="password"
          autoComplete="new-password"
          className={input}
          {...register("password")}
        />
        {errors.password && (
          <span role="alert" className="font-sans text-[12px] text-red">
            {errors.password.message}
          </span>
        )}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-sans text-[13px] text-espresso/80">
          Confirm password
        </span>
        <input
          type="password"
          autoComplete="new-password"
          className={input}
          {...register("confirm")}
        />
        {errors.confirm && (
          <span role="alert" className="font-sans text-[12px] text-red">
            {errors.confirm.message}
          </span>
        )}
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-espresso font-sans text-[15px] text-cream transition-colors hover:bg-espresso-deep disabled:opacity-70"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Update password
      </button>
    </form>
  );
}
