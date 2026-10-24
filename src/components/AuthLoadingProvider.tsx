"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { Link, Loader2 } from "lucide-react";

type Ctx = { show: () => void; hide: () => void };
const AuthLoadingContext = createContext<Ctx>({ show() {}, hide() {} });

export const useAuthLoading = () => useContext(AuthLoadingContext);

export function AuthLoadingProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);
  const value = useMemo(() => ({ show, hide }), [show, hide]);

  // Lock scroll while visible; safety net hides it after 20s so it can never get stuck.
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => setVisible(false), 20000);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [visible]);

  return (
    <AuthLoadingContext.Provider value={value}>
      {children}
      {visible && (
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-cream px-6 text-center"
        >
          
                     <Image
                       src="/brand/finasto-logo.png"
                       alt="Finasto"
                       width={120}
                       height={90}
                       priority
                       className="h-11 w-auto dark:hidden"
                     />
                     <Image
                       src="/brand/finasto-logo-dark.png"
                       alt="Finasto"
                       width={120}
                       height={90}
                       priority
                       className="hidden h-11 w-auto dark:block"
                     />
                
          <Loader2
            className="h-10 w-10 animate-spin text-copper"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="font-display text-[26px] text-green-deep">
           Verifying your access…
          </p>
       
        </div>
      )}
    </AuthLoadingContext.Provider>
  );
}

/** Put this inside each dashboard page. It hides the overlay once the page has really rendered. */
export function AuthOverlayDismiss() {
  const { hide } = useAuthLoading();
  useEffect(() => {
    hide();
  }, [hide]);
  return null;
}