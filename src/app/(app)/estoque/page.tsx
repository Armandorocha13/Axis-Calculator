import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { StockView } from "@/components/stock/stock-view";
import type { StockItem } from "@/lib/types/database.types";

export const metadata: Metadata = {
  title: "Estoque",
};

export default async function EstoquePage() {
  const supabase = await createClient();

  let stockItems: StockItem[] = [];

  try {
    const { data, error } = await supabase
      .from("stock_items")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data) {
      stockItems = data as StockItem[];
    }
  } catch {
    // Caso a tabela ainda esteja pendente de migração no Supabase
    stockItems = [];
  }

  return <StockView initialItems={stockItems} />;
}
