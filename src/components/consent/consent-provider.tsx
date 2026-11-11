"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Consent, DEFAULT, readConsent, writeConsent } from "@/lib/consent";

type Ctx = Consent & { save: (c: Omit<Consent, "decided">) => void; open: boolean; setOpen: (v: boolean) => void };
const ConsentCtx = createContext<Ctx>({ ...DEFAULT, save() {}, open: false, setOpen() {} });
export const useConsent = () => useContext(ConsentCtx);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [c, setC] = useState<Consent>(DEFAULT);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setC(stored);
    setOpen(!stored.decided); // show banner only if no decision yet
  }, []);

  const save = (n: Omit<Consent, "decided">) => {
    writeConsent(n);
    setC({ ...n, decided: true });
    setOpen(false);
    if (!n.marketing) window.location.reload(); // unload already-running trackers
  };

  return <ConsentCtx.Provider value={{ ...c, save, open, setOpen }}>{children}</ConsentCtx.Provider>;
}