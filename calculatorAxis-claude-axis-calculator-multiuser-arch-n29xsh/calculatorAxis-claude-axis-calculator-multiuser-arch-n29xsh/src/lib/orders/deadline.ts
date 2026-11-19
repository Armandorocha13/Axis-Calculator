import { differenceInCalendarDays } from "date-fns";
import type { OrderStatus } from "@/lib/types/database.types";

export type DeadlineUrgency = "overdue" | "due-soon" | "ok" | "n/a";

export function getDeadlineUrgency(
  dueDate: string,
  status: OrderStatus,
  thresholdDays = 3,
): DeadlineUrgency {
  if (status === "entregue" || status === "cancelado") return "n/a";

  const diffDays = differenceInCalendarDays(new Date(dueDate), new Date());
  if (diffDays < 0) return "overdue";
  if (diffDays <= thresholdDays) return "due-soon";
  return "ok";
}

export const deadlineUrgencyLabel: Record<DeadlineUrgency, string> = {
  overdue: "Atrasado",
  "due-soon": "Prazo próximo",
  ok: "No prazo",
  "n/a": "—",
};
