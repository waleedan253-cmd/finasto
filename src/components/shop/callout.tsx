import type { LucideIcon } from "lucide-react";

export function Callout({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex gap-4 overflow-hidden rounded-2xl border border-copper/30 bg-green-bg p-5 pl-6">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-copper-light to-copper"
      />
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-copper/40 bg-cream text-copper">
        <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
      </span>
      <div className="text-[14px] leading-relaxed">{children}</div>
    </div>
  );
}