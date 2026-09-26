import { philosophyContent } from "@/data/home";

/**
 * Deliberately quiet after two dark/photo-heavy sections above it — cream
 * background, no imagery, just typography and thin copper dividers
 * between the three ritual steps.
 */
export function ProductPhilosophy() {
  const { eyebrow, heading, intro, steps } = philosophyContent;

  return (
    <section className="bg-r py-20 lg:py-28">
      <div className="mx-auto max-w-[1000px] px-5 text-center sm:px-8">
        <p className="flex items-center justify-center gap-3 font-sans text-[12px] uppercase tracking-[0.22em] text-copper">
          <span aria-hidden="true" className="h-px w-8 bg-copper-light" />
          {eyebrow}
          <span aria-hidden="true" className="h-px w-8 bg-copper-light" />
        </p>
        <h2 className="mt-4 font-display text-[36px] leading-tight text-espresso sm:text-[44px]">
          {heading}
        </h2>
        <p className="mx-auto mt-4 max-w-md font-sans text-[15px] leading-relaxed text-warm-gray">
          {intro}
        </p>

        <div className="mt-14 grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className="flex flex-col items-center px-4 py-8 first:pt-0 sm:py-0 sm:first:pl-0 sm:last:pr-0"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-copper/40 font-display text-[16px] italic  bg-espresso  text-cream soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-[24px] text-espresso">
                {step.title}
              </h3>
              <p className="mt-3 font-sans text-[14px] leading-relaxed text-warm-gray">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
