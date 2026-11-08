"use client";

import type { ReactNode } from "react";
import { usePointerActive } from "@/app/hooks/usePointerActive";

export function InteractiveCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { bind } = usePointerActive();

  return (
    <div
      {...bind}
      className={`transition-all duration-300 data-[active=true]:-translate-y-1 data-[active=true]:border-copper [-webkit-tap-highlight-color:transparent] ${className}`}
    >
      {children}
    </div>
  );
}