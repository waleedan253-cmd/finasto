"use client";

import { createContext, useContext, type ReactNode } from "react";

export type ThemeChoice = "light" | "dark" | "system";
type Resolved = "light" | "dark";

type Ctx = {
  theme: ThemeChoice;
  resolvedTheme: Resolved;
  setTheme: (t: ThemeChoice) => void;
};

// Site is locked to light. Dark is applied only per section via className="dark".
const ThemeContext = createContext<Ctx>({
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider
      value={{ theme: "light", resolvedTheme: "light", setTheme: () => {} }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);