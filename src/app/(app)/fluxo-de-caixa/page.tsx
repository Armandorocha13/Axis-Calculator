import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CashFlowHeader } from "@/components/cash-flow/cash-flow-header";
import { CashFlowTable } from "@/components/cash-flow/cash-flow-table";
import { formatCurrencyBRL } from "@/lib/utils";
import { format, parse, startOfMonth, endOfMonth, isValid } from "date-fns";
import type { CashFlowEntry } from "@/lib/types/database.types";

export const metadata: Metadata = {
  title: "Fluxo de Caixa",
};

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
        <Card className="hover:border-salvia/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Entradas do Mês
              </p>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-salvia-bg text-salvia-foreground border border-salvia/30">
                Entradas
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-salvia-foreground">
              {formatCurrencyBRL(totalEntradas)}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-rosa/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Saídas do Mês
              </p>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-rosa-bg text-rosa-foreground border border-rosa/30">
                Saídas
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-rosa-foreground">
              {formatCurrencyBRL(totalSaidas)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/30 ring-1 ring-primary/20 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider font-semibold text-foreground">
                Saldo do Mês
              </p>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                  saldoMes >= 0
                    ? "bg-salvia-bg text-salvia-foreground border-salvia/40"
                    : "bg-rosa-bg text-rosa-foreground border-rosa/40"
                }`}
              >
                {saldoMes >= 0 ? "Positivo" : "Negativo"}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {formatCurrencyBRL(saldoMes)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Movimentações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Movimentações do Mês</CardTitle>
          <span className="text-xs text-muted-foreground font-medium">
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
