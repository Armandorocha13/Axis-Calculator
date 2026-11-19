"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertIsAdmin } from "@/lib/auth/assert-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createUserSchema, updateUserSchema } from "@/lib/validations/admin-user";

export interface AdminUserFormState {
  error?: string;
}

export async function createUserAction(
  _prevState: AdminUserFormState,
  formData: FormData,
): Promise<AdminUserFormState> {
  await assertIsAdmin();

  const parsed = createUserSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name },
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function updateUserAction(
  id: string,
  _prevState: AdminUserFormState,
  formData: FormData,
): Promise<AdminUserFormState> {
  await assertIsAdmin();

  const parsed = updateUserSchema.safeParse({
    full_name: formData.get("full_name"),
    business_name: formData.get("business_name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      business_name: parsed.data.business_name || null,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível atualizar o usuário." };

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function resetPasswordAction(id: string, formData: FormData) {
  await assertIsAdmin();

  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return;

  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(id, { password });
}

export async function toggleBanAction(id: string, banned: boolean) {
  await assertIsAdmin();

  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(id, {
    ban_duration: banned ? "none" : "876000h",
  });

  revalidatePath("/admin/usuarios");
}

export async function deleteUserAction(id: string) {
  await assertIsAdmin();

  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(id);

  revalidatePath("/admin/usuarios");
}
