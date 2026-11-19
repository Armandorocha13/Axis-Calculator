import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  priority?: boolean;
}

export function Logo({ className, size = "md", priority = false }: LogoProps) {
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
