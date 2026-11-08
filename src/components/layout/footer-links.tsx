"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePointerActive } from "@/app/hooks/usePointerActive";

export function FooterLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const { bind } = usePointerActive();

  return (
    <Link href={href} {...bind} className={className}>
      {children}
    </Link>
  );
}

export function SocialLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const { bind } = usePointerActive();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      {...bind}
      className={className}
    >
      {children}
    </a>
  );
}