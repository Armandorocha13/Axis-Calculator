import { Badge } from "@/components/ui/badge";
import { getDeadlineUrgency, deadlineUrgencyLabel } from "@/lib/orders/deadline";
import type { OrderStatus } from "@/lib/types/database.types";

export function DeadlineBadge({
  dueDate,
  status,
}: {
  dueDate: string;
  status: OrderStatus;
}) {
  const urgency = getDeadlineUrgency(dueDate, status);
  const tone =
    urgency === "overdue" ? "accent" : urgency === "due-soon" ? "solid" : "neutral";

  return (
    <Badge tone={tone} className="shrink-0">
      {deadlineUrgencyLabel[urgency]}
    </Badge>
  );
}
