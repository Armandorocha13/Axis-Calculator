import Image from "next/image";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  priority?: boolean;
  variant?: "horizontal" | "full";
}

export function Logo({
  className,
  size = "md",
  priority = false,
  variant = "horizontal",
}: LogoProps) {
  if (variant === "full") {
    // Proporção original exata da logo completa com etiqueta: 1024 x 682 (1.5:1)
    const fullSizeClasses = {
      sm: "max-w-[180px]",
      md: "max-w-[240px]",
      lg: "max-w-[280px] sm:max-w-[320px]",
      xl: "max-w-[360px] sm:max-w-[400px]",
    };

    return (
      <div className={cn("inline-flex items-center justify-center", className)}>
        <Image
          src="/logo-full.png"
          alt="Arte em Conta — Gestão para quem cria."
          width={1024}
          height={682}
          priority={priority}
          className={cn(
            "h-auto w-full object-contain transition-transform",
            fullSizeClasses[size]
          )}
        />
      </div>
    );
  }

  // Proporção original exata da logo tipográfica: 1024 x 341 (3:1)
  const sizeClasses = {
    sm: "h-7 sm:h-8 w-auto max-w-[150px]",
    md: "h-10 sm:h-11 md:h-12 w-auto max-w-[220px]",
    lg: "h-16 sm:h-20 md:h-24 w-auto max-w-[320px]",
    xl: "h-20 sm:h-24 md:h-28 w-auto max-w-[400px]",
  };

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <Image
        src="/logo.png"
        alt="Arte em Conta — Gestão para quem cria."
        width={1024}
        height={341}
        priority={priority}
        className={cn("object-contain transition-transform", sizeClasses[size])}
      />
    </div>
  );
}
