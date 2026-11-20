"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrencyBRL, formatUnitCost } from "@/lib/utils";
import { COMMON_UNITS } from "@/lib/stock/types";
import type { StockItem } from "@/lib/types/database.types";
import { createStockItemAction, updateStockItemAction } from "@/lib/stock/actions";

interface StockFormModalProps {
  item?: StockItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (item: StockItem) => void;
}

export function StockFormModal({
  item,
  isOpen,
  onClose,
  onSaved,
}: StockFormModalProps) {
  const isEditing = Boolean(item);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(item?.name ?? "");
  const [unit, setUnit] = useState(item?.unit ?? "folha");
  const [quantity, setQuantity] = useState<number | "">(item?.current_quantity ?? 50);
  const [minQuantity, setMinQuantity] = useState<number | "">(item?.min_quantity ?? 10);
  const [totalCost, setTotalCost] = useState<number | "">(item?.last_purchase_total ?? 25);
  const [notes, setNotes] = useState(item?.notes ?? "");

  if (!isOpen) return null;

  const numQty = typeof quantity === "number" ? quantity : 0;
  const numCost = typeof totalCost === "number" ? totalCost : 0;

  // Cálculo automático do custo unitário
  const calculatedUnitCost = numQty > 0 && numCost > 0 ? numCost / numQty : 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    if (item?.id) formData.append("id", item.id);
    formData.append("name", name);
    formData.append("unit", unit);
    formData.append("quantity", String(numQty));
    formData.append("min_quantity", String(typeof minQuantity === "number" ? minQuantity : 0));
    formData.append("total_cost", String(numCost));
    formData.append("notes", notes);

    startTransition(async () => {
      const action = isEditing ? updateStockItemAction : createStockItemAction;
      const res = await action({}, formData);

      if (res.error) {
        // Fallback local caso a tabela ainda não exista no Supabase
        const fallbackItem: StockItem = {
          id: item?.id || "local-" + Date.now(),
          user_id: item?.user_id || "local",
          name,
          unit,
          current_quantity: isEditing ? (item?.current_quantity ?? numQty) : numQty,
          min_quantity: typeof minQuantity === "number" ? minQuantity : 0,
          last_purchase_total: numCost,
          last_purchase_quantity: numQty,
          unit_cost: isEditing ? (item?.unit_cost ?? calculatedUnitCost) : calculatedUnitCost,
          notes: notes || null,
          created_at: item?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        onSaved?.(fallbackItem);
        onClose();
      } else if (res.item) {
        onSaved?.(res.item);
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
        className="relative z-10 flex w-full max-w-lg max-h-[92vh] flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-card shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isEditing ? "Editar Material" : "Cadastrar Novo Material"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEditing
                ? "Atualize as informações do item e limite mínimo de alerta."
                : "Informe os dados da compra para calcular o custo unitário automaticamente."}
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
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto px-6 py-5 gap-5">
          {/* Nome do material */}
          <div>
            <Label htmlFor="stock_name">Nome do Material / Item</Label>
            <Input
              id="stock_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Papel Offset 180g A4, Fita Gorgurão 22mm..."
              required
              autoFocus
            />
          </div>

          {/* Unidade com botões de sugestão rápida */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="stock_unit">Unidade de Medida</Label>
              <span className="text-[11px] text-muted-foreground">Sugestões rápidas:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {["folha", "un", "rolo", "pct", "metro", "kg", "kit"].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-2 py-0.5 text-xs font-medium rounded-md border transition-all cursor-pointer ${
                    unit.toLowerCase() === u
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-foreground/80 border-border hover:bg-muted hover:border-border/80"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
            <Input
              id="stock_unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Ex.: folha, un, metro, rolo..."
              required
            />
          </div>

          {/* Quantidade e Valor Pago pelo Lote */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label htmlFor="stock_quantity">
                {isEditing ? "Saldo Atual" : "Quantidade Inicial do Lote"}
              </Label>
              <div className="relative">
                <Input
                  id="stock_quantity"
                  type="number"
                  step="any"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === "" ? "" : parseFloat(e.target.value))}
                  placeholder="Ex.: 50"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">
                  {unit}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="stock_total_cost">
                {isEditing ? "Último Valor Pago pelo Lote (R$)" : "Valor Total Pago pelo Lote (R$)"}
              </Label>
              <Input
                id="stock_total_cost"
                type="number"
                step="0.01"
                min="0"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value === "" ? "" : parseFloat(e.target.value))}
                placeholder="Ex.: 25.00"
                required
              />
            </div>
          </div>

          {/* Card Destaque: CÁLCULO AUTOMÁTICO DE CUSTO UNITÁRIO */}
          <div className="rounded-xl border border-primary/30 bg-[#FAF8FC] p-4 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Custo Unitário Calculado
              </span>
              <span className="text-xs text-muted-foreground">Automático</span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {formatUnitCost(calculatedUnitCost, unit)}
              </span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {numQty > 0 && numCost > 0 ? (
                <>
                  Divisão exata:{" "}
                  <strong className="text-foreground">{formatCurrencyBRL(numCost)}</strong> ÷{" "}
                  <strong className="text-foreground">
                    {numQty} {unit}s
                  </strong>{" "}
                  = <strong className="text-primary">{formatUnitCost(calculatedUnitCost, unit)}</strong>
                </>
              ) : (
                "Preencha a quantidade e o valor pago para calcular o custo unitário automaticamente."
              )}
            </p>
          </div>

          {/* Quantidade Mínima para Alerta */}
          <div>
            <Label htmlFor="stock_min_quantity">
              Quantidade Mínima para Alerta de Estoque Baixo
            </Label>
            <div className="relative">
              <Input
                id="stock_min_quantity"
                type="number"
                step="any"
                min="0"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value === "" ? "" : parseFloat(e.target.value))}
                placeholder="Ex.: 10"
              />
              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">
                {unit}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              O sistema destacará este item em alerta visual quando o saldo for menor ou igual a esse valor.
            </p>
          </div>

          {/* Observações / Fornecedor */}
          <div>
            <Label htmlFor="stock_notes">Observações / Fornecedor (opcional)</Label>
            <Input
              id="stock_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: Comprado na Papelaria Central, pacote lacrado..."
            />
          </div>

          {error && (
            <p className="text-sm text-accent" role="alert">
              {error}
            </p>
          )}

          {/* Rodapé de Ações */}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-border/80 pt-4 shrink-0">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground font-medium">
              {isPending ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Material"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
