import Link from "next/link";
import {
  ChevronDown,
  Globe2,
  Mail,
  MessageSquareText,
  PackageSearch,
} from "lucide-react";
import { contactContent as c } from "@/lib/contact/contact-content";
import { ContactForm } from "./contact-form";

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
                className="break-all text-green-deep underline underline-offset-2 hover:text-copper"
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
          Check your order status any time with your tracking code on the{" "}
          <Link
            href={c.trackOrderHref}
            className="text-green-deep underline underline-offset-2 hover:text-copper"
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
    <main className="flex-1 bg-pattern">
      {/* ───────── HERO ───────── */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-green-deep via-[#17391f] to-espresso-deep px-5 pb-36 pt-16 text-center sm:px-8 sm:pb-44 sm:pt-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-green/40 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-[-8%] -z-10 h-[460px] w-[460px] rounded-full bg-copper/25 blur-[130px]"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 620"
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
        >
          <path d="M-40 60 C120 20 300 70 380 230 C220 280 40 240 -40 60Z" fill="#2f6a3a" opacity="0.26" />
          <path d="M1440 80 C1300 130 1240 270 1280 420 C1420 370 1480 230 1440 80Z" fill="#0c2615" opacity="0.5" />
          <path d="M-120 480 C240 410 480 550 860 440 S1380 330 1600 410" fill="none" stroke="#8cc79a" strokeOpacity="0.18" />
          <path d="M-120 530 C260 470 520 600 900 490 S1400 390 1600 460" fill="none" stroke="#e0a56d" strokeOpacity="0.16" />
        </svg>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]"
        />

        <div className="mx-auto max-w-[720px]">
          <p className="inline-flex items-center gap-2 rounded-full border border-copper-light/30 bg-copper/10 px-4 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-copper-light">
            <MessageSquareText className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
            {c.hero.eyebrow}
          </p>
          <h1 className="mt-5 font-display text-[36px] leading-[1.05] text-white md:text-[52px]">
            {c.hero.title}
          </h1>
          <span
            aria-hidden="true"
            className="mx-auto mt-5 block h-[2px] w-14 rounded-full bg-gradient-to-r from-copper-light to-copper"
          />
          <p className="mx-auto mt-5 max-w-[500px] font-sans text-[15px] leading-relaxed text-white/70 md:text-[16px]">
            {c.hero.text}
          </p>
        </div>
      </section>

      {/* ───────── DETAILS + FORM (overlaps hero) ───────── */}
      <div className="relative mx-auto -mt-24 grid max-w-[1100px] gap-6 px-5 sm:-mt-28 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
        <aside
          aria-label="Other ways to reach us"
          className="order-2 flex flex-col gap-4 lg:order-1 lg:pt-4"
        >
          {cards.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex gap-4 rounded-[22px] border border-border bg-white p-5 shadow-[0_10px_30px_-18px_rgba(50,30,24,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:border-copper/40"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-copper/40 bg-green-bg">
                <Icon className="h-5 w-5 text-green-deep" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-sans text-[15px] font-medium text-espresso">
                  {title}
                </h2>
                <p className="mt-1 font-sans text-[14px] leading-relaxed text-warm-gray">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </aside>

        <div className="order-1 lg:order-2">
          <ContactForm />
        </div>
      </div>

      {/* ───────── FAQ ───────── */}
      <section
        aria-labelledby="contact-faq"
        className="mx-auto max-w-[760px] px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28"
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

        <div className="mt-10 flex flex-col gap-3">
          {c.faq.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border bg-white px-6 py-5 shadow-[0_10px_30px_-22px_rgba(50,30,24,0.3)] transition-colors open:border-copper/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[19px] leading-snug text-green-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/50 [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-copper transition-transform duration-300 group-open:rotate-180"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 font-sans text-[15px] leading-[1.75] text-warm-gray">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}