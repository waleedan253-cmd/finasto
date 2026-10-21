import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const PAGES = [
  { href: "/shipping", label: "Shipping & Delivery" },
  { href: "/returns", label: "Returns & Refunds" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
] as const;

// Shared layout for the store's information pages (Shipping, Returns, FAQ).
// Server component, no state. Uses theme tokens only, so it works in
// light and dark mode.

export function PolicyPage({
  path,
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  path: (typeof PAGES)[number]["href"];
  eyebrow: string;
  title: string;
  intro: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1000px] px-5 py-8 sm:px-8 lg:py-12">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 font-sans text-[13px] text-warm-gray">
          <li>
            <Link
              href="/"
              className="transition-colors hover:text-copper hover:underline hover:underline-offset-4"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.6} />
          </li>
          <li aria-current="page" className="font-medium text-espresso">
            {title}
          </li>
        </ol>
      </nav>

      <ul
        aria-label="Help pages"
        className="mt-4 flex flex-wrap gap-2"
      >
        {PAGES.map((page) => {
          const active = page.href === path;
          return (
            <li key={page.href}>
              <Link
                href={page.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "inline-flex h-9 items-center rounded-full border border-copper/40 bg-copper/10 px-4 font-sans text-[13px] font-medium text-espresso"
                    : "inline-flex h-9 items-center rounded-full border border-border-strong bg-white px-4 font-sans text-[13px] text-warm-gray transition-colors hover:border-copper hover:text-copper dark:border-border"
                }
              >
                {page.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <header className="mt-10 max-w-2xl">
        <p className="flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
          {eyebrow}
          <span aria-hidden="true" className="h-px w-10 bg-copper-light" />
        </p>
        <h1 className="mt-3 font-display text-[40px] leading-tight text-espresso md:text-[56px]">
          {title}
        </h1>
        <p className="mt-4 font-sans text-[15px] leading-relaxed text-warm-gray md:text-[16px]">
          {intro}
        </p>
        {updated && (
          <p className="mt-3 font-sans text-[12px] text-warm-gray">
            Last updated: {updated}
          </p>
        )}
      </header>

      <div className="mt-10 flex flex-col gap-10">{children}</div>
    </div>
  );
}

export function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
      <h2
        id={`${id}-heading`}
        className="font-display text-[26px] leading-tight text-espresso"
      >
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3 font-sans text-[15px] leading-relaxed text-warm-gray">
        {children}
      </div>
    </section>
  );
}