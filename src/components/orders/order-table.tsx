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
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeadlineBadge } from "@/components/orders/deadline-badge";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { WhatsAppPreviewModal } from "@/components/ui/whatsapp-preview-modal";
import {
  deleteOrderAction,
  settleOrderPaymentAction,
} from "@/app/(app)/pedidos/actions";
import { formatCurrencyBRL, formatDateBR, cn } from "@/lib/utils";
import {
  formatReadyForPickupMessage,
  renderWhatsAppMessage,
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

const statusToneMap: Record<Order["status"], BadgeTone> = {
  pendente: "neutral",
  em_producao: "lavanda",
  pronto: "salvia",
  entregue: "salvia",
  cancelado: "rosa",
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
  const [waPreview, setWaPreview] = useState<{
    isOpen: boolean;
    customerName: string;
    phone: string;
    initialMessage: string;
  } | null>(null);
  const [, startTransition] = useTransition();

  function handleOpenWhatsApp(order: Order, customer: Customer, remaining: number) {
    const localTemplate =
      typeof window !== "undefined"
        ? localStorage.getItem("arte_em_conta_wa_template")
        : null;
    const activeTemplate = profile?.whatsapp_template?.trim()
      ? profile.whatsapp_template
      : localTemplate?.trim()
      ? localTemplate
      : undefined;

    const message = renderWhatsAppMessage(activeTemplate, {
      customerName: customer.name,
      orderDescription: order.description,
      pickupAddress: profile?.pickup_address,
      pickupHours: profile?.pickup_hours,
      pixKey: profile?.pix_key,
      remainingAmount: remaining,
      businessName: profile?.business_name,
    });

    setWaPreview({
      isOpen: true,
      customerName: customer.name,
      phone: customer.phone || "",
      initialMessage: message,
    });
  }

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

  // Contadores para as abas de filtro
  const countTodos = orders.length;
  const countEmAndamento = orders.filter(
    (o) => o.status === "pendente" || o.status === "em_producao",
  ).length;
  const countProntos = orders.filter((o) => o.status === "pronto").length;

  const filteredOrders = orders.filter((order) => {
    // Filtro por abas de status
    if (filterStatus === "em_andamento") {
      if (order.status !== "pendente" && order.status !== "em_producao") {
        return false;
      }
    } else if (filterStatus === "prontos") {
      if (order.status !== "pronto") {
        return false;
      }
    }

    // Filtro por texto de busca
    if (!search.trim()) return true;
    const term = search.toLowerCase();

    const orderDescMatch = order.description?.toLowerCase().includes(term);
    const customer = order.customer_id
      ? customersById.get(order.customer_id)
      : null;
    const customerNameMatch = customer?.name?.toLowerCase().includes(term);

    return Boolean(orderDescMatch || customerNameMatch);
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente ou pedido..."
            className="w-full h-10 rounded-xl border border-border bg-card px-3.5 py-1 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-muted/40 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => setFilterStatus("todos")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-all",
              filterStatus === "todos"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Todos ({countTodos})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("em_andamento")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-all",
              filterStatus === "em_andamento"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Em andamento ({countEmAndamento})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("prontos")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-all",
              filterStatus === "prontos"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Prontos ({countProntos})
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground bg-card rounded-2xl border border-border p-6">
          <p>Nenhum pedido encontrado para a busca ou filtro selecionado.</p>
          {(search || filterStatus !== "todos") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterStatus("todos");
              }}
              className="mt-2 text-xs text-primary underline hover:text-[#8C77B9]"
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
                    <TableTd className="font-medium text-foreground">{order.description}</TableTd>
                    <TableTd className="text-foreground/90">{customer?.name ?? "—"}</TableTd>
                    <TableTd>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-foreground/80">{formatDateBR(order.due_date)}</span>
                        <DeadlineBadge
                          dueDate={order.due_date}
                          status={order.status}
                        />
                      </div>
                    </TableTd>
                    <TableTd>
                      <Badge tone={statusToneMap[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </TableTd>
                    <TableTd>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
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
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {isPronto && (
                          <WhatsAppButton
                            onClick={
                              customer && customer.phone
                                ? () => handleOpenWhatsApp(order, customer, remaining)
                                : undefined
                            }
                            disabled={!customer?.phone}
                            title={
                              !customer
                                ? "Sem cliente vinculado"
                                : !customer.phone
                                  ? "Cliente sem telefone cadastrado"
                                  : "Revisar mensagem e enviar aviso de retirada no WhatsApp"
                            }
                          />
                        )}
                        {canSettle && (
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={settlingId === order.id}
                            onClick={() => handleSettle(order.id)}
                            className="h-8 px-2.5 text-xs text-salvia-foreground border-salvia/40 bg-salvia-bg hover:bg-salvia/25"
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

      {waPreview && (
        <WhatsAppPreviewModal
          isOpen={waPreview.isOpen}
          onClose={() => setWaPreview(null)}
          customerName={waPreview.customerName}
          phone={waPreview.phone}
          initialMessage={waPreview.initialMessage}
          title="Aviso de Retirada via WhatsApp"
        />
      )}
    </div>
  );
}
