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

export type ThemeChoice = "light" | "dark" | "system";
type Resolved = "light" | "dark";

type Ctx = {
  theme: ThemeChoice;
  resolvedTheme: Resolved;
  setTheme: (t: ThemeChoice) => void;
};

const ThemeContext = createContext<Ctx>({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
});

const KEY = "finasto-theme";

function readSaved(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" || v === "system" ? v : "dark";
  } catch {
    return "dark";
  }
}

function systemTheme(): Resolved {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // "light" before mount, so server and client HTML match (no hydration error)
  const [theme, setThemeState] = useState<ThemeChoice>("dark");
  const [resolvedTheme, setResolved] = useState<Resolved>("dark");

  const apply = useCallback((t: ThemeChoice) => {
    const r = t === "system" ? systemTheme() : t;
    setResolved(r);
    document.documentElement.classList.toggle("dark", r === "dark");
  }, []);

  // load saved choice
  useEffect(() => {
    const saved = readSaved();
    setThemeState(saved);
    apply(saved);
  }, [apply]);

  // follow device changes while on "system"
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme, apply]);

  const setTheme = useCallback(
    (t: ThemeChoice) => {
      setThemeState(t);
      try {
        localStorage.setItem(KEY, t);
      } catch {}
      apply(t);
    },
    [apply],
  );

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
