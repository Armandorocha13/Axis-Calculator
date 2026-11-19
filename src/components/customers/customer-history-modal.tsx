"use client";

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
  if (!isOpen || !customer) return null;

  const totalPedidos = orders.length;
  const totalGasto = orders.reduce(
    (sum, o) => sum + (Number(o.sale_price) || 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex w-full max-w-2xl flex-col max-h-[90vh] rounded-lg border border-border bg-card p-6 shadow-xl">
        {/* Cabeçalho */}
        <div className="mb-4 flex items-start justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-semibold">Histórico de Pedidos</h2>
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

        {/* Resumo do Cliente: Total de Pedidos e Total Gasto */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-muted/40 p-3.5">
            <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Total de pedidos
            </span>
            <p className="mt-1 text-xl font-bold text-foreground">
              {totalPedidos} {totalPedidos === 1 ? "pedido" : "pedidos"}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-3.5">
            <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Valor total já gasto
            </span>
            <p className="mt-1 text-xl font-bold text-foreground">
              {formatCurrencyBRL(totalGasto)}
            </p>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="flex-1 overflow-y-auto">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum pedido vinculado a este cliente ainda.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Data de entrega</TableTh>
                  <TableTh>O que é o pedido</TableTh>
                  <TableTh>Status</TableTh>
                  <TableTh className="text-right">Valor (R$)</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableTd className="whitespace-nowrap text-sm">
                      {formatDateBR(order.due_date)}
                    </TableTd>
                    <TableTd className="text-sm font-medium">
                      {order.description}
                    </TableTd>
                    <TableTd className="whitespace-nowrap text-sm">
                      <Badge tone={statusToneMap[order.status]}>{statusLabels[order.status]}</Badge>
                    </TableTd>
                    <TableTd className="whitespace-nowrap text-right text-sm font-semibold">
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
        <div className="mt-4 flex justify-end border-t border-border pt-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="h-8 px-4 text-xs font-medium"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
