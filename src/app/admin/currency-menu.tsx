"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { availableMarkets } from "@/data/site";
import { useMarket } from "@/components/providers/market-provider";
import { Flag } from "@/components/ui/flag";

export function CurrencyMenu() {
  const [open, setOpen] = useState(false);
  const { market: selected, setMarket } = useMarket();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency ${selected.currencyCode}`}
        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 font-sans text-[13px] text-espresso/80 transition-colors hover:border-copper hover:text-espresso"
      >
        <Flag code={selected.countryCode} />
        <span>{selected.currencyCode}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-cream py-1 shadow-lg"
        >
          {availableMarkets.map((market) => {
            const isSelected = market.currencyCode === selected.currencyCode;
            return (
              <li key={market.currencyCode}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setMarket(market);
                    setOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left font-sans text-[14px] text-espresso/85 transition-colors hover:bg-espresso/5 hover:text-espresso"
                >
                  <span className="flex items-center gap-3">
                    <Flag code={market.countryCode} />
                    {market.countryLabel} · {market.currencyCode}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-copper" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
