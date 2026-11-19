"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function MonthFilter({ currentMonthStr }: { currentMonthStr: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // currentMonthStr: "YYYY-MM"
  const [yearStr, monthStr] = currentMonthStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1 to 12

  function navigateTo(newYear: number, newMonth: number) {
    if (newMonth < 1) {
      newYear -= 1;
      newMonth = 12;
    } else if (newMonth > 12) {
      newYear += 1;
      newMonth = 1;
    }
    const formattedMonth = String(newMonth).padStart(2, "0");
    const target = `${newYear}-${formattedMonth}`;
    const params = new URLSearchParams(searchParams.toString());
    params.set("mes", target);
    router.push(`/fluxo-de-caixa?${params.toString()}`);
  }

  function handleMonthChange(event: React.ChangeEvent<HTMLInputElement>) {
    const val = event.target.value; // YYYY-MM
    if (val) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("mes", val);
      router.push(`/fluxo-de-caixa?${params.toString()}`);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => navigateTo(year, month - 1)}
          aria-label="Mês anterior"
        >
          &larr;
        </Button>
        <span className="min-w-36 text-center text-sm font-semibold">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => navigateTo(year, month + 1)}
          aria-label="Próximo mês"
        >
          &rarr;
        </Button>
      </div>

      <input
        type="month"
        value={currentMonthStr}
        onChange={handleMonthChange}
        className="h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
      />
    </div>
  );
}
