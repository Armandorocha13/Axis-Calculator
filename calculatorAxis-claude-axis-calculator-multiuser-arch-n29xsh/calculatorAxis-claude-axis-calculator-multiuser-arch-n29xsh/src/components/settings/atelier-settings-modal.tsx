"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveAtelierSettingsAction } from "@/lib/settings/actions";
import type { Profile } from "@/lib/types/database.types";

interface AtelierSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: Profile | null;
}

export function AtelierSettingsModal({
  isOpen,
  onClose,
  profile,
}: AtelierSettingsModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await saveAtelierSettingsAction({}, formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 600);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-semibold">Configurações do Ateliê</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dados para retirada de encomendas e mensagem automática de WhatsApp
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="business_name">Nome do Ateliê / Negócio</Label>
            <Input
              id="business_name"
              name="business_name"
              defaultValue={profile?.business_name ?? ""}
              placeholder="Ex: Ateliê Mãos de Fada"
            />
          </div>

          <div>
            <Label htmlFor="pickup_address">Endereço de retirada</Label>
            <Input
              id="pickup_address"
              name="pickup_address"
              defaultValue={profile?.pickup_address ?? ""}
              placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo"
              required
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Inserido automaticamente na mensagem de aviso pelo WhatsApp.
            </p>
          </div>

          <div>
            <Label htmlFor="pickup_hours">Horário de retirada</Label>
            <Input
              id="pickup_hours"
              name="pickup_hours"
              defaultValue={profile?.pickup_hours ?? ""}
              placeholder="Ex: Seg a Sex das 09h às 18h / Sáb até às 13h"
              required
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Exibido no aviso do WhatsApp para combinar o recolhimento com o cliente.
            </p>
          </div>

          <div>
            <Label htmlFor="pix_key">Chave Pix</Label>
            <Input
              id="pix_key"
              name="pix_key"
              defaultValue={profile?.pix_key ?? ""}
              placeholder="Ex: 11987654321 ou contato@atelie.com"
              required
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Enviada junto ao valor restante quando o pedido ainda tiver saldo a pagar.
            </p>
          </div>

          {error && (
            <p className="text-sm text-accent" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-emerald-600 font-medium" role="status">
              ✓ Configurações salvas com sucesso!
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
