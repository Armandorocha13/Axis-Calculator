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
      <Card>
        <CardContent className="py-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Preço sugerido (lote)
          </p>
          <p className="mt-1 text-3xl font-semibold">
            {formatCurrencyBRL(Number.isFinite(suggestedPrice) ? suggestedPrice : 0)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Lucro líquido
          </p>
          <p className="mt-1 text-3xl font-semibold">
            {formatCurrencyBRL(Number.isFinite(netProfit) ? netProfit : 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
