"use client";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePointerActive } from "@/app/hooks/usePointerActive";
import {
  ChevronDown,
  Globe2,
  Mail,
  MessageSquareText,
  PackageSearch,
    type LucideIcon,
} from "lucide-react";
import { contactContent as c } from "@/lib/contact/contact-content";
import { ContactForm } from "./contact-form";

// Put your hero photo at /public/images/contact-hero.jpg (min 1920x1080 recommended)
const HERO_IMAGE = "/images/contact-hero.jpg";
function ContactCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: ReactNode;
}) {
  const { bind } = usePointerActive();

  return (
    <div
      {...bind}
      className="flex gap-4 rounded-[18px] border border-white/15 bg-green/10 p-4 backdrop-blur-md transition-all duration-300 data-[active=true]:border-copper/50 data-[active=true]:bg-green-deep [-webkit-tap-highlight-color:transparent]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-copper/40 bg-green-bg">
        <Icon className="h-5 w-5 text-green-deep" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <div>
        <h2 className="font-sans text-[15px] font-medium text-white">{title}</h2>
        <p className="mt-1 font-sans text-[14px] leading-relaxed text-white/70">
          {body}
        </p>
      </div>
    </div>
  );
}

function FaqItem({ item }: { item: (typeof c.faq)[number] }) {
  const { bind } = usePointerActive();

  return (
    <details
      {...bind}
      className="group rounded-2xl border border-white/15 bg-copper/60 px-6 py-5 shadow-[0_10px_30px_-22px_rgba(50,30,24,0.3)] transition-colors open:border-copper/40 data-[active=true]:bg-green-deep [-webkit-tap-highlight-color:transparent]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[22px] leading-snug text-espresso transition-colors group-data-[active=true]:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/50 [&::-webkit-details-marker]:hidden">
        {item.q}
        <ChevronDown
          className="h-5 w-5 shrink-0 text-copper transition-transform duration-300 group-open:rotate-180"
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </summary>
      <p className="mt-3 font-sans text-[15px] leading-[1.75] text-espresso/70 transition-colors group-data-[active=true]:text-cream/80">
        {item.a}
      </p>
    </details>
  );
}
export function ContactPage() {
  const cards = [
    ...(c.details.email
      ? [
          {
            icon: Mail,
            title: "Email us",
            body: (
              <a
                href={`mailto:${c.details.email}`}
                className="break-all text-white underline underline-offset-2 hover:text-copper-light"
              >
                {c.details.email}
              </a>
            ),
          },
        ]
      : []),
    {
      icon: PackageSearch,
      title: "Already ordered?",
      body: (
        <>
          Check your order status  with your tracking code on the{" "}
          <Link
            href={c.trackOrderHref}
            className="text-white underline underline-offset-2 hover:text-copper-light"
          >
            Track Order
          </Link>{" "}
          page.
        </>
      ),
    },
    {
      icon: Globe2,
      title: "Worldwide",
      body: <>Finasto delivers from Indonesia to doorsteps across the world.</>,
    },
  ];

  return (
    <main className="flex-1 ">
      {/* ───────── HERO: image bg, info left, form right ───────── */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="/hero/brand.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-br from-green-deep/70 via-[#17391f]/80 to-espresso-deep/90"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-[-8%] -z-10 h-[460px] w-[460px] rounded-full bg-copper/25 blur-[130px]"
        />

        <div className="mx-auto grid max-w-[1300px] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:py-16 lg:min-h-[calc(100vh-80px)]">
          {/* LEFT: heading + contact cards */}
             <div className="mx-auto w-full max-w-[600px] lg:ml-auto">
             <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-copper-light/30 bg-copper/10 px-4 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-copper-light">
              <MessageSquareText className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
              {c.hero.eyebrow}
            </p>
            <h1 className="mt-5 font-display text-[36px] leading-[1.05] text-white md:text-[52px]">
              {c.hero.title}
            </h1>
            <span
              aria-hidden="true"
              className="mt-5 block h-[2px] w-14 rounded-full bg-gradient-to-r from-copper-light to-copper"
            />
            <p className="mt-5 max-w-[480px] font-sans text-[15px] leading-relaxed text-white/75 md:text-[16px]">
              {c.hero.text}
            </p>

            <aside
              aria-label="Other ways to reach us"
              className="mt-8 flex flex-col gap-3"
            >
           {cards.map((card) => (
  <ContactCard key={card.title} {...card} />
))}
            </aside>
          </div>
          </div>
      
        

          {/* RIGHT: form */}
               <ContactForm />
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section
        aria-labelledby="contact-faq"
        className="mx-auto max-w-[760px] px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24"
      >
        <div className="text-center">
          <h2
            id="contact-faq"
            className="font-sans text-[12px] font-medium uppercase tracking-[0.22em] text-copper"
          >
            Quick answers
          </h2>
          <span
            aria-hidden="true"
            className="mx-auto mt-3 block h-px w-10 bg-copper/60"
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 ">
        {c.faq.map((item) => (
  <FaqItem key={item.q} item={item} />
))}
        </div>
      </section>
    </main>
  );
}