import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type BadgeTone = "neutral" | "solid" | "accent" | "salvia" | "rosa" | "lavanda";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border border-border bg-muted/60 text-muted-foreground",
  solid: "border border-primary/30 bg-[#EFEBF7] text-[#5A4588]",
  lavanda: "border border-primary/30 bg-[#EFEBF7] text-[#5A4588]",
  salvia: "border border-salvia/40 bg-salvia-bg text-salvia-foreground",
  rosa: "border border-rosa/50 bg-rosa-bg text-rosa-foreground",
  accent: "border border-rosa/50 bg-rosa-bg text-rosa-foreground",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-tight",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
