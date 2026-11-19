"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomerFormState } from "@/app/(app)/clientes/actions";
import type { Customer } from "@/lib/types/database.types";

const initialState: CustomerFormState = {};

export function CustomerForm({
  action,
  defaultValues,
  submitLabel = "Salvar cliente",
}: {
  action: (
    state: CustomerFormState,
    formData: FormData,
  ) => Promise<CustomerFormState>;
  defaultValues?: Partial<Customer>;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" defaultValue={defaultValues?.name} required />
      </div>
      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" name="phone" defaultValue={defaultValues?.phone ?? ""} />
      </div>
      <div>
        <Label htmlFor="notes">Observações</Label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes ?? ""}
          rows={3}
          className="w-full rounded-md border border-foreground/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-accent" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
