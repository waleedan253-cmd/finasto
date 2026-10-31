"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "motion/react";
import {
  CheckCircle2,
  ChevronDown,
  Loader2,
  Lock,
  Send,
} from "lucide-react";
import {
  contactSchema,
  type ContactValues,
} from "@/lib/contact/contact-schema";
import { contactContent, contactTopics } from "@/lib/contact/contact-content";
import { submitContactAction } from "@/lib/contact/contact-actions";

const EASE = [0.22, 1, 0.36, 1] as const;
const MAX_MESSAGE = 2000;

const inputBase =
  "w-full rounded-xl border border-border-strong bg-cream-soft/70 px-4 font-sans text-[15px] text-espresso outline-none transition-all placeholder:text-warm-gray/55 hover:border-warm-gray/50 focus:border-copper focus:bg-white focus:ring-4 focus:ring-copper/15 aria-[invalid=true]:border-red aria-[invalid=true]:focus:ring-red/15";

export function ContactForm() {
  const reduce = useReducedMotion();
  const [startedAt] = useState(() => Date.now());
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      topic: "general",
      message: "",
      consent: false,
      website: "",
    },
  });

  const messageLength = watch("message")?.length ?? 0;

  async function onSubmit(values: ContactValues) {
    setServerError(null);
    try {
      const result = await submitContactAction({ ...values, startedAt });
      if (result.success) {
        setSent(true);
        reset();
      } else {
        setServerError(result.error);
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  const enter = {
    initial: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE },
  };

  const cardClass =
    "relative overflow-hidden rounded-[28px] border border-copper/25 bg-white p-6 shadow-[0_30px_80px_-24px_rgba(35,77,42,0.45),0_0_0_6px_rgba(255,255,255,0.35)] sm:p-10";

  if (sent) {
    return (
      <motion.div {...enter} role="status" className={cardClass}>
        <div className="flex flex-col items-center py-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-bg text-green-deep">
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-display text-[28px] leading-tight text-espresso">
            Message sent
          </h2>
          <p className="mt-2 max-w-[340px] font-sans text-[14px] leading-relaxed text-warm-gray">
            Thank you for getting in touch. {contactContent.responseNote}
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            style={{ cursor: "pointer" }}
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-border-strong bg-white px-5 py-2.5 font-sans text-[13px] font-medium text-espresso transition-all hover:-translate-y-0.5 hover:border-copper/50 hover:text-green-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/50"
          >
            Send another message
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      {...enter}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cardClass}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-copper-light to-transparent"
      />

      <h2 className="font-display text-[26px] leading-tight text-espresso sm:text-[30px]">
        Send us a message
      </h2>
      <p className="mt-1.5 font-sans text-[13px] text-warm-gray">
        Fields marked * are required.
      </p>

      {serverError && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-6 rounded-xl border border-red/25 bg-red/5 px-4 py-3 font-sans text-[13px] leading-relaxed text-red"
        >
          {serverError}
        </motion.div>
      )}

      <div className="mt-7 flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name *" error={errors.name?.message}>
            {(id, describedBy) => (
              <input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={!!errors.name}
                autoComplete="name"
                placeholder="Your name"
                className={`${inputBase} h-[52px]`}
                {...register("name")}
              />
            )}
          </Field>

          <Field label="Email address *" error={errors.email?.message}>
            {(id, describedBy) => (
              <input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={!!errors.email}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`${inputBase} h-[52px]`}
                {...register("email")}
              />
            )}
          </Field>
        </div>

        <Field label="Topic *" error={errors.topic?.message}>
          {(id, describedBy) => (
            <div className="relative">
              <select 
                id={id}
                aria-describedby={describedBy}
                aria-invalid={!!errors.topic}
                className={`${inputBase} h-[52px]  cursor-pointer appearance-none pr-11 `}
                {...register("topic")}
              >
                {contactTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>
          )}
        </Field>

        <Field
          label="Message *"
          error={errors.message?.message}
          hint={`${messageLength} / ${MAX_MESSAGE}`}
        >
          {(id, describedBy) => (
            <textarea
              id={id}
              aria-describedby={describedBy}
              aria-invalid={!!errors.message}
              rows={6}
              maxLength={MAX_MESSAGE}
              placeholder="How can we help?"
              className={`${inputBase} resize-y py-3.5 leading-relaxed`}
              {...register("message")}
            />
          )}
        </Field>

        {/* honeypot: hidden from people, bots fill it in */}
        <div
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
        >
          <label>
            Website
            <input
              tabIndex={-1}
              autoComplete="off"
              {...register("website")}
            />
          </label>
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              aria-invalid={!!errors.consent}
              className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded border-border-strong accent-green-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/50"
              {...register("consent")}
            />
            <span className="font-sans text-[13px] leading-relaxed text-espresso/80">
              I agree that Finasto may use my details to reply to this message.
              See our{" "}
              <Link
                href={contactContent.privacyHref}
                className="text-green-deep underline underline-offset-2 hover:text-copper"
              >
                privacy policy
              </Link>
              .
            </span>
          </label>
          {errors.consent && (
            <p role="alert" className="mt-2 font-sans text-[12px] text-red">
              {errors.consent.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        style={{ cursor: "pointer" }}
        className="group relative mt-7 inline-flex h-[54px] w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-green to-green-deep font-sans text-[15px] font-medium text-white shadow-[0_14px_32px_-10px_rgba(35,77,42,0.75),inset_0_1px_0_0_rgba(255,255,255,0.22)] transition-all hover:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%] group-disabled:hidden"
        />
        {isSubmitting ? (
          <Loader2 className="relative h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="relative h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        )}
        <span className="relative">
          {isSubmitting ? "Sending..." : "Send message"}
        </span>
      </button>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center font-sans text-[12px] text-warm-gray">
        <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} aria-hidden="true" />
        {contactContent.responseNote}
      </p>
    </motion.form>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: (id: string, describedBy: string | undefined) => React.ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="font-sans text-[13px] font-medium text-espresso"
        >
          {label}
        </label>
        {hint && (
          <span className="font-sans text-[11px] tabular-nums text-warm-gray">
            {hint}
          </span>
        )}
      </div>
      {children(id, error ? errorId : undefined)}
      {error && (
        <p id={errorId} role="alert" className="mt-2 font-sans text-[12px] text-red">
          {error}
        </p>
      )}
    </div>
  );
}