import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdateUserForm } from "@/components/admin/update-user-form";
import { ResetPasswordForm } from "@/components/admin/reset-password-form";
import { updateUserAction, resetPasswordAction } from "../actions";
import type { Profile } from "@/lib/types/database.types";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: authUser }, { data: profile }] = await Promise.all([
    admin.auth.admin.getUserById(id),
    admin.from("profiles").select("*").eq("id", id).maybeSingle<Profile>(),
  ]);

  if (!authUser?.user) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Editar usuário</h1>
      <p className="text-sm text-muted-foreground">{authUser.user.email}</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <UpdateUserForm
              action={updateUserAction.bind(null, id)}
              profile={profile}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Senha de acesso</CardTitle>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm
              action={async (formData) => {
                "use server";
                await resetPasswordAction(id, formData);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
