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
    <div className="relative z-10 border-t border-border bg-cream-soft">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-y-6 px-5 py-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 sm:px-8 lg:grid-cols-4 lg:gap-8 lg:py-8">
        {trustItems.map((item) => {
          const Icon = icons[item.id as keyof typeof icons] ?? Check;
          return (
            <div key={item.id} className="flex items-start gap-3">
              <Icon
                className="mt-0.5 h-6 w-6 shrink-0 text-espresso/70"
                strokeWidth={1.4}
                aria-hidden="true"
              />
              <div>
                <p className="font-sans text-[14px] font-medium leading-snug text-espresso">
                  {item.title}
                </p>
                <p className="font-sans text-[13px] leading-snug text-warm-gray">
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
