"use client";

import { useTheme, type ThemeChoice } from "@/components/ThemeProvider";

const options: { value: ThemeChoice; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "system", label: "Auto", icon: "🖥️" },
  { value: "dark", label: "Dark", icon: "🌙" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center rounded-full border border-border bg-cream-soft p-1"
    >
      {options.map((o) => {
        const active = theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.label}
            title={o.label}
            onClick={() => setTheme(o.value)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
              active ? "bg-copper text-espresso-deep" : "hover:bg-cream"
            }`}
          >
            <span aria-hidden>{o.icon}</span>
          </button>
        );
      })}
    </div>
  );
}
