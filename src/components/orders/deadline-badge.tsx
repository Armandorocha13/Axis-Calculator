import { Badge, type BadgeTone } from "@/components/ui/badge";
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

  const toneMap: Record<string, BadgeTone> = {
    overdue: "rosa",
    "due-soon": "lavanda",
    ok: "salvia",
    "n/a": "neutral",
  };

  const tone = toneMap[urgency] ?? "neutral";

  return (
    <Badge tone={tone} className="shrink-0 font-medium">
      {deadlineUrgencyLabel[urgency]}
    </Badge>
  );
}
