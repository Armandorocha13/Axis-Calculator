"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { priceCalculationSchema } from "@/lib/validations/pricing";
import { calculateSuggestedPriceByUnit } from "@/lib/pricing/calculate-price";

export interface PriceCalculationState {
  error?: string;
  success?: boolean;
}

export async function savePriceCalculationAction(
  _prevState: PriceCalculationState,
  formData: FormData,
): Promise<PriceCalculationState> {
  const parsed = priceCalculationSchema.safeParse({
    unit_cost: formData.get("unit_cost"),
    quantity: formData.get("quantity"),
    profit_margin_percent: formData.get("profit_margin_percent"),
    order_id: formData.get("order_id"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { totalCost, suggestedPrice, netProfit } = calculateSuggestedPriceByUnit(
    parsed.data.unit_cost,
    parsed.data.quantity,
    parsed.data.profit_margin_percent,
  );

  const { error } = await supabase.from("price_calculations").insert({
    user_id: user.id,
    order_id: parsed.data.order_id || null,
    unit_cost: parsed.data.unit_cost,
    quantity: parsed.data.quantity,
    total_cost: totalCost,
    profit_margin_percent: parsed.data.profit_margin_percent,
    suggested_price: suggestedPrice,
    net_profit: netProfit,
  });

  if (error) return { error: "Não foi possível salvar o cálculo." };

  if (parsed.data.order_id) {
    await supabase
      .from("orders")
      .update({
        total_cost: totalCost,
        sale_price: suggestedPrice,
      })
      .eq("id", parsed.data.order_id);
    revalidatePath("/pedidos");
    revalidatePath("/dashboard");
    revalidatePath("/visao-geral");
  }

  revalidatePath("/calcular-preco");
  return { success: true };
}
