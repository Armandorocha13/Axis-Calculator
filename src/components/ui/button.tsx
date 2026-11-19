import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-foreground text-background hover:bg-foreground/90 border border-foreground shadow-xs",
  secondary:
    "bg-card text-foreground border border-border hover:bg-muted/80 shadow-2xs",
  ghost: "bg-transparent text-foreground hover:bg-muted/80 border border-transparent",
  destructive: "bg-accent text-accent-foreground hover:bg-accent/85 border border-accent",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
