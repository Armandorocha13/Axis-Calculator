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

  const updateData: Partial<import("@/lib/types/database.types").Profile> = {
    pickup_address: pickup_address || null,
    pickup_hours: pickup_hours || null,
    pix_key: pix_key || null,
  };

  if (business_name !== undefined) {
    updateData.business_name = business_name || null;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    return { error: "Não foi possível salvar as configurações do ateliê." };
  }

  revalidatePath("/visao-geral");
  revalidatePath("/pedidos");
  revalidatePath("/clientes");
  revalidatePath("/", "layout");

  return { success: true };
}
