"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signInAction } from "@/lib/auth/actions";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type Values = z.infer<typeof schema>;

// Always render in the brand palette, even when the site is in light mode
const brandVars = {
  colorScheme: "dark",
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

// Thin contour lines that draw themselves across the green background
const LINES = [
  "M-120 760 C240 640 480 840 860 690 S1380 520 1600 620",
  "M-120 820 C260 710 520 900 900 750 S1400 590 1600 690",
  "M-120 880 C280 780 560 960 940 810 S1420 660 1600 760",
  "M-100 120 C200 20 440 180 760 90 S1240 -40 1560 60",
  "M-100 70 C220 -20 460 130 780 40 S1260 -80 1580 10",
];

export function AdminLoginForm() {
  const reduce = useReducedMotion();
  const [serverError, setServerError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setServerError(null);
    try {
      const result = await signInAction({ ...values, next: "/admin" });
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      setRedirecting(true); // keep the button locked while the dashboard opens
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  const busy = isSubmitting || redirecting;

  // Page-open sequence (skipped entirely when reduced motion is on)
  const stack = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.08,
        delayChildren: reduce ? 0 : 0.3,
      },
    },
  };
  const rise = {
    hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  };
  const draw = {
    hidden: { scaleX: reduce ? 1 : 0 },
    show: { scaleX: 1, transition: { duration: 0.7, ease: EASE } },
  };

  return (
    <motion.main
      style={brandVars}
      initial={{ opacity: reduce ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative isolate min-h-dvh overflow-hidden bg-[#122a18]"
    >
      {/* ───────── FULL-PAGE GREEN BACKGROUND ───────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-green-deep via-[#17391f] to-espresso-deep"
      />
      {/* ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-[-10%] -z-10 h-[520px] w-[520px] rounded-full bg-green/40 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 right-[-10%] -z-10 h-[560px] w-[560px] rounded-full bg-copper/25 blur-[140px]"
      />
      {/* leaf shapes */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      >
        <path d="M-40 120 C120 60 300 120 380 300 C220 360 40 320 -40 120Z" fill="#2f6a3a" opacity="0.28" />
        <path d="M120 900 C80 740 200 600 420 560 C470 720 360 860 120 900Z" fill="#0f2f1a" opacity="0.55" />
        <path d="M760 -20 C700 120 780 260 940 320 C1000 180 920 40 760 -20Z" fill="#2f6a3a" opacity="0.22" />
        <path d="M1440 140 C1300 190 1240 330 1280 480 C1420 430 1480 290 1440 140Z" fill="#0c2615" opacity="0.5" />
        <path d="M1440 560 C1330 610 1290 740 1330 880 C1430 830 1470 700 1440 560Z" fill="#0f2f1a" opacity="0.55" />
      </svg>
      {/* contour lines, drawn on page open */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      >
        {LINES.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke={i % 2 === 0 ? "#8cc79a" : "#e0a56d"}
            strokeOpacity={i % 2 === 0 ? 0.22 : 0.18}
            strokeWidth={1}
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, delay: 0.2 + i * 0.15, ease: EASE }}
          />
        ))}
      </svg>
      {/* fine grid lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.09] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_78%)]"
      />

      {/* ───────── CONTENT ───────── */}
      <div className="grid min-h-dvh lg:grid-cols-[1.15fr_1fr]">
        {/* LEFT: brand statement (desktop only) */}
        <section className="relative hidden lg:flex lg:flex-col lg:justify-center lg:px-16 xl:px-28">
          <motion.div
            variants={stack}
            initial="hidden"
            animate="show"
            className="max-w-[460px]"
          >
            <motion.p
              variants={rise}
              className="font-sans text-[12px] font-medium tracking-[0.2em] text-copper-light"
            >
              ADMIN CONSOLE
            </motion.p>
            <motion.h2
              variants={rise}
              className="mt-6 font-display text-[56px] leading-[1.05] text-white xl:text-[68px]"
            >
              Manage
              <br />
              Grow
              <br />
              Succeed
            </motion.h2>
            <motion.span
              variants={draw}
              className="mt-8 block h-[2px] w-14 origin-left rounded-full bg-copper"
            />
            <motion.p
              variants={rise}
              className="mt-6 max-w-[320px] font-sans text-[16px] leading-relaxed text-white/70"
            >
              Products, stock and pricing, all in one place.
            </motion.p>
          </motion.div>
        </section>

        {/* RIGHT: glass panel */}
        <section className="flex items-center justify-center px-4 py-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8 lg:p-0">
          <motion.div
            initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="w-full max-w-[440px] rounded-[28px] border border-white/15 bg-white/[0.07] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.18)] backdrop-blur-2xl backdrop-saturate-150 lg:flex lg:min-h-dvh lg:max-w-none lg:items-center lg:justify-center lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l-white/15 lg:bg-white/[0.06] lg:shadow-none"
          >
            <motion.div
              variants={stack}
              initial="hidden"
              animate="show"
              className="w-full px-6 py-10 sm:px-10 sm:py-12 lg:max-w-[460px] lg:px-0"
            >
              {/* header */}
              <div className="flex flex-col items-center text-center">
                <motion.div variants={rise}>
                  <Link href="/" aria-label="Finasto home" className="block">
                    {/* no background: logo is rendered white so it reads on green */}
                    <Image
                      src="/brand/finasto-logo.png"
                      alt="Finasto"
                      width={120}
                      height={90}
                      priority
                      className="h-[72px] w-auto brightness-0 invert"
                    />
                  </Link>
                </motion.div>
                <motion.h1
                  variants={rise}
                  className="mt-6 font-display text-[34px] leading-tight text-white sm:text-[38px]"
                >
                  Admin sign in
                </motion.h1>
                <motion.p
                  variants={rise}
                  className="mt-2 font-sans text-[14px] text-white/65"
                >
                  Authorized personnel only
                </motion.p>
                <motion.span
                  variants={draw}
                  className="mt-5 block h-[2px] w-12 origin-center rounded-full bg-copper"
                />
              </div>

              {/* form */}
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
                      className="rounded-xl border border-[#f2a39b]/30 bg-[#b84e45]/15 px-4 py-3 font-sans text-[13px] leading-snug text-[#ffc9c3]"
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
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-light/60"
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
                    className="rounded font-sans text-[13px] text-white/70 underline-offset-4 transition-colors hover:text-copper-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-light/60"
                  >
                    Forgot password?
                  </Link>
                </motion.div>

                <motion.div variants={rise}>
                  <button
                    type="submit"
                    disabled={busy}
                    className="group relative flex h-[54px] w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-copper-light to-copper font-sans text-[15px] font-semibold text-espresso-deep shadow-[0_12px_32px_-8px_rgba(201,130,69,0.65),inset_0_1px_0_0_rgba(255,255,255,0.45)] transition-all hover:brightness-105 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-green-deep disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%] group-disabled:hidden"
                    />
                    {busy && <Loader2 className="relative h-4 w-4 animate-spin" />}
                    <span className="relative">
                      {redirecting ? "Opening dashboard" : "Sign in"}
                    </span>
                  </button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </motion.main>
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
      <span className="font-sans text-[13px] font-medium text-white/90">
        {label}
      </span>
      <span className="relative block">
        <input
          aria-invalid={!!error}
          className={`h-[52px] w-full rounded-xl border border-white/20 bg-white/[0.08] px-4 font-sans text-[16px] text-white outline-none backdrop-blur-sm transition-all placeholder:text-white/40 hover:border-white/30 focus:border-copper-light focus:bg-white/[0.12] focus:ring-4 focus:ring-copper/20 aria-[invalid=true]:border-[#f2a39b] aria-[invalid=true]:focus:ring-[#f2a39b]/20 [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] ${
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
        <span role="alert" className="font-sans text-[12px] text-[#ffb3ab]">
          {error}
        </span>
      )}
    </label>
  );
}