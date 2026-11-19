"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cashFlowSchema } from "@/lib/validations/cash-flow";

export interface CashFlowFormState {
  error?: string;
  success?: boolean;
}

function parseCashFlowForm(formData: FormData) {
  const motivo =
    formData.get("motivo") ||
    formData.get("description") ||
    formData.get("category");

  return cashFlowSchema.safeParse({
    type: formData.get("type"),
    motivo,
    amount: formData.get("amount"),
    entry_date: formData.get("entry_date"),
  });
}

export async function createCashFlowAction(
  _prevState: CashFlowFormState,
  formData: FormData,
): Promise<CashFlowFormState> {
  const parsed = parseCashFlowForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase.from("cash_flow_entries").insert({
    user_id: user.id,
    type: parsed.data.type,
    category: parsed.data.motivo,
    description: parsed.data.motivo,
    amount: parsed.data.amount,
    entry_date: parsed.data.entry_date,
  });

  if (error) {
    return { error: "Não foi possível registrar a movimentação." };
  }

  revalidatePath("/fluxo-de-caixa");
  revalidatePath("/dashboard");
  revalidatePath("/visao-geral");
  return { success: true };
}

export async function updateCashFlowAction(
  id: string,
  _prevState: CashFlowFormState,
  formData: FormData,
): Promise<CashFlowFormState> {
  const parsed = parseCashFlowForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("cash_flow_entries")
    .update({
      type: parsed.data.type,
      category: parsed.data.motivo,
      description: parsed.data.motivo,
      amount: parsed.data.amount,
      entry_date: parsed.data.entry_date,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível atualizar a movimentação." };
  }

  revalidatePath("/fluxo-de-caixa");
  revalidatePath("/dashboard");
  revalidatePath("/visao-geral");
  return { success: true };
}

export async function deleteCashFlowAction(id: string) {
  const supabase = await createClient();
  await supabase.from("cash_flow_entries").delete().eq("id", id);
  revalidatePath("/fluxo-de-caixa");
  revalidatePath("/dashboard");
  revalidatePath("/visao-geral");
}
