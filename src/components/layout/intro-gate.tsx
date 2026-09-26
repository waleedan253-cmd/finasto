"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const FADE_MS = 450; // total duration of the logo fade/scale-in
const HOLD_MS = 500; // how long the logo stays before the gate dismisses

function Logo() {
  return (
    <Image
      src="/brand/finasto-logo.png" // put your logo in /public
      alt="Finasto"
      width={240}
      height={240}
      priority
      className="h-auto w-32 md:w-44"
    />
  );
}

export default function IntroGate() {
  const [phase, setPhase] = useState<"visible" | "fading" | "done">("visible");

  useEffect(() => {
    // Show the intro only once per browser session
    if (sessionStorage.getItem("finasto-intro-seen")) {
      setPhase("done");
      return;
    }

    const fadeTimer = setTimeout(() => setPhase("fading"), HOLD_MS);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem("finasto-intro-seen", "1");
    }, HOLD_MS + FADE_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-cream transition-opacity ease-out ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
      aria-hidden="true"
    >
      <Image
        src="/brand/finasto-logo.png"
        alt="Finasto"
        width={240}
        height={240}
        priority
        className={`h-auto w-32 transition-all ease-out md:w-44 ${
          phase === "fading"
            ? "scale-100 opacity-0"
            : "scale-95 opacity-0 animate-[finasto-logo-in_400ms_ease-out_forwards]"
        }`}
      />
    </div>
  );
}
