"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminUserFormState } from "@/app/admin/usuarios/actions";
import type { Profile } from "@/lib/types/database.types";

const initialState: AdminUserFormState = {};

export function UpdateUserForm({
  action,
  profile,
}: {
  action: (
    state: AdminUserFormState,
    formData: FormData,
  ) => Promise<AdminUserFormState>;
  profile: Profile | null;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="full_name">Nome</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={profile?.full_name ?? ""}
          required
        />
      </div>
      <div>
        <Label htmlFor="business_name">Nome do negócio</Label>
        <Input
          id="business_name"
          name="business_name"
          defaultValue={profile?.business_name ?? ""}
        />
      </div>
      {state?.error && (
        <p className="text-sm text-accent" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
