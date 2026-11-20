"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableTd,
  TableTh,
} from "@/components/ui/table";
import { formatCurrencyBRL, formatUnitCost, formatQuantity } from "@/lib/utils";
import type { StockItem } from "@/lib/types/database.types";

interface StockTableProps {
  items: StockItem[];
  onOpenEntry: (item: StockItem) => void;
  onOpenExit: (item: StockItem) => void;
  onOpenEdit: (item: StockItem) => void;
  onDelete: (item: StockItem) => void;
}

export function StockTable({
  items,
  onOpenEntry,
  onOpenExit,
  onOpenEdit,
  onDelete,
}: StockTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-card rounded-2xl border border-dashed border-border">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-foreground">Nenhum material cadastrado</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Cadastre seus papéis, fitas, caixas e insumos para acompanhar o estoque e consultar o custo unitário na hora de precificar.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Visualização em Tabela para Telas Médias e Grandes (Desktop) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Material / Item</TableTh>
              <TableTh>Saldo em Estoque</TableTh>
              <TableTh>Custo Unitário (Precificação)</TableTh>
              <TableTh>Último Lote Pago</TableTh>
              <TableTh className="text-right">Ações Rápidas</TableTh>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const currentQty = Number(item.current_quantity) || 0;
              const minQty = Number(item.min_quantity) || 0;
              const unitCost = Number(item.unit_cost) || 0;
              const lastTotal = Number(item.last_purchase_total) || 0;
              const lastQty = Number(item.last_purchase_quantity) || 1;
              const isLowStock = currentQty <= minQty && minQty > 0;

              return (
                <TableRow
                  key={item.id}
                  className={isLowStock ? "bg-rosa-bg/25 hover:bg-rosa-bg/40 transition-colors" : ""}
                >
                  {/* Nome e Notas */}
                  <TableTd>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{item.name}</span>
                      {item.notes ? (
                        <span className="text-xs text-muted-foreground line-clamp-1">{item.notes}</span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Unidade: {item.unit}</span>
                      )}
                    </div>
                  </TableTd>

                  {/* Saldo e Alerta */}
                  <TableTd>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">
                        {formatQuantity(currentQty, item.unit)}
                      </span>
                      {isLowStock ? (
                        <Badge tone="rosa" className="animate-pulse">
                          ⚠️ Estoque Baixo (mín. {formatQuantity(minQty)})
                        </Badge>
                      ) : (
                        <Badge tone="salvia">✓ Disponível</Badge>
                      )}
                    </div>
                  </TableTd>

                  {/* Custo Unitário com Destaque Forte para Consulta de Precificação */}
                  <TableTd>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EFEBF7] border border-primary/25 shadow-2xs">
                      <span className="text-xs font-semibold text-primary">Custo:</span>
                      <span className="text-sm font-bold text-[#454052]">
                        {formatUnitCost(unitCost, item.unit)}
                      </span>
                    </div>
                  </TableTd>

                  {/* Último Lote */}
                  <TableTd>
                    <div className="flex flex-col text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{formatCurrencyBRL(lastTotal)}</span>
                      <span>Lote de {formatQuantity(lastQty, item.unit)}</span>
                    </div>
                  </TableTd>

                  {/* Ações */}
                  <TableTd className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenEntry(item)}
                        title="Registrar nova compra (+ Entrada)"
                        className="h-8 px-2.5 text-xs text-salvia-foreground border-salvia/40 hover:bg-salvia-bg/80 cursor-pointer"
                      >
                        + Entrada
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenExit(item)}
                        disabled={currentQty <= 0}
                        title="Registrar uso/consumo (- Baixa)"
                        className="h-8 px-2.5 text-xs text-rosa-foreground border-rosa/50 hover:bg-rosa-bg/80 cursor-pointer"
                      >
                        - Baixa
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenEdit(item)}
                        title="Editar material"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onDelete(item)}
                        title="Excluir material"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-accent cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </Button>
                    </div>
                  </TableTd>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Visualização em Cards para Dispositivos Móveis e Tablets */}
      <div className="grid grid-cols-1 gap-3.5 md:hidden">
        {items.map((item) => {
          const currentQty = Number(item.current_quantity) || 0;
          const minQty = Number(item.min_quantity) || 0;
          const unitCost = Number(item.unit_cost) || 0;
          const lastTotal = Number(item.last_purchase_total) || 0;
          const isLowStock = currentQty <= minQty && minQty > 0;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 bg-card shadow-xs flex flex-col gap-3 transition-colors ${
                isLowStock ? "border-rosa/60 bg-[#FFFDFE]" : "border-border"
              }`}
            >
              {/* Topo do Card */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-foreground text-sm leading-tight">{item.name}</h4>
                  {item.notes && <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>}
                </div>
                {isLowStock ? (
                  <Badge tone="rosa" className="shrink-0 animate-pulse">
                    ⚠️ Estoque Baixo
                  </Badge>
                ) : (
                  <Badge tone="salvia" className="shrink-0">
                    ✓ Em dia
                  </Badge>
                )}
              </div>

              {/* Informações Centrais: Saldo e Custo Unitário */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-muted/30 border border-border/60">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Saldo em Estoque</span>
                  <span className="text-base font-bold text-foreground">
                    {formatQuantity(currentQty, item.unit)}
                  </span>
                  {minQty > 0 && (
                    <span className="text-[10px] text-muted-foreground block">
                      Mínimo: {formatQuantity(minQty, item.unit)}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block">Custo Unitário</span>
                  <span className="text-sm font-bold text-primary block">
                    {formatUnitCost(unitCost, item.unit)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Lote: {formatCurrencyBRL(lastTotal)}
                  </span>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex items-center justify-between pt-1 border-t border-border/60 gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onOpenEntry(item)}
                    className="h-8 px-3 text-xs text-salvia-foreground border-salvia/40 hover:bg-salvia-bg"
                  >
                    + Entrada
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onOpenExit(item)}
                    disabled={currentQty <= 0}
                    className="h-8 px-3 text-xs text-rosa-foreground border-rosa/50 hover:bg-rosa-bg"
                  >
                    - Baixa
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenEdit(item)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    aria-label="Editar"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onDelete(item)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-accent"
                    aria-label="Excluir"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
