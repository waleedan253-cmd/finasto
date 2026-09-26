import { Check, Leaf, MapPin, Truck } from "lucide-react";
import { trustItems } from "@/data/home";

const icons = {
  natural: Leaf,
  origin: MapPin,
  payment: Check,
  delivery: Truck,
} as const;

/**
 * Reads from `trustItems` (src/data/home.ts) — copy stays factual and
 * editable there rather than hardcoded per-icon in this component.
 */
export function TrustStrip() {
  return (
    <div className="relative z-10 bg-espresso">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-y-6 px-5 py-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 sm:px-8 lg:grid-cols-4 lg:gap-8 lg:py-8">
        {trustItems.map((item) => {
          const Icon = icons[item.id as keyof typeof icons] ?? Check;
          return (
            <div key={item.id} className="flex items-start gap-4 px-0 lg:px-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-copper/40 bg-white/5">
                <Icon
                  className="h-5 w-5 text-copper-light"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="font-sans text-[14px] font-medium leading-snug text-cream">
                  {item.title}
                </p>
                <p className="font-sans text-[13px] leading-snug text-cream/60">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
