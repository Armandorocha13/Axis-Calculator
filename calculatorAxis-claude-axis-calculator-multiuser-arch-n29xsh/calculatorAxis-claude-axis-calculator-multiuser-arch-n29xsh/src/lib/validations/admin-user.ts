import { z } from "zod";

export const createUserSchema = z.object({
  full_name: z.string().trim().min(1, "Informe o nome."),
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  full_name: z.string().trim().min(1, "Informe o nome."),
  business_name: z.string().trim().optional().or(z.literal("")),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
