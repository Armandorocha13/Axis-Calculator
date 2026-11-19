import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "neutral" | "solid" | "accent";

const toneClasses: Record<Tone, string> = {
  neutral: "border border-border bg-muted/60 text-foreground/80",
  solid: "bg-foreground text-background border border-foreground",
  accent: "bg-accent text-accent-foreground border border-accent",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
