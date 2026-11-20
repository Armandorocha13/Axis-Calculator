import type { StockItem, StockTransaction } from "@/lib/types/database.types";

export interface StockItemWithTransactions extends StockItem {
  transactions?: StockTransaction[];
}

export const COMMON_UNITS = [
  { value: "folha", label: "folha (Folha)" },
  { value: "un", label: "un (Unidade)" },
  { value: "rolo", label: "rolo (Rolo)" },
  { value: "pct", label: "pct (Pacote)" },
  { value: "metro", label: "metro (Metro)" },
  { value: "cm", label: "cm (Centímetro)" },
  { value: "m²", label: "m² (Metro quadrado)" },
  { value: "kg", label: "kg (Quilograma)" },
  { value: "g", label: "g (Grama)" },
  { value: "ml", label: "ml (Mililitro)" },
  { value: "kit", label: "kit (Kit)" },
  { value: "par", label: "par (Par)" },
] as const;

export type CommonUnitValue = (typeof COMMON_UNITS)[number]["value"];
