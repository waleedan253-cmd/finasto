"use client";

import { useState } from "react";
import { Leaf } from "lucide-react";
import { newsletterContent } from "@/data/home";

/**
 * Calm closer before the footer — Soft Editorial background (#FBF8F3),
 * no imagery. Email capture is client-side only for now (local success
 * state); wiring to a real subscriber list happens in the backend step.
 */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <section className="bg-cream-soft py-20 lg:py-24">
      <div className="mx-auto max-w-[560px] px-5 text-center sm:px-8">
        <Leaf
          className="mx-auto h-6 w-6 text-green"
          strokeWidth={1.4}
          aria-hidden="true"
        />
        <span
          aria-hidden="true"
          className="mx-auto mt-3 block h-px w-12 bg-copper-light"
        />

        <p className="mt-5 font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
          {newsletterContent.eyebrow}
        </p>
        <h2 className="mt-3 font-display text-[32px] leading-tight text-espresso sm:text-[38px]">
          {newsletterContent.heading}
        </h2>
        <p className="mt-3 font-sans text-[14px] leading-relaxed text-warm-gray">
          {newsletterContent.subheading}
        </p>

        {submitted ? (
          <p
            role="status"
            className="mt-8 font-sans text-[14px] font-medium text-green"
          >
            {newsletterContent.successMessage}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={newsletterContent.placeholder}
              className="h-12 w-full rounded-full border border-border-strong bg-white px-5 font-sans text-[14px] text-espresso placeholder:text-warm-gray focus:border-copper focus:outline-none sm:w-[280px]"
            />
            <button
              type="submit"
              className="h-12 shrink-0 rounded-full bg-espresso px-7 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep"
            >
              {newsletterContent.buttonLabel}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
