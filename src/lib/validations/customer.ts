import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do cliente."),
  phone: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;
