import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-sans font-bold uppercase tracking-widest",
        className ?? "text-lg",
      )}
    >
      Axis Calculator
    </span>
  );
}
