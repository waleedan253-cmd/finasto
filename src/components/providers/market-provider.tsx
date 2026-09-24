"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { activeMarket, availableMarkets } from "@/data/site";

type Market = (typeof availableMarkets)[number];

type MarketContextValue = {
  market: Market;
  setMarket: (market: Market) => void;
};

const STORAGE_KEY = "finasto-market";

const defaultMarket =
  availableMarkets.find((m) => m.currencyCode === activeMarket.currencyCode) ??
  availableMarkets[0];

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: ReactNode }) {
  const [market, setMarketState] = useState<Market>(defaultMarket);

  // Read the saved choice after mount, so server and client render the
  // same HTML first (avoids a hydration mismatch).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const found = availableMarkets.find((m) => m.currencyCode === saved);
      if (found) setMarketState(found);
    } catch {
      // storage blocked (private mode): keep the default market
    }
  }, []);

  function setMarket(next: Market) {
    setMarketState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next.currencyCode);
    } catch {
      // ignore
    }
  }

  return (
    <MarketContext.Provider value={{ market, setMarket }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used inside <MarketProvider>");
  return ctx;
}
