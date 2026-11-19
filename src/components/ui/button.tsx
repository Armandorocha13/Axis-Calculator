import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-[#8C77B9] border border-transparent shadow-[0_2px_8px_rgba(155,135,199,0.25)]",
  secondary:
    "bg-card text-foreground border border-border hover:bg-muted/60 hover:border-[#D9D1C3] shadow-xs",
  ghost: "bg-transparent text-foreground hover:bg-muted/60 border border-transparent",
  destructive: "bg-rosa-bg text-rosa-foreground border border-rosa/30 hover:bg-rosa/40",
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
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
