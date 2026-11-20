export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatUnitCost(value: number, unit?: string) {
  // Exibe até 4 casas se houver decimais pequenos (ex: R$ 0,125), senão 2 casas (ex: R$ 0,50)
  const hasSubCents = Math.round(value * 100) !== value * 100;
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: hasSubCents ? 4 : 2,
  }).format(value);

  return unit ? `${formatted}/${unit}` : formatted;
}

export function formatQuantity(value: number, unit?: string) {
  const formatted = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatDateBR(dateIso: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(dateIso),
  );
}
