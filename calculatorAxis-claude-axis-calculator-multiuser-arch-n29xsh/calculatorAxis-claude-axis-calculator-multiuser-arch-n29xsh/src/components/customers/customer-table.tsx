"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableTd,
  TableTh,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { CustomerHistoryModal } from "@/components/customers/customer-history-modal";
import { deleteCustomerAction } from "@/app/(app)/clientes/actions";
import {
  formatReadyForPickupMessage,
  getWhatsAppUrl,
} from "@/lib/whatsapp";
import type { Customer, Order, Profile } from "@/lib/types/database.types";

export function CustomerTable({
  customers,
  orders = [],
  profile,
}: {
  customers: Customer[];
  orders?: Order[];
  profile?: Profile | null;
}) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const ordersByCustomerId = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const order of orders) {
      if (order.customer_id) {
        const list = map.get(order.customer_id) ?? [];
        list.push(order);
        map.set(order.customer_id, list);
      }
    }
    return map;
  }, [orders]);

  if (customers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum cliente cadastrado ainda.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Nome</TableTh>
              <TableTh>Telefone</TableTh>
              <TableTh className="text-right">Ações</TableTh>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => {
              const customerOrders = ordersByCustomerId.get(customer.id) ?? [];
              const orderCount = customerOrders.length;
              const readyOrder = customerOrders.find((o) => o.status === "pronto");
              const hasPhone = Boolean(customer.phone?.trim());

              let waUrl = "#";
              if (hasPhone) {
                if (readyOrder) {
                  const remaining = Math.max(
                    0,
                    (Number(readyOrder.sale_price) || 0) -
                      (Number(readyOrder.amount_paid) || 0),
                  );
                  const text = formatReadyForPickupMessage({
                    customerName: customer.name,
                    orderDescription: readyOrder.description,
                    pickupAddress: profile?.pickup_address,
                    pickupHours: profile?.pickup_hours,
                    pixKey: profile?.pix_key,
                    remainingAmount: remaining,
                  });
                  waUrl = getWhatsAppUrl({ phone: customer.phone!, text });
                } else {
                  const text = `Olá, ${customer.name}! Tudo bem?`;
                  waUrl = getWhatsAppUrl({ phone: customer.phone!, text });
                }
              }

              return (
                <TableRow key={customer.id}>
                  <TableTd className="font-medium">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {customer.name}
                        </span>
                        {readyOrder && (
                          <span className="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Pedido pronto para retirada
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[11px] font-normal text-muted-foreground">
                          {orderCount === 1
                            ? "1 pedido"
                            : `${orderCount} pedidos`}
                        </span>
                      </div>
                    </div>
                  </TableTd>
                  <TableTd className="whitespace-nowrap text-muted-foreground">
                    {customer.phone || "—"}
                  </TableTd>
                  <TableTd className="whitespace-nowrap text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <WhatsAppButton
                        href={waUrl}
                        disabled={!hasPhone}
                        title={
                          !hasPhone
                            ? "Cliente sem telefone cadastrado"
                            : readyOrder
                              ? "Avisar que o pedido está pronto para retirada"
                              : "Abrir conversa no WhatsApp"
                        }
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setSelectedCustomer(customer)}
                        className="h-8 px-2.5 text-xs font-medium"
                        title="Ver histórico de pedidos do cliente"
                      >
                        Histórico
                      </Button>
                      <Link href={`/clientes/${customer.id}`}>
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
                              "Tem certeza que deseja excluir este cliente?",
                            )
                          ) {
                            await deleteCustomerAction(customer.id);
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

      <CustomerHistoryModal
        isOpen={selectedCustomer !== null}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
        orders={
          selectedCustomer
            ? (ordersByCustomerId.get(selectedCustomer.id) ?? [])
            : []
        }
      />
    </>
  );
}
