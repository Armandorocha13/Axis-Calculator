"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PriceResultCard } from "@/components/pricing/price-result-card";
import { calculateSuggestedPriceByUnit } from "@/lib/pricing/calculate-price";
import {
  savePriceCalculationAction,
  type PriceCalculationState,
} from "@/app/(app)/calcular-preco/actions";
import type { Order } from "@/lib/types/database.types";

const initialState: PriceCalculationState = {};

export function PriceCalculatorForm({ orders }: { orders: Order[] }) {
  const [unitCost, setUnitCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const [margin, setMargin] = useState("");
  const [state, formAction, pending] = useActionState(
    savePriceCalculationAction,
    initialState,
  );

  const { suggestedPrice, netProfit } = calculateSuggestedPriceByUnit(
    Number(unitCost) || 0,
    Number(quantity) || 0,
    Number(margin) || 0,
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="unit_cost">Custo unitário (R$)</Label>
            <Input
              id="unit_cost"
              name="unit_cost"
              type="number"
              step="0.01"
              min="0"
              value={unitCost}
              onChange={(event) => setUnitCost(event.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="quantity">Quantidade de unidades</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              step="1"
              min="0"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="profit_margin_percent">Margem de lucro desejada (%)</Label>
          <Input
            id="profit_margin_percent"
            name="profit_margin_percent"
            type="number"
            step="0.1"
            min="0"
            value={margin}
            onChange={(event) => setMargin(event.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="order_id">Vincular a um pedido (opcional)</Label>
          <Select id="order_id" name="order_id" defaultValue="">
            <option value="">Não vincular</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.description}
              </option>
            ))}
          </Select>
        </div>

        {state?.error && (
          <p className="text-sm text-accent" role="alert">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="text-sm text-foreground">
            Cálculo salvo no histórico.
          </p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar no histórico"}
        </Button>
      </form>

      <PriceResultCard suggestedPrice={suggestedPrice} netProfit={netProfit} />
    </div>
  );
}
