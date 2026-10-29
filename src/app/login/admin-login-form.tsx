"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
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

const GOLD_LIGHT = "#fbe7a6";
const GOLD = "#e8c06a";
const GOLD_DEEP = "#b8862b";

// Intro timeline (seconds)
const BLOOM_PETAL_STAGGER = 0.09; // petals open one after another
const BLOOM_END = 1.45; // flower fully open, then holds briefly
const SPLIT_AT = 1.75; // the two halves start sliding apart
const SPLIT_DURATION = 1.0;
const CONTENT_DELAY = SPLIT_AT + 0.35;

const PETALS = 12;

export function AdminLoginForm() {
  const reduce = useReducedMotion();
  const [intro, setIntro] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  // Safety net: always remove the intro overlay once the animation is over
  useEffect(() => {
    const t = setTimeout(
      () => setIntro(false),
      (SPLIT_AT + SPLIT_DURATION) * 1000 + 300,
    );
    return () => clearTimeout(t);
  }, []);

  async function onSubmit(values: Values) {
    setServerError(null);
    try {
      const result = await signInAction({ ...values, next: "/admin" });
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      setRedirecting(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  const busy = isSubmitting || redirecting;
  const startDelay = CONTENT_DELAY; // intro always plays, so content waits for it

  const stack = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.08,
        delayChildren: startDelay,
      },
    },
  };
  const rise = {
    hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  };
  const fromLeft = {
    hidden: { opacity: reduce ? 1 : 0, x: reduce ? 0 : -36 },
    show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
  };
  const fromRight = {
    hidden: { opacity: reduce ? 1 : 0, x: reduce ? 0 : 36 },
    show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE } },
  };

  return (
    <main
      style={brandVars}
      className="relative isolate min-h-dvh overflow-hidden bg-[#0b0806]"
    >
      {/* ───────── INTRO: FLOWER BLOOM, THEN SPLIT LEFT / RIGHT ───────── */}
      {intro && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
        >
          {/* left half */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-101%" }}
            transition={{ duration: SPLIT_DURATION, delay: SPLIT_AT, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(ellipse_at_100%_50%,#1d3a22_0%,#0f1d12_55%,#0b0806_100%)]"
          >
            <span className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#e8c06a]/70 to-transparent" />
          </motion.div>
          {/* right half */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "101%" }}
            transition={{ duration: SPLIT_DURATION, delay: SPLIT_AT, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => setIntro(false)}
            className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_0%_50%,#1d3a22_0%,#0f1d12_55%,#0b0806_100%)]"
          >
            <span className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#e8c06a]/70 to-transparent" />
          </motion.div>

          {/* flower */}
          <div className="absolute inset-0 grid place-items-center">
            <motion.div
              initial={{ scale: 0.85, opacity: 1, rotate: -20 }}
              animate={{
                scale: [0.85, 1, 1, 2.4],
                opacity: [1, 1, 1, 0],
                rotate: [-20, 0, 0, 25],
              }}
              transition={{
                duration: SPLIT_AT + 0.45,
                times: [0, BLOOM_END / (SPLIT_AT + 0.45), SPLIT_AT / (SPLIT_AT + 0.45), 1],
                ease: "easeInOut",
              }}
              className="relative h-[220px] w-[220px] sm:h-[260px] sm:w-[260px]"
            >
              {/* glow behind flower */}
              <motion.div
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: EASE }}
                className="absolute inset-[-40%] rounded-full"
                style={{
                  background: `radial-gradient(circle, ${GOLD}55 0%, ${GOLD}1a 40%, transparent 68%)`,
                }}
              />
              <svg viewBox="0 0 200 200" className="relative h-full w-full overflow-visible">
                <defs>
                  <linearGradient id="petal-gold" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor={GOLD_DEEP} />
                    <stop offset="55%" stopColor={GOLD} />
                    <stop offset="100%" stopColor={GOLD_LIGHT} />
                  </linearGradient>
                  <radialGradient id="core-gold" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#fff6d6" />
                    <stop offset="60%" stopColor={GOLD} />
                    <stop offset="100%" stopColor={GOLD_DEEP} />
                  </radialGradient>
                </defs>

                {/* outer ring draws itself */}
                <motion.circle
                  cx="100"
                  cy="100"
                  r="96"
                  fill="none"
                  stroke={GOLD}
                  strokeOpacity="0.55"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: EASE }}
                />

                {/* petals */}
                <g transform="translate(100 100)">
                  {Array.from({ length: PETALS }).map((_, i) => (
                    <g key={i} transform={`rotate(${(360 / PETALS) * i})`}>
                      <motion.path
                        d="M0 0 C-17 -22 -15 -56 0 -80 C15 -56 17 -22 0 0Z"
                        fill="url(#petal-gold)"
                        fillOpacity={i % 2 === 0 ? 0.95 : 0.7}
                        stroke={GOLD_LIGHT}
                        strokeOpacity="0.6"
                        strokeWidth="0.6"
                        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.8,
                          delay: 0.15 + i * BLOOM_PETAL_STAGGER,
                          ease: EASE,
                        }}
                      />
                    </g>
                  ))}
                  {/* inner petal layer, rotated half step */}
                  {Array.from({ length: PETALS }).map((_, i) => (
                    <g key={`in-${i}`} transform={`rotate(${(360 / PETALS) * i + 360 / PETALS / 2})`}>
                      <motion.path
                        d="M0 0 C-10 -14 -9 -34 0 -48 C9 -34 10 -14 0 0Z"
                        fill={GOLD_LIGHT}
                        fillOpacity="0.9"
                        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.7,
                          delay: 0.7 + i * 0.05,
                          ease: EASE,
                        }}
                      />
                    </g>
                  ))}
                  {/* core */}
                  <motion.circle
                    r="11"
                    fill="url(#core-gold)"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.0, ease: EASE }}
                  />
                </g>
              </svg>
            </motion.div>
          </div>
        </div>
      )}

      {/* ───────── BACKGROUND ───────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_0%,#1d3a22_0%,#0f1d12_40%,#0b0806_80%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-10%] top-1/2 -z-10 h-[min(900px,150vw)] w-[min(900px,150vw)] -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${GOLD}2e 0%, ${GOLD}12 38%, transparent 68%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-10%] top-1/2 -z-10 h-[min(720px,130vw)] w-[min(720px,130vw)] -translate-y-1/2 rounded-full border border-[#e8c06a]/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-10%] top-1/2 -z-10 h-[min(1080px,190vw)] w-[min(1080px,190vw)] -translate-y-1/2 rounded-full border border-[#e8c06a]/[0.08]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_72%)]"
      />
      {!reduce &&
        [
          { l: "10%", t: "20%", d: 0 },
          { l: "42%", t: "14%", d: 1.2 },
          { l: "24%", t: "80%", d: 2.1 },
          { l: "90%", t: "74%", d: 0.6 },
          { l: "58%", t: "88%", d: 1.8 },
        ].map((s, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute -z-10 h-1 w-1 rounded-full bg-[#fbe7a6]"
            style={{ left: s.l, top: s.t, boxShadow: `0 0 12px 3px ${GOLD}aa` }}
            animate={{ opacity: [0, 1, 0], y: [0, -14, -28], scale: [0.6, 1.2, 0.6] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: CONTENT_DELAY + s.d,
              ease: "easeInOut",
            }}
          />
        ))}

      {/* ───────── TWO SECTIONS ───────── */}
      <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
        {/* LEFT: brand */}
        <section className="relative hidden lg:flex lg:flex-col lg:justify-center lg:px-16 xl:px-28">
          <motion.div
            variants={stack}
            initial="hidden"
            animate="show"
            className="max-w-[480px]"
          >
            <motion.span
              variants={fromLeft}
              className="inline-flex items-center gap-2 rounded-full border border-[#e8c06a]/30 bg-[#e8c06a]/10 px-3.5 py-1.5 font-sans text-[11px] font-medium tracking-[0.2em] text-[#fbe7a6]"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              ADMIN CONSOLE
            </motion.span>

            <motion.h2
              variants={fromLeft}
              className="mt-7 bg-gradient-to-b from-white via-[#fbe7a6] to-[#e8c06a] bg-clip-text font-display text-[60px] leading-[1.04] text-transparent xl:text-[76px]"
            >
              Manage
              <br />
              Grow
              <br />
              Succeed
            </motion.h2>

            <motion.span
              variants={fromLeft}
              className="mt-8 block h-[2px] w-16 rounded-full bg-gradient-to-r from-[#fbe7a6] to-[#b8862b]"
            />

            <motion.p
              variants={fromLeft}
              className="mt-6 max-w-[340px] font-sans text-[16px] leading-relaxed text-white/65"
            >
              Products, stock and pricing, all in one place.
            </motion.p>

            <motion.ul variants={fromLeft} className="mt-8 flex flex-col gap-3">
              {["Products", "Stock", "Pricing"].map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-3 font-sans text-[14px] text-white/75"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#fbe7a6]"
                    style={{ boxShadow: `0 0 10px 2px ${GOLD}99` }}
                  />
                  {t}
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </section>

        {/* RIGHT: sign in */}
        <section className="relative flex items-center justify-center px-4 py-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8 lg:bg-white/[0.025] lg:px-12">
          {/* gold divider between the two sections */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-[#e8c06a]/50 to-transparent lg:block"
          />

          <motion.div
            variants={stack}
            initial="hidden"
            animate="show"
            className="relative w-full max-w-[440px]"
          >
            <motion.div
              variants={fromRight}
              className="relative overflow-hidden rounded-[30px] p-[1.5px] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8),0_0_80px_-20px_rgba(232,192,106,0.35)]"
            >
              {/* rotating gold border light */}
              <motion.div
                aria-hidden="true"
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                className="absolute left-1/2 top-1/2 h-[220%] w-[220%] -translate-x-1/2 -translate-y-1/2"
                style={{
                  background: `conic-gradient(from 0deg, transparent 0deg, ${GOLD_DEEP} 60deg, ${GOLD_LIGHT} 110deg, ${GOLD} 140deg, transparent 220deg, transparent 360deg)`,
                }}
              />
              <div className="absolute inset-0 rounded-[30px] bg-[#e8c06a]/25" aria-hidden="true" />

              <div className="relative rounded-[28.5px] bg-[linear-gradient(160deg,#16231a_0%,#0f1511_45%,#120d0a_100%)] px-6 py-10 sm:px-10 sm:py-12">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#fbe7a6]/70 to-transparent"
                />

                {/* header */}
                <div className="flex flex-col items-center text-center">
                  <motion.div variants={rise}>
                    <Link href="/" aria-label="Finasto home" className="block">
                      <Image
                        src="/brand/finasto-logo.png"
                        alt="Finasto"
                        width={120}
                        height={90}
                        priority
                        className="h-[64px] w-auto brightness-0 invert"
                      />
                    </Link>
                  </motion.div>

                  <motion.h1
                    variants={rise}
                    className="mt-6 bg-gradient-to-b from-white via-[#fbe7a6] to-[#e8c06a] bg-clip-text font-display text-[36px] leading-tight text-transparent sm:text-[40px]"
                  >
                    Admin sign in
                  </motion.h1>
                  <motion.p
                    variants={rise}
                    className="mt-2 font-sans text-[14px] text-white/60"
                  >
                    Authorized personnel only
                  </motion.p>
                  <motion.span
                    variants={rise}
                    className="mt-5 block h-[2px] w-12 rounded-full bg-gradient-to-r from-[#fbe7a6] to-[#b8862b]"
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
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-[#fbe7a6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c06a]/60"
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
                      className="rounded font-sans text-[13px] text-white/65 underline-offset-4 transition-colors hover:text-[#fbe7a6] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c06a]/60"
                    >
                      Forgot password?
                    </Link>
                  </motion.div>

                  <motion.div variants={rise}>
                    <button
                      type="submit"
                      disabled={busy}
                      className="group relative flex h-[54px] w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-[#fbe7a6] via-[#e8c06a] to-[#b8862b] font-sans text-[15px] font-semibold text-[#2a1a08] shadow-[0_14px_36px_-8px_rgba(232,192,106,0.6),inset_0_1px_0_0_rgba(255,255,255,0.6)] transition-all hover:brightness-105 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1511] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {!reduce && (
                        <motion.span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                          initial={{ left: "-40%" }}
                          animate={{ left: "140%" }}
                          transition={{
                            duration: 1.4,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatDelay: 3.2,
                            delay: CONTENT_DELAY + 1,
                          }}
                        />
                      )}
                      {busy && <Loader2 className="relative h-4 w-4 animate-spin" />}
                      <span className="relative">
                        {redirecting ? "Opening dashboard" : "Sign in"}
                      </span>
                    </button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </main>
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
      <span className="font-sans text-[13px] font-medium text-white/85">
        {label}
      </span>
      <span className="relative block">
        <input
          aria-invalid={!!error}
          className={`h-[52px] w-full rounded-xl border border-white/15 bg-white/[0.05] px-4 font-sans text-[16px] text-white outline-none transition-all placeholder:text-white/35 hover:border-[#e8c06a]/40 focus:border-[#e8c06a] focus:bg-white/[0.09] focus:ring-4 focus:ring-[#e8c06a]/20 aria-[invalid=true]:border-[#f2a39b] aria-[invalid=true]:focus:ring-[#f2a39b]/20 [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] ${
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