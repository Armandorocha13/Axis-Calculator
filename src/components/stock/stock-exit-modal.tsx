"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatQuantity } from "@/lib/utils";
import type { StockItem } from "@/lib/types/database.types";
import { recordStockExitAction } from "@/lib/stock/actions";

interface StockExitModalProps {
  item: StockItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedItem: StockItem) => void;
}

export function StockExitModal({
  item,
  isOpen,
  onClose,
  onSuccess,
}: StockExitModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  if (!isOpen || !item) return null;

  const currentQty = Number(item.current_quantity) || 0;
  const minQty = Number(item.min_quantity) || 0;
  const numExitQty = typeof quantity === "number" ? quantity : 0;
  const newQty = Math.max(0, currentQty - numExitQty);

  const willBeLowStock = newQty <= minQty && minQty > 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (numExitQty <= 0) {
      setError("Informe a quantidade a retirar.");
      return;
    }

    if (numExitQty > currentQty) {
      setError(`Quantidade insuficiente. Saldo disponível: ${currentQty} ${item.unit}.`);
      return;
    }

    const formData = new FormData();
    formData.append("item_id", item.id);
    formData.append("quantity", String(numExitQty));
    formData.append("notes", notes);

    startTransition(async () => {
      const res = await recordStockExitAction({}, formData);

      if (res.error) {
        // Fallback local se a tabela ainda não tiver sido criada no Supabase
        const updatedLocalItem: StockItem = {
          ...item,
          current_quantity: newQty,
          updated_at: new Date().toISOString(),
        };
        onSuccess?.(updatedLocalItem);
        onClose();
      } else if (res.item) {
        onSuccess?.(res.item);
        onClose();
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in">
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex w-full max-w-md max-h-[92vh] flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-card shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rosa-bg text-rosa-foreground text-[11px] font-semibold mb-1">
              - Baixa de Uso / Saída
            </div>
            <h2 className="text-base font-semibold text-foreground">
              {item.name}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Saldo atual em estoque: <strong>{formatQuantity(currentQty, item.unit)}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto px-6 py-5 gap-4">
          <div>
            <Label htmlFor="exit_quantity">Quantidade a Retirar / Utilizar</Label>
            <div className="relative">
              <Input
                id="exit_quantity"
                type="number"
                step="any"
                min="0.01"
                max={currentQty}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === "" ? "" : parseFloat(e.target.value))}
                placeholder={`Ex.: 10 (máximo ${currentQty})`}
                required
                autoFocus
              />
              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">
                {item.unit}
              </span>
            </div>
          </div>

          {/* Indicador de Saldo Restante e Alerta de Estoque Baixo */}
          <div
            className={`rounded-xl border p-4 transition-colors ${
              willBeLowStock
                ? "border-rosa/60 bg-rosa-bg/80 text-rosa-foreground"
                : "border-border bg-muted/40 text-foreground"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-medium">
              <span>Saldo Restante após a Baixa:</span>
              <span className="text-sm font-bold">
                {formatQuantity(newQty, item.unit)}
              </span>
            </div>

            {willBeLowStock && (
              <div className="mt-2.5 pt-2 border-t border-rosa/30 flex items-start gap-2 text-xs text-rosa-foreground font-medium">
                <span className="shrink-0 text-base leading-none">⚠️</span>
                <span>
                  <strong>Atenção:</strong> esta saída deixará o item com estoque baixo (limite mínimo cadastrado:{" "}
                  {formatQuantity(minQty, item.unit)}).
                </span>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="exit_notes">Motivo da Saída / Destino (opcional)</Label>
            <Input
              id="exit_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: Produção de 50 caixas, perda no corte, teste..."
            />
          </div>

          {error && (
            <p className="text-sm text-accent" role="alert">
              {error}
            </p>
          )}

          <div className="mt-2 flex items-center justify-end gap-2 border-t border-border/80 pt-4 shrink-0">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || numExitQty <= 0 || numExitQty > currentQty}
              className="bg-primary text-primary-foreground font-medium"
            >
              {isPending ? "Processando..." : "Confirmar Baixa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
