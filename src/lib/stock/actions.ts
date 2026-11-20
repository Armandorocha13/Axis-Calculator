"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { StockItem, StockTransaction } from "@/lib/types/database.types";

export interface StockFormState {
  error?: string;
  success?: boolean;
  item?: StockItem;
}

export async function createStockItemAction(
  _prevState: StockFormState,
  formData: FormData,
): Promise<StockFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "un").trim().toLowerCase() || "un";
  const quantity = Math.max(0, parseFloat(String(formData.get("quantity") ?? "0")) || 0);
  const min_quantity = Math.max(0, parseFloat(String(formData.get("min_quantity") ?? "0")) || 0);
  const total_cost = Math.max(0, parseFloat(String(formData.get("total_cost") ?? "0")) || 0);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name) {
    return { error: "Informe o nome do material ou item." };
  }
  if (quantity <= 0) {
    return { error: "Informe uma quantidade válida maior que zero." };
  }
  if (total_cost < 0) {
    return { error: "O valor total pago não pode ser negativo." };
  }

  // Cálculo automático do custo unitário
  const unit_cost = quantity > 0 ? total_cost / quantity : 0;

  try {
    const { data: item, error: itemError } = await supabase
      .from("stock_items")
      .insert({
        user_id: user.id,
        name,
        unit,
        current_quantity: quantity,
        min_quantity,
        last_purchase_total: total_cost,
        last_purchase_quantity: quantity,
        unit_cost,
        notes,
      })
      .select()
      .single();

    if (itemError) {
      return { error: `Erro ao salvar item no banco: ${itemError.message}` };
    }

    // Registra a transação inicial de compra/entrada se houver custo ou quantidade
    if (item && quantity > 0) {
      await supabase.from("stock_transactions").insert({
        item_id: item.id,
        user_id: user.id,
        type: "entrada",
        quantity,
        unit_cost,
        total_cost,
        notes: notes || "Lote inicial cadastrado",
      });
    }

    revalidatePath("/estoque");
    revalidatePath("/visao-geral");
    return { success: true, item };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { error: `Falha ao cadastrar item de estoque: ${msg}` };
  }
}

export async function updateStockItemAction(
  _prevState: StockFormState,
  formData: FormData,
): Promise<StockFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "un").trim().toLowerCase() || "un";
  const min_quantity = Math.max(0, parseFloat(String(formData.get("min_quantity") ?? "0")) || 0);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!id) return { error: "Item não especificado." };
  if (!name) return { error: "Informe o nome do material ou item." };

  try {
    const { data: item, error } = await supabase
      .from("stock_items")
      .update({
        name,
        unit,
        min_quantity,
        notes,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return { error: `Erro ao atualizar item: ${error.message}` };
    }

    revalidatePath("/estoque");
    return { success: true, item };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { error: `Falha ao atualizar: ${msg}` };
  }
}

export async function deleteStockItemAction(
  _prevState: StockFormState,
  formData: FormData,
): Promise<StockFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Item não especificado." };

  try {
    const { error } = await supabase
      .from("stock_items")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return { error: `Erro ao remover item: ${error.message}` };
    }

    revalidatePath("/estoque");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { error: `Falha ao remover item: ${msg}` };
  }
}

export async function recordStockEntryAction(
  _prevState: StockFormState,
  formData: FormData,
): Promise<StockFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const itemId = String(formData.get("item_id") ?? "").trim();
  const quantity = Math.max(0, parseFloat(String(formData.get("quantity") ?? "0")) || 0);
  const total_cost = Math.max(0, parseFloat(String(formData.get("total_cost") ?? "0")) || 0);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!itemId) return { error: "Item não especificado." };
  if (quantity <= 0) return { error: "Informe uma quantidade válida a adicionar." };

  try {
    // 1. Busca dados atuais do item
    const { data: item, error: fetchError } = await supabase
      .from("stock_items")
      .select("*")
      .eq("id", itemId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !item) {
      return { error: "Material não encontrado no estoque." };
    }

    const currentQty = Number(item.current_quantity) || 0;
    const currentUnitCost = Number(item.unit_cost) || 0;

    // Novo custo unitário ponderado
    const newQty = currentQty + quantity;
    const entryUnitCost = quantity > 0 ? total_cost / quantity : currentUnitCost;

    let newWeightedCost = currentUnitCost;
    if (newQty > 0) {
      // (saldo atual * custo atual + valor pago no novo lote) / novo saldo total
      const totalInvested = (currentQty * currentUnitCost) + total_cost;
      newWeightedCost = totalInvested / newQty;
    }

    // 2. Atualiza item
    const { data: updatedItem, error: updateError } = await supabase
      .from("stock_items")
      .update({
        current_quantity: newQty,
        last_purchase_total: total_cost,
        last_purchase_quantity: quantity,
        unit_cost: newWeightedCost,
      })
      .eq("id", itemId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      return { error: `Erro ao atualizar estoque: ${updateError.message}` };
    }

    // 3. Registra transação
    await supabase.from("stock_transactions").insert({
      item_id: itemId,
      user_id: user.id,
      type: "entrada",
      quantity,
      unit_cost: entryUnitCost,
      total_cost,
      notes: notes || "Nova compra registrada",
    });

    revalidatePath("/estoque");
    revalidatePath("/visao-geral");
    return { success: true, item: updatedItem };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { error: `Falha ao registrar entrada: ${msg}` };
  }
}

export async function recordStockExitAction(
  _prevState: StockFormState,
  formData: FormData,
): Promise<StockFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const itemId = String(formData.get("item_id") ?? "").trim();
  const quantity = Math.max(0, parseFloat(String(formData.get("quantity") ?? "0")) || 0);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!itemId) return { error: "Item não especificado." };
  if (quantity <= 0) return { error: "Informe uma quantidade válida para baixa." };

  try {
    const { data: item, error: fetchError } = await supabase
      .from("stock_items")
      .select("*")
      .eq("id", itemId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !item) {
      return { error: "Material não encontrado no estoque." };
    }

    const currentQty = Number(item.current_quantity) || 0;
    if (quantity > currentQty) {
      return {
        error: `Quantidade insuficiente em estoque. Saldo disponível: ${currentQty} ${item.unit}.`,
      };
    }

    const newQty = Math.max(0, currentQty - quantity);

    const { data: updatedItem, error: updateError } = await supabase
      .from("stock_items")
      .update({
        current_quantity: newQty,
      })
      .eq("id", itemId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      return { error: `Erro ao dar baixa no estoque: ${updateError.message}` };
    }

    // Registra transação de saída
    const unitCost = Number(item.unit_cost) || 0;
    await supabase.from("stock_transactions").insert({
      item_id: itemId,
      user_id: user.id,
      type: "saida",
      quantity,
      unit_cost: unitCost,
      total_cost: quantity * unitCost,
      notes: notes || "Baixa de uso em produção",
    });

    revalidatePath("/estoque");
    revalidatePath("/visao-geral");
    return { success: true, item: updatedItem };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { error: `Falha ao dar baixa: ${msg}` };
  }
}
