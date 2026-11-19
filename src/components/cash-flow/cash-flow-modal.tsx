"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CashFlowTypeValue } from "@/lib/validations/cash-flow";
import {
  createCashFlowAction,
  updateCashFlowAction,
  type CashFlowFormState,
} from "@/app/(app)/fluxo-de-caixa/actions";
import type { CashFlowEntry } from "@/lib/types/database.types";

interface CashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: CashFlowTypeValue;
  editingEntry?: CashFlowEntry | null;
}

export function CashFlowModal({
  isOpen,
  onClose,
  defaultType = "entrada",
  editingEntry,
}: CashFlowModalProps) {
  const [type, setType] = useState<CashFlowTypeValue>(
    editingEntry ? editingEntry.type : defaultType,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleTypeChange(newType: CashFlowTypeValue) {
    setType(newType);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      let res: CashFlowFormState;
      if (editingEntry) {
        res = await updateCashFlowAction(editingEntry.id, {}, formData);
      } else {
        res = await createCashFlowAction({}, formData);
      }

      if (res.error) {
        setError(res.error);
      } else {
        onClose();
      }
    });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-semibold">
            {editingEntry
              ? "Editar Movimentação"
              : type === "entrada"
                ? "Nova Entrada"
                : "Nova Saída"}
          </h2>
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
          {/* Tipo (Entrada ou Saída) */}
          <div>
            <Label>Tipo de movimentação</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => handleTypeChange("entrada")}
                className={`rounded-md border py-2 text-sm font-medium transition-colors ${
                  type === "entrada"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                + Entrada
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("saida")}
                className={`rounded-md border py-2 text-sm font-medium transition-colors ${
                  type === "saida"
                    ? "border-red-600 bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                - Saída
              </button>
            </div>
            <input type="hidden" name="type" value={type} />
          </div>

          {/* Valor (R$) */}
          <div>
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={editingEntry ? editingEntry.amount : ""}
              placeholder="0,00"
              required
              autoFocus
            />
          </div>

          {/* Data */}
          <div>
            <Label htmlFor="entry_date">Data</Label>
            <Input
              id="entry_date"
              name="entry_date"
              type="date"
              defaultValue={editingEntry ? editingEntry.entry_date : todayStr}
              required
            />
          </div>

          {/* Motivo (campo de texto livre) */}
          <div>
            <Label htmlFor="motivo">Motivo</Label>
            <Input
              id="motivo"
              name="motivo"
              defaultValue={
                editingEntry
                  ? editingEntry.description || editingEntry.category
                  : ""
              }
              placeholder={
                type === "entrada"
                  ? "Ex: Venda pronta-entrega ou Entrada de pedido"
                  : "Ex: Compra de insumos, Embalagens ou Conta de luz"
              }
              required
            />
          </div>

          {error && (
            <p className="text-sm text-accent" role="alert">
              {error}
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
              {isPending
                ? "Salvando..."
                : editingEntry
                  ? "Atualizar"
                  : type === "entrada"
                    ? "Salvar Entrada"
                    : "Salvar Saída"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
