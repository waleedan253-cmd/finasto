"use client";

import { useEffect, useState } from "react";
import { ArrowBigUp, ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      style={{ cursor: "pointer" }}
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-espresso text-cream shadow-lg transition-opacity hover:bg-espresso-deep sm:right-8"
    >
      <ArrowBigUp className="h-5 w-5" strokeWidth={2} />
    </button>
  );
}
