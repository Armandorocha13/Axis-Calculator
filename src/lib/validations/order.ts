import { z } from "zod";

export const orderStatusValues = [
  "pendente",
  "em_producao",
  "pronto",
  "entregue",
  "cancelado",
] as const;

export const paymentStatusValues = ["pendente", "parcial", "pago"] as const;

export const orderSchema = z.object({
  description: z.string().trim().min(1, "Descreva o pedido."),
  customer_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(orderStatusValues),
  due_date: z.string().min(1, "Informe o prazo de entrega."),
  total_cost: z.coerce.number().min(0).optional(),
  sale_price: z.coerce.number().min(0).optional(),
  payment_status: z.enum(paymentStatusValues),
  amount_paid: z.coerce.number().min(0).default(0),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type OrderInput = z.infer<typeof orderSchema>;
