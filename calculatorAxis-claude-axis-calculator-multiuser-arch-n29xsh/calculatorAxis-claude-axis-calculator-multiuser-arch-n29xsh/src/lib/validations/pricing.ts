import { z } from "zod";

export const priceCalculationSchema = z.object({
  unit_cost: z.coerce.number().positive("O custo unitário deve ser maior que zero."),
  quantity: z.coerce.number().positive("Informe quantas unidades."),
  profit_margin_percent: z.coerce
    .number()
    .min(0, "A margem não pode ser negativa."),
  order_id: z.string().uuid().optional().or(z.literal("")),
});

export type PriceCalculationInput = z.infer<typeof priceCalculationSchema>;
