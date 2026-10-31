"use client";

import { useId, useState, useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Hash, Loader2, Lock, Mail, PackageSearch, Search } from "lucide-react";
import { lookupOrderStatusAction } from "../../lib/track-order/track-order-actions";
import type { OrderStatusResult } from "@/lib/track-order/track-order-queries";
import { TrackOrderResult } from "@/components/track-order/track-order-result";

const EASE = [0.22, 1, 0.36, 1] as const;

export function TrackOrderClient({
  initialCode,
  initialEmail,
}: {
  initialCode: string;
  initialEmail: string;
}) {
  const reduce = useReducedMotion();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(initialCode);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderStatusResult | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await lookupOrderStatusAction({
        email,
        trackingCode: code,
      });
      if (result.success) {
        setOrder(result.order);
      } else {
        setOrder(null);
        setError(result.error);
      }
    });
  }

  const enter = {
    initial: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE },
  };

  if (order) {
    return (
      <motion.div {...enter}>
        <TrackOrderResult order={order} />
        <button
          style={{ cursor: "pointer" }}
          type="button"
          onClick={() => setOrder(null)}
          className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-pattern px-5 py-2.5 font-sans text-[13px] font-medium text-espresso shadow-[0_6px_18px_-10px_rgba(50,30,24,0.35)] transition-all hover:-translate-y-0.5 hover:border-copper/50 hover:text-green-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/50"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          Track another order
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      {...enter}
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-[28px] border border-copper/25 bg-white p-6 shadow-[0_30px_80px_-24px_rgba(35,77,42,0.45),0_0_0_6px_rgba(255,255,255,0.35)] sm:p-10"
    >
      {/* top accent line */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-copper-light to-transparent"
      />

      {/* header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-copper/40 bg-green-bg shadow-[0_4px_14px_rgba(50,30,24,0.08)]">
        <PackageSearch
        
            className="h-6 w-6 text-green-deep"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <h2 className="mt-4 font-display text-[26px] leading-tight text-espresso sm:text-[30px]">
          Find your order
        </h2>
        <p className="mt-1.5 font-sans text-[13px] text-warm-gray">
          It only takes a moment.
        </p>
      </div>

      {error && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-6 rounded-xl border border-red/25 bg-red/5 px-4 py-3 font-sans text-[13px] leading-relaxed text-red"
        >
          {error}
        </motion.div>
      )}

      <div className="mt-7 flex flex-col gap-5">
        <Field
          label="Email Address"
          icon={<Mail className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" />}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <Field
          label="Tracking Code"
          icon={<Hash className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" />}
          required
          mono
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="FIN-20261103-A7K2"
          hint="Find your tracking code in your order confirmation email."
        />
      </div>

      <button
        style={{ cursor: "pointer" }}
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="group relative mt-7 inline-flex h-[54px] w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-green to-green-deep font-sans text-[15px] font-medium text-white shadow-[0_14px_32px_-10px_rgba(35,77,42,0.75),inset_0_1px_0_0_rgba(255,255,255,0.22)] transition-all hover:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {/* shine sweep */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%] group-disabled:hidden"
        />
        {isPending ? (
          <Loader2 className="relative h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Search className="relative h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        )}
        <span className="relative">
          {isPending ? "Searching..." : "Track My Order"}
        </span>
      </button>

      <p className="mt-5 flex items-center justify-center gap-1.5 font-sans text-[12px] text-warm-gray">
        <Lock className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
        Your information is used only to find your order.
      </p>
    </motion.form>
  );
}

function Field({
  label,
  icon,
  hint,
  mono = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: React.ReactNode;
  hint?: string;
  mono?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-sans text-[13px] font-medium text-espresso"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-warm-gray">
          {icon}
        </span>
        <input
          id={id}
          className={`h-[52px] w-full rounded-xl border border-border-strong bg-cream-soft/70 pl-12 pr-4 text-[15px] text-espresso outline-none transition-all placeholder:text-warm-gray/55 hover:border-warm-gray/50 focus:border-copper focus:bg-white focus:ring-4 focus:ring-copper/15 ${
            mono ? "font-mono tracking-wider" : "font-sans"
          }`}
          {...props}
        />
      </div>
      {hint && (
        <p className="mt-2 font-sans text-[12px] text-warm-gray">{hint}</p>
      )}
    </div>
  );
}