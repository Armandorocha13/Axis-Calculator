import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
}

export function Logo({ className, size = "md", priority = false }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-auto max-w-[150px]",
    md: "h-9 sm:h-10 w-auto max-w-[180px]",
    lg: "h-20 sm:h-24 w-auto max-w-[280px]",
  };

  return (
    <div className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="Arte em Conta — Gestão para quem cria."
        width={320}
        height={213}
        priority={priority}
        className={cn("object-contain", sizeClasses[size])}
      />
    </div>
  );
}
