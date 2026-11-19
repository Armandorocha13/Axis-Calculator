import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/auth/get-current-profile";
import { FinancialSummaryCards } from "@/components/dashboard/financial-summary-cards";
import { AtelierBanner } from "@/components/dashboard/atelier-banner";
import { DeadlineBadge } from "@/components/orders/deadline-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDeadlineUrgency } from "@/lib/orders/deadline";
import { formatDateBR } from "@/lib/utils";
import { format, startOfMonth, endOfMonth } from "date-fns";
import type { Order, CashFlowEntry } from "@/lib/types/database.types";

export const metadata: Metadata = {
  title: "Visão Geral | Arte em Conta",
};

export default async function VisaoGeralPage() {
  const supabase = await createClient();
  const { profile } = await getCurrentUserAndProfile();

  const now = new Date();
  const startMonthStr = format(startOfMonth(now), "yyyy-MM-dd");
  const endMonthStr = format(endOfMonth(now), "yyyy-MM-dd");

  const [{ data: orders }, { data: cashFlowMonth }] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .order("due_date", { ascending: true })
      .returns<Order[]>(),
    supabase
      .from("cash_flow_entries")
      .select("type, amount")
      .gte("entry_date", startMonthStr)
      .lte("entry_date", endMonthStr)
      .returns<Pick<CashFlowEntry, "type" | "amount">[]>(),
  ]);

  const allOrders = orders ?? [];
  const entries = cashFlowMonth ?? [];

  let entradasMes = 0;
  let saidasMes = 0;

  for (const item of entries) {
    const val = Number(item.amount) || 0;
    if (item.type === "entrada") {
      entradasMes += val;
    } else if (item.type === "saida") {
      saidasMes += val;
    }
  }

  const saldoLivre = entradasMes - saidasMes;

  // Soma apenas o saldo restante a pagar (Preço de venda menos Valor já pago)
  // de todos os pedidos que ainda não foram 100% quitados
  let previstoAReceber = 0;
  for (const order of allOrders) {
    if (order.status !== "cancelado" && order.payment_status !== "pago") {
      const sale = Number(order.sale_price) || 0;
      const paid = Number(order.amount_paid) || 0;
      const remaining = Math.max(0, sale - paid);
      if (remaining > 0) {
        previstoAReceber += remaining;
      }
    }
  }

  const urgentOrders = allOrders.filter((order) => {
    const urgency = getDeadlineUrgency(order.due_date, order.status);
    return urgency === "overdue" || urgency === "due-soon";
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Visão Geral</h1>
      </div>

      <AtelierBanner profile={profile} />

      <FinancialSummaryCards
        entradasMes={entradasMes}
        saidasMes={saidasMes}
        saldoLivre={saldoLivre}
        previstoAReceber={previstoAReceber}
      />

      <Card>
        <CardHeader>
          <CardTitle>Prazos que precisam de atenção</CardTitle>
        </CardHeader>
        <CardContent>
          {urgentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum pedido com prazo próximo ou atrasado.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {urgentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{order.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Prazo: {formatDateBR(order.due_date)}
                    </p>
                  </div>
                  <DeadlineBadge dueDate={order.due_date} status={order.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
