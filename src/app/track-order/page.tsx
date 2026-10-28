import type { Metadata } from "next";
import {
  ClipboardCheck,
  Globe2,
  PackageSearch,
  Truck,
} from "lucide-react";
import { TrackOrderClient } from "../../components/track-order/track-order-client";

export const metadata: Metadata = {
  title: "Track Your Order — Finasto",
  description:
    "Check the status of your Finasto order, anywhere in the world, using your email and tracking code.",
};

const steps = [
  {
    icon: PackageSearch,
    title: "Enter your details",
    text: "Email and tracking code from your confirmation.",
  },
  {
    icon: ClipboardCheck,
    title: "See your status",
    text: "From packed and shipped to out for delivery.",
  },
  {
    icon: Truck,
    title: "Delivered worldwide",
    text: "From Bali to your door, in any country.",
  },
] as const;

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; email?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex-1 bg-cream-soft py-12 sm:py-16">
      <div className="mx-auto max-w-[960px] px-5 sm:px-8">
       

        {/* Header */}
        <div className="mx-auto mt-12 max-w-xl text-center">
          <p className="inline-flex items-center gap-2 font-sans text-xs font-medium uppercase tracking-[0.22em] text-copper">
            <Globe2 className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
            Worldwide Order Tracking
          </p>
          <h1 className="mt-3 font-display text-[32px] leading-tight text-espresso md:text-[44px]">
            Where is your order?
          </h1>
          <br />
          
        </div>
         {/* Icons on top */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute left-[16.66%] right-[16.66%] top-7 hidden h-px bg-border-strong sm:block"
          />
          <ol className="relative grid grid-cols-3 gap-2 sm:gap-8">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li
                key={title}
                className="flex flex-col items-center text-center"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-copper/40 bg-green-bg shadow-[0_4px_14px_rgba(50,30,24,0.08)]">
                  <Icon
                    className="h-6 w-6 text-green-deep"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-copper font-sans text-[11px] font-semibold text-[#24110a]">
                    {i + 1}
                  </span>
                </div>
                <p className="mt-3 font-sans text-[12px] font-medium leading-snug text-espresso sm:text-[14px]">
                  {title}
                </p>
                <p className="mt-1 hidden max-w-[220px] font-sans text-[13px] leading-snug text-warm-gray sm:block">
                  {text}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Form / result */}
        <div className="mx-auto mt-10 max-w-[560px]">
          <TrackOrderClient
            initialCode={params.code ?? ""}
            initialEmail={params.email ?? ""}
          />
        </div>
      </div>
    </main>
  );
}