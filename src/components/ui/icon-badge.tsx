"use client";

import type { ReactNode } from "react";
import { usePointerActive } from "@/app/hooks/usePointerActive";

export function IconBadge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { bind } = usePointerActive();

  return (
    <span
      {...bind}
      className={`group relative flex h-14 w-14 items-center justify-center rounded-full border transition-colors duration-300 data-[active=true]:border-copper [-webkit-tap-highlight-color:transparent] ${className}`}
    >
      {children}
    </span>
  );
}