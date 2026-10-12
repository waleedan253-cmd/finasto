"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

type Particle = {
  id: number;
  left: number;
  size: number;
  dur: number;
  delay: number;
  drift: number;
  kind: 0 | 1;
};

function Bean({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="12" rx="7" ry="10" fill="#3B2A24" />
      <path
        d="M12 2.5c-3 4 3 7 0 9.5s3 5.500 0 9.500"
        stroke="#F7F1E7"
        strokeWidth="1.200"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Leaf({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20 3C9 3 4 9 4 15c0 3 2 6 5 6 6 0 11-6 11-18z" fill="#3E762F" />
      <path d="M5 20C9 14 13 10 17 7" stroke="#EEF2E8" strokeWidth="1" />
    </svg>
  );
}

function Dust({ size }: { size: number }) {
  return (
    <span
      className="block rounded-full"
      style={{
        width: size,
        height: size,
        background: "#E0A56D",
        boxShadow: "0 0 8px 2px rgba(224,165,109,0.55)",
      }}
    />
  );
}

export function FallingEffect() {
  const { resolvedTheme } = useTheme();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(true);

  // random values only after mount, so no hydration mismatch
  useEffect(() => {
    const count = window.innerWidth < 768 ? 12 : 22;
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 14,
        dur: 10 + Math.random() * 10,
        delay: -Math.random() * 15, // negative: already mid-fall on load
        drift: (Math.random() - 0.5) * 120,
        kind: (i % 2) as 0 | 1,
      })),
    );
  }, []);

  // pause when tab is hidden
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="animate-fall absolute top-0 block"
          style={
            {
              left: `${p.left}%`,
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
              "--drift": `${p.drift}px`,
              animationPlayState: visible ? "running" : "paused",
            } as React.CSSProperties
          }
        >
          {isDark ? (
            <Dust size={Math.max(3, p.size / 4)} />
          ) : p.kind === 0 ? (
            <Bean size={p.size} />
          ) : (
            <Leaf size={p.size} />
          )}
        </span>
      ))}
    </div>
  );
}
