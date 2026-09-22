import { cn } from "@/lib/utils";

export function Flag({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(`fi fi-${code.toLowerCase()}`, "rounded-[2px]", className)}
    />
  );
}
