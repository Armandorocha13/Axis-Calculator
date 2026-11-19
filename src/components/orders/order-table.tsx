"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
import { DeadlineBadge } from "@/components/orders/deadline-badge";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import {
  deleteOrderAction,
  settleOrderPaymentAction,
} from "@/app/(app)/pedidos/actions";
import { formatCurrencyBRL, formatDateBR, cn } from "@/lib/utils";
import {
  formatReadyForPickupMessage,
  getWhatsAppUrl,
} from "@/lib/whatsapp";
import type { Customer, Order, Profile } from "@/lib/types/database.types";

const statusLabels: Record<Order["status"], string> = {
  pendente: "Pendente",
  em_producao: "Em produção",
  pronto: "Pronto para envio/retirada",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function OrderTable({
  orders,
  customersById,
  profile,
}: {
  orders: Order[];
  customersById: Map<string, Customer>;
  profile?: Profile | null;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "todos" | "em_andamento" | "prontos"
  >("todos");
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleSettle(orderId: string) {
    setSettlingId(orderId);
    startTransition(async () => {
      try {
        const res = await settleOrderPaymentAction(orderId);
        if (res?.error) {
          alert(res.error);
        }
      } finally {
        setSettlingId(null);
      }
    });
  }

  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum pedido cadastrado ainda.
      </p>
    );
  }

  const countTodos = orders.length;
  const countEmAndamento = orders.filter(
    (o) =>
      o.status !== "pronto" && o.status !== "entregue" && o.status !== "cancelado",
  ).length;
  const countProntos = orders.filter((o) => o.status === "pronto").length;

  const filteredOrders = orders.filter((order) => {
    // Filtro por status rápido
    if (filterStatus === "em_andamento") {
      if (
        order.status === "pronto" ||
        order.status === "entregue" ||
        order.status === "cancelado"
      ) {
        return false;
      }
    } else if (filterStatus === "prontos") {
      if (order.status !== "pronto") {
        return false;
      }
    }

    // Busca por texto (cliente ou pedido)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const customer = order.customer_id
        ? customersById.get(order.customer_id)
        : null;
      const descMatch = order.description.toLowerCase().includes(q);
      const customerMatch = customer
        ? customer.name.toLowerCase().includes(q)
        : false;
      if (!descMatch && !customerMatch) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Busca e Filtro Rápido */}
      <div className="flex flex-col gap-3 pb-3 border-b border-border sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente ou pedido..."
            className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterStatus("todos")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors",
              filterStatus === "todos"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Todos ({countTodos})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("em_andamento")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors",
              filterStatus === "em_andamento"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Em andamento ({countEmAndamento})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("prontos")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors",
              filterStatus === "prontos"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Prontos ({countProntos})
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          <p>Nenhum pedido encontrado para a busca ou filtro selecionado.</p>
          {(search || filterStatus !== "todos") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterStatus("todos");
              }}
              className="mt-2 text-xs underline hover:text-foreground"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Pedido</TableTh>
                <TableTh>Cliente</TableTh>
                <TableTh>Prazo</TableTh>
                <TableTh>Status</TableTh>
                <TableTh>Preço</TableTh>
                <TableTh className="text-right">Ações</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => {
                const customer = order.customer_id
                  ? customersById.get(order.customer_id)
                  : null;
                const isPronto = order.status === "pronto";

                const salePrice = Number(order.sale_price) || 0;
                const amountPaid = Number(order.amount_paid) || 0;
                const remaining = Math.max(0, salePrice - amountPaid);
                const canSettle =
                  salePrice > amountPaid && order.payment_status !== "pago";

                let waUrl = "#";
                if (isPronto && customer) {
                  const text = formatReadyForPickupMessage({
                    customerName: customer.name,
                    orderDescription: order.description,
                    pickupAddress: profile?.pickup_address,
                    pickupHours: profile?.pickup_hours,
                    pixKey: profile?.pix_key,
                    remainingAmount: remaining,
                  });
                  waUrl = customer.phone
                    ? getWhatsAppUrl({ phone: customer.phone, text })
                    : "#";
                }

                return (
                  <TableRow key={order.id}>
                    <TableTd className="font-medium">{order.description}</TableTd>
                    <TableTd>{customer?.name ?? "—"}</TableTd>
                    <TableTd>
                      <div className="flex flex-col gap-1">
                        <span>{formatDateBR(order.due_date)}</span>
                        <DeadlineBadge
                          dueDate={order.due_date}
                          status={order.status}
                        />
                      </div>
                    </TableTd>
                    <TableTd>
                      <Badge>{statusLabels[order.status]}</Badge>
                    </TableTd>
                    <TableTd>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {order.sale_price != null
                            ? formatCurrencyBRL(Number(order.sale_price))
                            : "—"}
                        </span>
                        {order.amount_paid > 0 &&
                          order.sale_price != null &&
                          order.amount_paid < order.sale_price && (
                            <span className="text-[11px] text-muted-foreground">
                              Restam: {formatCurrencyBRL(remaining)}
                            </span>
                          )}
                      </div>
                    </TableTd>
                    <TableTd className="whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        {isPronto && (
                          <WhatsAppButton
                            href={waUrl}
                            disabled={!customer?.phone}
                            title={
                              !customer
                                ? "Sem cliente vinculado"
                                : !customer.phone
                                  ? "Cliente sem telefone cadastrado"
                                  : "Enviar aviso de retirada no WhatsApp"
                            }
                          />
                        )}
                        {canSettle && (
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={settlingId === order.id}
                            onClick={() => handleSettle(order.id)}
                            className="h-8 px-2.5 text-xs"
                            title="Quitar pedido e lançar no Fluxo de Caixa"
                          >
                            {settlingId === order.id ? "Quitando..." : "Pago"}
                          </Button>
                        )}
                        <Link href={`/pedidos/${order.id}`}>
                          <Button
                            variant="secondary"
                            className="h-8 px-2.5 text-xs"
                          >
                            Editar
                          </Button>
                        </Link>
                        <form
                          action={async () => {
                            if (
                              confirm(
                                "Tem certeza que deseja excluir este pedido?",
                              )
                            ) {
                              await deleteOrderAction(order.id);
                            }
                          }}
                        >
                          <Button
                            type="submit"
                            variant="destructive"
                            className="h-8 px-2.5 text-xs"
                          >
                            Excluir
                          </Button>
                        </form>
                      </div>
                    </TableTd>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
