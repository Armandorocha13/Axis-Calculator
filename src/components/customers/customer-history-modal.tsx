"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableTd,
  TableTh,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import type { Customer, Order } from "@/lib/types/database.types";

const statusLabels: Record<Order["status"], string> = {
  pendente: "Pendente",
  em_producao: "Em produção",
  pronto: "Pronto para envio/retirada",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const statusToneMap: Record<Order["status"], "neutral" | "solid" | "lavanda" | "salvia" | "rosa"> = {
  pendente: "neutral",
  em_producao: "lavanda",
  pronto: "salvia",
  entregue: "salvia",
  cancelado: "rosa",
};

interface CustomerHistoryModalProps {
  customer: Customer | null;
  orders: Order[];
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerHistoryModal({
  customer,
  orders,
  isOpen,
  onClose,
}: CustomerHistoryModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !customer || !mounted) return null;

  const totalPedidos = orders.length;
  const totalGasto = orders.reduce(
    (sum, o) => sum + (Number(o.sale_price) || 0),
    0,
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop com blur suave */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Card do Modal */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex w-full max-w-2xl flex-col max-h-[90vh] rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150"
      >
        {/* Cabeçalho */}
        <div className="mb-4 flex items-start justify-between border-b border-border/80 pb-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Histórico de Pedidos</h2>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">
              {customer.name}
              {customer.phone && (
                <span className="ml-2 text-xs text-muted-foreground/80">
                  • {customer.phone}
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer"
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

        {/* Resumo do Cliente */}
        <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/40 p-3 text-xs sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Total de pedidos:</span>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {totalPedidos} {totalPedidos === 1 ? "pedido" : "pedidos"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Total faturado:</span>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {formatCurrencyBRL(totalGasto)}
            </p>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="flex-1 overflow-y-auto">
          {orders.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Nenhum pedido encontrado para este cliente.
            </p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Pedido</TableTh>
                  <TableTh>Prazo</TableTh>
                  <TableTh>Status</TableTh>
                  <TableTh className="text-right">Valor</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableTd className="font-medium text-foreground">{order.description}</TableTd>
                    <TableTd className="text-xs text-muted-foreground">
                      {formatDateBR(order.due_date)}
                    </TableTd>
                    <TableTd>
                      <Badge tone={statusToneMap[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </TableTd>
                    <TableTd className="text-right font-medium text-foreground">
                      {order.sale_price != null
                        ? formatCurrencyBRL(Number(order.sale_price))
                        : "—"}
                    </TableTd>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Rodapé com botão Fechar */}
        <div className="mt-4 flex justify-end border-t border-border/80 pt-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="h-8 px-4 text-xs font-medium cursor-pointer"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
