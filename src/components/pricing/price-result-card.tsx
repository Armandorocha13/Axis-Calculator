import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencyBRL } from "@/lib/utils";

export function PriceResultCard({
  suggestedPrice,
  netProfit,
}: {
  suggestedPrice: number;
  netProfit: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card className="border-border shadow-xs">
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Preço sugerido (lote)
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {formatCurrencyBRL(Number.isFinite(suggestedPrice) ? suggestedPrice : 0)}
          </p>
        </CardContent>
      </Card>
      <Card className="border-salvia/40 bg-salvia-bg/30 shadow-xs">
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-salvia-foreground">
            Lucro líquido estimado
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-salvia-foreground">
            {formatCurrencyBRL(Number.isFinite(netProfit) ? netProfit : 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
