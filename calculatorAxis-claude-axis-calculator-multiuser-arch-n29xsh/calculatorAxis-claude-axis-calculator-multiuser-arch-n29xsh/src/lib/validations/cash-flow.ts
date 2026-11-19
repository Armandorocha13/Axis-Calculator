import { z } from "zod";

export const cashFlowTypeValues = ["entrada", "saida"] as const;
export type CashFlowTypeValue = (typeof cashFlowTypeValues)[number];

export const cashFlowSchema = z.object({
  type: z.enum(cashFlowTypeValues, {
    message: "Tipo inválido (deve ser entrada ou saída).",
  }),
  motivo: z.string().trim().min(1, "O motivo é obrigatório."),
  amount: z.coerce
    .number({ message: "Valor inválido." })
    .positive("O valor deve ser maior que zero."),
  entry_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD."),
});

export type CashFlowInput = z.infer<typeof cashFlowSchema>;
