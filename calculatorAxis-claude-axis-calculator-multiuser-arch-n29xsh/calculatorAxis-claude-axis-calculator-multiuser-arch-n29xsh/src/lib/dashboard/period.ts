import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import type { FinancialSummary, Order } from "@/lib/types/database.types";

export const periodValues = ["semana", "mes", "ano", "tudo"] as const;
export type Period = (typeof periodValues)[number];

export const periodLabels: Record<Period, string> = {
  semana: "Semana",
  mes: "Mês",
  ano: "Ano",
  tudo: "Tudo",
};

export function getPeriodRange(period: Period): { start: Date; end: Date } | null {
  const now = new Date();
  switch (period) {
    case "semana":
      return { start: startOfWeek(now), end: endOfWeek(now) };
    case "mes":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "ano":
      return { start: startOfYear(now), end: endOfYear(now) };
    case "tudo":
      return null;
  }
}

export function filterOrdersByPeriod(orders: Order[], period: Period): Order[] {
  const range = getPeriodRange(period);
  if (!range) return orders;
  return orders.filter((order) => {
    const createdAt = new Date(order.created_at);
    return createdAt >= range.start && createdAt <= range.end;
  });
}

/** Mesma fórmula da view SQL `financial_summary`, calculada em JS sobre uma lista já filtrada. */
export function summarizeOrders(orders: Order[]): FinancialSummary {
  let totalGasto = 0;
  let totalRecebido = 0;
  let previstoAReceber = 0;

  for (const order of orders) {
    totalGasto += order.total_cost ?? 0;
    totalRecebido += order.amount_paid ?? 0;
    if (order.status !== "entregue" && order.status !== "cancelado") {
      previstoAReceber += order.sale_price ?? 0;
    }
  }

  return {
    user_id: "",
    total_gasto: totalGasto,
    total_recebido: totalRecebido,
    lucro_realizado: totalRecebido - totalGasto,
    previsto_a_receber: previstoAReceber,
  };
}
