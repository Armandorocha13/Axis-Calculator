"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AtelierSettingsState {
  error?: string;
  success?: boolean;
}

export async function saveAtelierSettingsAction(
  _prevState: AtelierSettingsState,
  formData: FormData,
): Promise<AtelierSettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const pickup_address = String(formData.get("pickup_address") ?? "").trim();
  const pickup_hours = String(formData.get("pickup_hours") ?? "").trim();
  const pix_key = String(formData.get("pix_key") ?? "").trim();
  const business_name = formData.get("business_name")
    ? String(formData.get("business_name")).trim()
    : undefined;
  const rawTemplate = formData.get("whatsapp_template");
  const whatsapp_template =
    rawTemplate !== null ? String(rawTemplate).trim() : undefined;

  const updateData: Record<string, unknown> = {
    pickup_address: pickup_address || null,
    pickup_hours: pickup_hours || null,
    pix_key: pix_key || null,
  };

  if (business_name !== undefined) {
    updateData.business_name = business_name || null;
  }
  if (whatsapp_template !== undefined) {
    updateData.whatsapp_template = whatsapp_template || null;
  }

  let { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  // Fallback caso a coluna whatsapp_template ainda não tenha sido migrada no banco
  if (error && "whatsapp_template" in updateData) {
    const fallbackData = { ...updateData };
    delete fallbackData.whatsapp_template;
    const retry = await supabase
      .from("profiles")
      .update(fallbackData)
      .eq("id", user.id);
    if (!retry.error) {
      error = null;
    }
  }

  if (error) {
    return { error: "Não foi possível salvar as configurações do ateliê." };
  }

  revalidatePath("/visao-geral");
  revalidatePath("/pedidos");
  revalidatePath("/clientes");
  revalidatePath("/", "layout");

  return { success: true };
}
