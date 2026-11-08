"use client";

import { ClipboardCheck, PackageSearch, Truck } from "lucide-react";
import { usePointerActive } from "../../app/hooks/usePointerActive";

const steps = [
  {
    icon: PackageSearch,
    title: "Enter your details",
    text: "Enter your email and tracking code from your confirmation email.",
  },
  {
    icon: ClipboardCheck,
    title: "Track Your Order",
    text: "Follow your order's journey from processing and dispatch to delivery.",
  },
  {
    icon: Truck,
    title: "Worldwide Delivery",
    text: "From Indonesia to Your Doorstep Across the World.",
  },
] as const;

function StepItem({
  step,
  index,
}: {
  step: (typeof steps)[number];
  index: number;
}) {
  const { bind } = usePointerActive();
  const { icon: Icon, title, text } = step;

  return (
    <li
      {...bind}
      className="group flex items-start gap-4 rounded-[18px] border border-white/15 bg-white/10 p-4 backdrop-blur-md transition-all duration-300 data-[active=true]:border-copper/50 data-[active=true]:bg-white/15 [-webkit-tap-highlight-color:transparent]"
    >
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-copper/40 bg-green-bg transition-colors duration-300 group-data-[active=true]:bg-green-deep">
        <Icon
          className="h-5 w-5 text-green-deep transition-colors duration-300 group-data-[active=true]:text-white"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-copper font-sans text-[11px] font-semibold text-[#24110a]">
          {index + 1}
        </span>
      </div>
      <div>
        <h3 className="font-sans text-[15px] font-medium text-white">{title}</h3>
        <p className="mt-1 font-sans text-[13px] leading-relaxed text-white/70">
          {text}
        </p>
      </div>
    </li>
  );
}

export function StepsList() {
  return (
    <ol aria-labelledby="how-it-works" className="mt-4 space-y-3">
      {steps.map((step, i) => (
        <StepItem key={step.title} step={step} index={i} />
      ))}
    </ol>
  );
}