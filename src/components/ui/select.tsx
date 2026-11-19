import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-md border border-foreground/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground",
        className,
      )}
      {...props}
    />
  );
}
