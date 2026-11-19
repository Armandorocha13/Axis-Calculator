"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { customerSchema } from "@/lib/validations/customer";

export interface CustomerFormState {
  error?: string;
}

function parseCustomerForm(formData: FormData) {
  return customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  });
}

export async function createCustomerAction(
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const parsed = parseCustomerForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("customers").insert({
    user_id: user.id,
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    notes: parsed.data.notes || null,
  });

  if (error) return { error: "Não foi possível salvar o cliente." };

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateCustomerAction(
  id: string,
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const parsed = parseCustomerForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível atualizar o cliente." };

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function deleteCustomerAction(id: string) {
  const supabase = await createClient();
  await supabase.from("customers").delete().eq("id", id);
  revalidatePath("/clientes");
}
