import { PackageSearch, ClipboardCheck, Truck } from "lucide-react";

const trustItems = [
  {
    icon: PackageSearch,
    title: "Track your order",
  },
  {
    icon: ClipboardCheck,
    title: "See your order status",
  },
  {
    icon: Truck,
    title: "Shipped right to your door",
  },
] as const;

export function ShopIntro() {
  return (
    <section
      aria-labelledby="shop-intro-heading"
      className="border-b border-border bg-cream"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 md:py-14 lg:px-16">
        <div className="max-w-2xl">
          <h2
            id="shop-intro-heading"
            className="font-display text-[28px] leading-tight text-espresso md:text-[36px]"
          >
            Sourced from Bali, shipped worldwide
          </h2>
          <p className="mt-3 font-sans text-[15px] leading-relaxed text-warm-gray md:text-[16px]">
            Every coffee and tea in this shop is grown on small Balinese farms,
            roasted or blended in small batches, and packed fresh before it
            travels to your door.
          </p>
        </div>

        <div className="relative mt-10">
          {/* connecting line, runs behind the circles */}
          <div
            aria-hidden="true"
            className="absolute left-[16.66%] right-[16.66%] top-7 h-px bg-border"
          />

          <ol className="grid grid-cols-3">
            {trustItems.map(({ icon: Icon, title }, index) => (
              <li
                key={title}
                className="flex flex-col items-center text-center"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white">
                  <Icon
                    className="h-6 w-6 text-copper"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-espresso font-sans text-[11px] font-semibold text-white">
                    {index + 1}
                  </span>
                </div>
                <p className="mt-3 max-w-[140px] font-sans text-[13px] font-semibold text-espresso sm:max-w-none sm:text-[14px]">
                  {title}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
