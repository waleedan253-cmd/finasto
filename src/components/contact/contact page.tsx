"use client";
import { useId, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePointerActive } from "@/app/hooks/usePointerActive";
import {
  Plus,
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

function FaqItem({
  item,
  index,
}: {
  item: (typeof c.faq)[number];
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const buttonId = `${id}-button`;
  const panelId = `${id}-panel`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        open
          ? "border-copper/50 bg-gradient-to-br from-[#10260f] via-green to-[#1b4a24] shadow-[0_24px_50px_-24px_rgba(16,38,15,0.8)]"
          : "border-border-strong bg-white shadow-[0_8px_24px_-20px_rgba(50,30,24,0.35)] md:hover:-translate-y-0.5 md:hover:border-green/50"
      }`}
    >
      {/* dots, only on the open (green) card */}
      {open && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"
        />
      )}

      <h3 className="relative">
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-[68px] w-full cursor-pointer items-center gap-4 px-4 py-4 text-left [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-copper sm:px-6"
        >
          {/* <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-[16px] italic transition-colors duration-300 ${
              open
                ? "bg-gradient-to-br from-cream to-copper-light text-green-deep"
                : "border border-copper/40 bg-green-bg text-green-deep"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span> */}

          <span
            className={`flex-1 font-display text-[19px] font-semibold leading-snug transition-colors duration-300 sm:text-[22px] ${
              open ? "text-white" : "text-espresso"
            }`}
          >
            {item.q}
          </span>

          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
              open
                ? "rotate-45 border-copper-light/60 bg-white/10 text-copper-light"
                : "border-copper/40 text-copper"
            }`}
          >
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        className={`relative grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-4 pb-6 pl-[72px] pr-6 font-sans text-[15px] leading-[1.8] text-white/85 sm:pl-[80px] sm:pr-10">
            {item.a}
          </p>
        </div>
      </div>
    </div>
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
          Check your order status  using your tracking code on the{" "}
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
      title: "Worldwide Delivery",
      body: <>Bringing the finest of Indonesia closer to you, wherever you are.</>,
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
        className="mx-auto max-w-[820px] px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24"
      >
        <div className="text-center">
          <p className="inline-flex items-center justify-center gap-3 font-sans text-[12px] font-medium uppercase tracking-[0.22em] text-copper">
            <span aria-hidden="true" className="h-px w-8 bg-copper-light" />
            Need to know
            <span aria-hidden="true" className="h-px w-8 bg-copper-light" />
          </p>
          <h2
            id="contact-faq"
            className="mt-4 font-display text-[32px] leading-[1.1] text-green-deep sm:text-[40px] md:text-[48px]"
          >
            Frequently asked questions
          </h2>
          <span
            aria-hidden="true"
            className="mx-auto mt-5 block h-[2px] w-20 rounded-full bg-gradient-to-r from-transparent via-copper to-transparent"
          />
          <p className="mx-auto mt-4 max-w-md font-sans text-[15px] leading-relaxed text-warm-gray">
            Everything about orders, delivery and stockists in one place.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {c.faq.map((item, i) => (
            <FaqItem key={item.q} item={item} index={i} />
          ))}
        </div>
      </section>
    </main>
  );
}