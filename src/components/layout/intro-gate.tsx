"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const HOLD_MS = 500; // how long the closed gate shows the logo
const OPEN_MS = 1200; // how long the gate takes to open

function Logo() {
  return (
    <Image
      src="/brand/finasto-logo.png" // put your logo in /public
      alt="Finasto"
      width={240}
      height={240}
      priority
      className="animate-logo-in h-auto w-40 md:w-60"
    />
  );
}

export default function IntroGate() {
  const [phase, setPhase] = useState<"closed" | "opening" | "done">("closed");

  useEffect(() => {
    // Show the intro only once per browser session
    if (sessionStorage.getItem("finasto-intro-seen")) {
      setPhase("done");
      return;
    }

    document.body.style.overflow = "hidden";

    const openTimer = setTimeout(() => setPhase("opening"), HOLD_MS);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem("finasto-intro-seen", "1");
      document.body.style.overflow = "";
    }, HOLD_MS + OPEN_MS);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "done") return null;

  const opening = phase === "opening";
  const panel =
    "absolute inset-y-0 w-1/2 overflow-hidden bg-cream " +
    "transition-transform duration-[1200ms] ease-[cubic-bezier(0.77,0,0.175,1)]";

  return (
    <div className="fixed inset-0 z-[100]" aria-hidden="true">
      {/* LEFT gate */}
      <div
        className={`${panel} left-0 border-r border-copper/40 ${
          opening ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* full-width layer aligned to the panel's left edge, so the logo center lands on the seam */}
        <div className="absolute inset-y-0 left-0 flex w-screen items-center justify-center">
          <Logo />
        </div>
      </div>

      {/* RIGHT gate */}
      <div
        className={`${panel} right-0 border-l border-copper/40 ${
          opening ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {/* full-width layer aligned to the panel's right edge, so it shows the right half of the logo */}
        <div className="absolute inset-y-0 right-0 flex w-screen items-center justify-center">
          <Logo />
        </div>
      </div>
    </div>
  );
}
