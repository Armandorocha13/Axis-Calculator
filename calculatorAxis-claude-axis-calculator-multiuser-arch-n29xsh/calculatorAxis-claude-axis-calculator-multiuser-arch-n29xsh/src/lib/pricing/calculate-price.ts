/**
 * Markup sobre o custo: preço = custo * (1 + margem/100).
 * Ex.: custo R$50, margem 30% -> preço sugerido R$65.
 */
export function calculateSuggestedPrice(
  totalCost: number,
  profitMarginPercent: number,
): number {
  return totalCost * (1 + profitMarginPercent / 100);
}

export interface UnitPriceResult {
  totalCost: number;
  suggestedPrice: number;
  netProfit: number;
}

/**
 * Calcula a partir do custo por unidade + quantidade, em vez do custo total
 * direto — mais fácil pra quem compra material por unidade.
 */
export function calculateSuggestedPriceByUnit(
  unitCost: number,
  quantity: number,
  profitMarginPercent: number,
): UnitPriceResult {
  const totalCost = unitCost * quantity;
  const suggestedPrice = calculateSuggestedPrice(totalCost, profitMarginPercent);
  return {
    totalCost,
    suggestedPrice,
    netProfit: suggestedPrice - totalCost,
  };
}
