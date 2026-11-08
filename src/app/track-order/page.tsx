import type { Metadata } from "next";
import Image from "next/image";
import { Globe2 } from "lucide-react";
import { TrackOrderClient } from "../../components/track-order/track-order-client";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { StepsList } from "../../components/track-order/steps-list";

export const metadata: Metadata = {
  title: "Track Your Order — Finasto",
  description:
    "Check the status of your Finasto order, anywhere in the world, using your email and tracking code.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

// Put your hero photo at /public/images/track-hero.jpg (min 1920x1080 recommended)
const HERO_IMAGE = "/images/track-hero.jpg";



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

      {/* ───────── HERO: image background, steps left, tracker right ───────── */}
      <section className="relative isolate overflow-hidden">
        {/* background image */}
        <Image
          src="/hero/Global Shipping in Transit.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
        {/* dark overlay for text contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-br from-green-deep/90 via-[#17391f]/80 to-espresso-deep/90"
        />
        {/* soft copper glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-[-8%] -z-10 h-[460px] w-[460px] rounded-full bg-copper/25 blur-[130px]"
        />

        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:py-16 lg:min-h-[calc(100vh-140px)]">
          {/* LEFT: heading + how it works */}
          <div>
            <h1 className="inline-flex items-center gap-2 rounded-full border border-copper-light/30 bg-copper/10 px-4 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-copper-light">
              <Globe2 className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
              Worldwide Order Tracking
            </h1>
            <p className="mt-5 font-display text-[40px] leading-[1.05] text-white md:text-[52px]">
              Where is your order?
            </p>
            <span
              aria-hidden="true"
              className="mt-5 block h-[2px] w-14 rounded-full bg-gradient-to-r from-copper-light to-copper"
            />
            <p className="mt-5 max-w-[460px] font-sans text-[15px] leading-relaxed text-white/75 md:text-[16px]">
              Enter your email and tracking code to follow your Finasto order,
              wherever in the world it is headed.
            </p>

            <h2
              id="how-it-works"
              className="mt-8 font-sans text-[12px] font-medium uppercase tracking-[0.22em] text-copper-light"
            >
              How it works
            </h2>

          <StepsList />
          </div>

          {/* RIGHT: track form / result */}
          <div className="mx-auto w-full max-w-[520px] lg:ml-auto">
            <TrackOrderClient
              initialCode={params.code ?? ""}
              initialEmail={params.email ?? ""}
            />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}