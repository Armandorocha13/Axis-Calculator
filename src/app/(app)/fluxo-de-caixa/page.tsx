import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CashFlowHeader } from "@/components/cash-flow/cash-flow-header";
import { CashFlowTable } from "@/components/cash-flow/cash-flow-table";
import { formatCurrencyBRL } from "@/lib/utils";
import { format, parse, startOfMonth, endOfMonth, isValid } from "date-fns";
import type { CashFlowEntry } from "@/lib/types/database.types";

export default async function CashFlowPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const now = new Date();

  // Valida o parâmetro de mês (YYYY-MM) ou usa o mês atual
  let selectedDate = now;
  if (mes && /^\d{4}-\d{2}$/.test(mes)) {
    const parsedDate = parse(mes, "yyyy-MM", new Date());
    if (isValid(parsedDate)) {
      selectedDate = parsedDate;
    }
  }

  const currentMonthStr = format(selectedDate, "yyyy-MM");
  const startDateStr = format(startOfMonth(selectedDate), "yyyy-MM-dd");
  const endDateStr = format(endOfMonth(selectedDate), "yyyy-MM-dd");

  const supabase = await createClient();

  const { data: entriesData } = await supabase
    .from("cash_flow_entries")
    .select("*")
    .gte("entry_date", startDateStr)
    .lte("entry_date", endDateStr)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<CashFlowEntry[]>();

  const entries = entriesData ?? [];

  let totalEntradas = 0;
  let totalSaidas = 0;

  for (const entry of entries) {
    const val = Number(entry.amount) || 0;
    if (entry.type === "entrada") {
      totalEntradas += val;
    } else if (entry.type === "saida") {
      totalSaidas += val;
    }
  }

  const saldoMes = totalEntradas - totalSaidas;

  return (
    <div className="flex flex-col gap-6">
      <CashFlowHeader currentMonthStr={currentMonthStr} />

      {/* Cards de Resumo do Mês */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Entradas do Mês
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-500">
              {formatCurrencyBRL(totalEntradas)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Saídas do Mês
            </p>
            <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-500">
              {formatCurrencyBRL(totalSaidas)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-foreground/30 bg-muted/30 ring-1 ring-foreground/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide font-semibold text-foreground">
                Saldo do Mês
              </p>
              <span
                className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded ${
                  saldoMes >= 0
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                }`}
              >
                {saldoMes >= 0 ? "Positivo" : "Negativo"}
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {formatCurrencyBRL(saldoMes)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Movimentações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Movimentações do Mês</CardTitle>
          <span className="text-xs text-muted-foreground">
            {entries.length}{" "}
            {entries.length === 1 ? "registro" : "registros"}
          </span>
        </CardHeader>
        <CardContent>
          <CashFlowTable entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
