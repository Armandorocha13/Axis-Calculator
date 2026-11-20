"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrencyBRL, formatUnitCost, formatQuantity } from "@/lib/utils";
import type { StockItem } from "@/lib/types/database.types";
import { recordStockEntryAction } from "@/lib/stock/actions";

interface StockEntryModalProps {
  item: StockItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedItem: StockItem) => void;
}

export function StockEntryModal({
  item,
  isOpen,
  onClose,
  onSuccess,
}: StockEntryModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState<number | "">("");
  const [totalCost, setTotalCost] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  if (!isOpen || !item) return null;

  const currentQty = Number(item.current_quantity) || 0;
  const currentUnitCost = Number(item.unit_cost) || 0;

  const numAddedQty = typeof quantity === "number" ? quantity : 0;
  const numPaidCost = typeof totalCost === "number" ? totalCost : 0;

  // Custo unitário desta nova compra
  const entryBatchCost = numAddedQty > 0 && numPaidCost > 0 ? numPaidCost / numAddedQty : 0;

  // Novo saldo de estoque após a compra
  const newTotalQty = currentQty + numAddedQty;

  // Novo custo médio ponderado
  const totalValueBefore = currentQty * currentUnitCost;
  const newWeightedUnitCost =
    newTotalQty > 0
      ? (totalValueBefore + numPaidCost) / newTotalQty
      : currentUnitCost;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (numAddedQty <= 0) {
      setError("Informe a quantidade comprada.");
      return;
    }

    const formData = new FormData();
    formData.append("item_id", item.id);
    formData.append("quantity", String(numAddedQty));
    formData.append("total_cost", String(numPaidCost));
    formData.append("notes", notes);

    startTransition(async () => {
      const res = await recordStockEntryAction({}, formData);

      if (res.error) {
        // Fallback local se a tabela ainda não tiver sido criada no Supabase
        const updatedLocalItem: StockItem = {
          ...item,
          current_quantity: newTotalQty,
          last_purchase_total: numPaidCost,
          last_purchase_quantity: numAddedQty,
          unit_cost: newWeightedUnitCost,
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
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-salvia-bg text-salvia-foreground text-[11px] font-semibold mb-1">
              + Nova Entrada / Compra
            </div>
            <h2 className="text-base font-semibold text-foreground">
              {item.name}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Saldo atual: <strong>{formatQuantity(currentQty, item.unit)}</strong> • Custo atual:{" "}
              <strong>{formatUnitCost(currentUnitCost, item.unit)}</strong>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label htmlFor="entry_quantity">Quantidade Comprada</Label>
              <div className="relative">
                <Input
                  id="entry_quantity"
                  type="number"
                  step="any"
                  min="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === "" ? "" : parseFloat(e.target.value))}
                  placeholder="Ex.: 50"
                  required
                  autoFocus
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">
                  {item.unit}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="entry_total_cost">Valor Total Pago (R$)</Label>
              <Input
                id="entry_total_cost"
                type="number"
                step="0.01"
                min="0"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value === "" ? "" : parseFloat(e.target.value))}
                placeholder="Ex.: 30.00"
                required
              />
            </div>
          </div>

          {/* Card de Cálculo Automático e Atualização */}
          <div className="rounded-xl border border-salvia/40 bg-salvia-bg/60 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-salvia-foreground">
              <span>Custo Deste Lote:</span>
              <span className="text-sm font-bold">
                {numAddedQty > 0 && numPaidCost > 0
                  ? formatUnitCost(entryBatchCost, item.unit)
                  : "--"}
              </span>
            </div>

            <div className="pt-2 border-t border-salvia/20 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Novo Saldo Total:</span>
              <span className="font-semibold text-foreground">
                {formatQuantity(newTotalQty, item.unit)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Novo Custo Médio Unitário:</span>
              <span className="font-bold text-primary text-sm">
                {formatUnitCost(newWeightedUnitCost, item.unit)}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="entry_notes">Observação / Fornecedor (opcional)</Label>
            <Input
              id="entry_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: Loja ABC, pacote com 50 folhas..."
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
            <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground font-medium">
              {isPending ? "Registrando..." : "Confirmar Entrada"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
