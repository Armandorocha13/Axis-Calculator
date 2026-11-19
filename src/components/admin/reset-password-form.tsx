"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      action={async (formData) => {
        await action(formData);
        setSubmitted(true);
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <Label htmlFor="password">Nova senha</Label>
        <Input id="password" name="password" type="password" minLength={6} required />
      </div>
      {submitted && (
        <p className="text-sm text-foreground">Senha atualizada.</p>
      )}
      <Button type="submit" variant="secondary">
        Redefinir senha
      </Button>
    </form>
  );
}
