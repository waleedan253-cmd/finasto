import type { Metadata } from "next";
import {
  ClipboardCheck,
  Globe2,
  PackageSearch,
  Truck,
} from "lucide-react";
import { TrackOrderClient } from "../../components/track-order/track-order-client";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/home/site-footer";

export const metadata: Metadata = {
  title: "Track Your Order — Finasto",
  description:
    "Check the status of your Finasto order, anywhere in the world, using your email and tracking code.",
};

const steps = [
  {
    icon: PackageSearch,
    title: "Enter your details",
    text: "Enter your email and tracking code from your confirmation email.",
  },
  {
    icon: ClipboardCheck,
    title: "Track Your Order",
    text: "Follow your order's journey from processing and dispatch to delivery.",
  },
  {
    icon: Truck,
    title: "Worldwide Delivery",
    text: "From Indonesia to Your Doorstep Across the World.",
  },
] as const;

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; email?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex-1 bg-pattern">
      <AnnouncementBar />
            <SiteHeader />
      {/* ───────── HERO ───────── */}
      <section className=" relative isolate overflow-hidden bg-gradient-to-br from-green-deep via-[#17391f] to-espresso-deep pb-32 pt-16 sm:pb-40 sm:pt-24">
        {/* ambient glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-green/40 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-[-8%] -z-10 h-[460px] w-[460px] rounded-full bg-copper/25 blur-[130px]"
        />
        {/* leaf shapes + contour lines */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 520"
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
        >
          <path d="M-40 60 C120 20 300 70 380 230 C220 280 40 240 -40 60Z" fill="#2f6a3a" opacity="0.26" />
          <path d="M1440 80 C1300 130 1240 270 1280 420 C1420 370 1480 230 1440 80Z" fill="#0c2615" opacity="0.5" />
          <path d="M700 -20 C650 80 720 190 860 240 C910 130 840 20 700 -20Z" fill="#2f6a3a" opacity="0.18" />
          <path d="M-120 400 C240 330 480 470 860 360 S1380 250 1600 330" fill="none" stroke="#8cc79a" strokeOpacity="0.18" />
          <path d="M-120 450 C260 390 520 520 900 410 S1400 310 1600 380" fill="none" stroke="#e0a56d" strokeOpacity="0.16" />
        </svg>
        {/* fine grid */}
        <div
          aria-hidden="true"
          className=" pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]"
        />

        <div className=" mx-auto max-w-[960px] px-5 text-center sm:px-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-copper-light/30 bg-copper/10 px-4 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-copper-light">
            <Globe2 className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
            Worldwide Order Tracking
          </p>
          <h1 className="mt-6 font-display text-[38px] leading-[1.05] text-white md:text-[56px]">
            Where is your order?
          </h1>
          <span
            aria-hidden="true"
            className="mx-auto mt-6 block h-[2px] w-14 rounded-full bg-gradient-to-r from-copper-light to-copper"
          />
          <p className="mx-auto mt-6 max-w-[460px] font-sans text-[15px] leading-relaxed text-white/70 md:text-[16px]">
            Enter your email and tracking code to follow your Finasto order,
            wherever in the world it is headed.
          </p>
        </div>
      </section>

      {/* ───────── FORM / RESULT (overlaps the hero) ───────── */}
      <div className=" relative mx-auto -mt-24 max-w-[560px] px-5 sm:-mt-28 sm:px-8">
        <TrackOrderClient
          initialCode={params.code ?? ""}
          initialEmail={params.email ?? ""}
        />
      </div>

      {/* ───────── HOW IT WORKS ───────── */}
      <section
        aria-labelledby="how-it-works"
        className="mx-auto max-w-[960px] px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24"
      >
        <div className="text-center">
          <h2
            id="how-it-works"
            className="font-sans text-[12px] font-medium uppercase tracking-[0.22em] text-copper"
          >
            How it works
          </h2>
          <span
            aria-hidden="true"
            className="mx-auto mt-3 block h-px w-10 bg-copper/60"
          />
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li
              key={title}
              className="group relative rounded-[22px] border border-border bg-white px-6 py-8 text-center shadow-[0_10px_30px_-18px_rgba(50,30,24,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-copper/40 hover:shadow-[0_22px_44px_-20px_rgba(35,77,42,0.35)]"
            >
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-copper/40 bg-green-bg shadow-[0_4px_14px_rgba(50,30,24,0.08)] transition-colors duration-300 group-hover:bg-green-deep">
                <Icon
                  className="h-6 w-6 text-green-deep transition-colors duration-300 group-hover:text-white"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-copper font-sans text-[11px] font-semibold text-[#24110a]">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-sans text-[15px] font-medium text-espresso">
                {title}
              </h3>
              <p className="mx-auto mt-2 max-w-[230px] font-sans text-[13px] leading-relaxed text-warm-gray">
                {text}
              </p>
            </li>
          ))}
        </ol>
      
      </section>
         <SiteFooter />
    </main>
  );
}