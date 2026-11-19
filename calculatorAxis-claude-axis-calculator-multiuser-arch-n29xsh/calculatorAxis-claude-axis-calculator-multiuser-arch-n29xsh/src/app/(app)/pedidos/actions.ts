"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { orderSchema } from "@/lib/validations/order";

export interface OrderFormState {
  error?: string;
}

function parseOrderForm(formData: FormData) {
  const amountPaidRaw = formData.get("amount_paid");
  return orderSchema.safeParse({
    description: formData.get("description"),
    customer_id: formData.get("customer_id"),
    status: formData.get("status"),
    due_date: formData.get("due_date"),
    total_cost: formData.get("total_cost") || undefined,
    sale_price: formData.get("sale_price") || undefined,
    payment_status: formData.get("payment_status"),
    amount_paid: amountPaidRaw !== null && amountPaidRaw !== "" ? amountPaidRaw : 0,
    notes: formData.get("notes"),
  });
}

/**
 * Resolve o valor efetivamente pago e garante consistência do status.
 */
function resolveAmountPaid(data: {
  payment_status: string;
  sale_price?: number;
  amount_paid?: number;
}) {
  const paid = data.amount_paid ?? 0;
  if (data.payment_status === "pago") {
    return Math.max(paid, data.sale_price ?? 0);
  }
  return paid;
}

export async function createOrderAction(
  _prevState: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const parsed = parseOrderForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("orders").insert({
    user_id: user.id,
    description: parsed.data.description,
    customer_id: parsed.data.customer_id || null,
    status: parsed.data.status,
    due_date: parsed.data.due_date,
    total_cost: parsed.data.total_cost ?? null,
    sale_price: parsed.data.sale_price ?? null,
    payment_status: parsed.data.payment_status,
    amount_paid: resolveAmountPaid(parsed.data),
    notes: parsed.data.notes || null,
  });

  if (error) return { error: "Não foi possível salvar o pedido." };

  revalidatePath("/pedidos");
  revalidatePath("/dashboard");
  revalidatePath("/visao-geral");
  revalidatePath("/fluxo-de-caixa");
  redirect("/pedidos");
}

export async function updateOrderAction(
  id: string,
  _prevState: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const parsed = parseOrderForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      description: parsed.data.description,
      customer_id: parsed.data.customer_id || null,
      status: parsed.data.status,
      due_date: parsed.data.due_date,
      total_cost: parsed.data.total_cost ?? null,
      sale_price: parsed.data.sale_price ?? null,
      payment_status: parsed.data.payment_status,
      amount_paid: resolveAmountPaid(parsed.data),
      notes: parsed.data.notes || null,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível atualizar o pedido." };

  revalidatePath("/pedidos");
  revalidatePath("/dashboard");
  revalidatePath("/visao-geral");
  revalidatePath("/fluxo-de-caixa");
  redirect("/pedidos");
}

export async function deleteOrderAction(id: string) {
  const supabase = await createClient();
  await supabase.from("orders").delete().eq("id", id);
  revalidatePath("/pedidos");
  revalidatePath("/dashboard");
  revalidatePath("/visao-geral");
  revalidatePath("/fluxo-de-caixa");
}

export async function settleOrderPaymentAction(
  orderId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado." };
  }

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select(
      "id, user_id, customer_id, description, sale_price, amount_paid, payment_status",
    )
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return { error: "Pedido não encontrado." };
  }

  const salePrice = Number(order.sale_price) || 0;
  const amountPaid = Number(order.amount_paid) || 0;

  if (salePrice <= amountPaid || order.payment_status === "pago") {
    return { error: "Este pedido já está quitado." };
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      amount_paid: salePrice,
      payment_status: "pago",
    })
    .eq("id", orderId);

  if (updateError) {
    return { error: "Não foi possível quitar o pedido." };
  }

  revalidatePath("/pedidos");
  revalidatePath("/dashboard");
  revalidatePath("/visao-geral");
  revalidatePath("/fluxo-de-caixa");

  return {};
}
