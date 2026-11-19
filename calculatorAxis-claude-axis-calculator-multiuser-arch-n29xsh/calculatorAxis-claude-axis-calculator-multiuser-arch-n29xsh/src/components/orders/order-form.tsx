"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CustomerAutocomplete } from "@/components/customers/customer-autocomplete";
import { formatCurrencyBRL } from "@/lib/utils";
import {
  orderStatusValues,
  paymentStatusValues,
} from "@/lib/validations/order";
import type { OrderFormState } from "@/app/(app)/pedidos/actions";
import type { Customer, Order } from "@/lib/types/database.types";

const statusLabels: Record<(typeof orderStatusValues)[number], string> = {
  pendente: "Pendente",
  em_producao: "Em produção",
  pronto: "Pronto para envio/retirada",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const paymentLabels: Record<(typeof paymentStatusValues)[number], string> = {
  pendente: "Pendente",
  parcial: "Parcial",
  pago: "Pago",
};

const initialState: OrderFormState = {};

export function OrderForm({
  action,
  customers,
  defaultValues,
  submitLabel = "Salvar pedido",
}: {
  action: (state: OrderFormState, formData: FormData) => Promise<OrderFormState>;
  customers: Customer[];
  defaultValues?: Partial<Order>;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const [salePrice, setSalePrice] = useState<string | number>(
    defaultValues?.sale_price != null ? defaultValues.sale_price : "",
  );
  const [amountPaid, setAmountPaid] = useState<string | number>(
    defaultValues?.amount_paid != null ? defaultValues.amount_paid : 0,
  );
  const [paymentStatus, setPaymentStatus] = useState<
    (typeof paymentStatusValues)[number]
  >(defaultValues?.payment_status ?? "pendente");

  const numSale =
    typeof salePrice === "number" ? salePrice : parseFloat(String(salePrice)) || 0;
  const numPaid =
    typeof amountPaid === "number" ? amountPaid : parseFloat(String(amountPaid)) || 0;
  const remaining = Math.max(0, numSale - numPaid);

  // Ajusta status sugerido se o usuário alterar valores
  function handleSalePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSalePrice(val);
    const parsedSale = parseFloat(val) || 0;
    const parsedPaid =
      typeof amountPaid === "number" ? amountPaid : parseFloat(String(amountPaid)) || 0;

    if (parsedSale > 0 && parsedPaid >= parsedSale) {
      setPaymentStatus("pago");
    } else if (parsedPaid > 0 && parsedPaid < parsedSale) {
      setPaymentStatus("parcial");
    } else if (parsedPaid === 0) {
      setPaymentStatus("pendente");
    }
  }

  function handleAmountPaidChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setAmountPaid(val);
    const parsedPaid = parseFloat(val) || 0;
    const parsedSale =
      typeof salePrice === "number" ? salePrice : parseFloat(String(salePrice)) || 0;

    if (parsedSale > 0 && parsedPaid >= parsedSale) {
      setPaymentStatus("pago");
    } else if (parsedPaid > 0 && parsedPaid < parsedSale) {
      setPaymentStatus("parcial");
    } else if (parsedPaid === 0) {
      setPaymentStatus("pendente");
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="description">O que é o pedido</Label>
        <Input
          id="description"
          name="description"
          defaultValue={defaultValues?.description}
          required
        />
      </div>

      <CustomerAutocomplete
        customers={customers}
        defaultCustomerId={defaultValues?.customer_id}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="due_date">Prazo de entrega</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={defaultValues?.due_date}
            required
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "pendente"}
          >
            {orderStatusValues.map((value) => (
              <option key={value} value={value}>
                {statusLabels[value]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="total_cost">Custo total (R$)</Label>
          <Input
            id="total_cost"
            name="total_cost"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.total_cost ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="sale_price">Preço de venda (R$)</Label>
          <Input
            id="sale_price"
            name="sale_price"
            type="number"
            step="0.01"
            min="0"
            value={salePrice}
            onChange={handleSalePriceChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="amount_paid">Valor já pago / Sinal (R$)</Label>
          <Input
            id="amount_paid"
            name="amount_paid"
            type="number"
            step="0.01"
            min="0"
            value={amountPaid}
            onChange={handleAmountPaidChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="payment_status">Status do pagamento</Label>
          <Select
            id="payment_status"
            name="payment_status"
            value={paymentStatus}
            onChange={(event) =>
              setPaymentStatus(
                event.target.value as (typeof paymentStatusValues)[number],
              )
            }
          >
            {paymentStatusValues.map((value) => (
              <option key={value} value={value}>
                {paymentLabels[value]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Cálculo automático do Valor Restante a Pagar */}
      <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">
            Valor restante a pagar:
          </span>
          <span
            className={`text-base font-semibold ${
              remaining === 0 && numSale > 0
                ? "text-emerald-600"
                : "text-foreground"
            }`}
          >
            {formatCurrencyBRL(remaining)}
          </span>
        </div>
        {numSale > 0 && remaining === 0 && (
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            ✓ Pedido 100% quitado
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes ?? ""}
          rows={3}
          className="w-full rounded-md border border-foreground/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-accent" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
