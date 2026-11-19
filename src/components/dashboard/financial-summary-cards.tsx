import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencyBRL } from "@/lib/utils";

interface FinancialSummaryCardsProps {
  entradasMes: number;
  saidasMes: number;
  saldoLivre: number;
  previstoAReceber: number;
}

export function FinancialSummaryCards({
  entradasMes,
  saidasMes,
  saldoLivre,
  previstoAReceber,
}: FinancialSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* ENTRADAS (MÊS) */}
      <Card>
        <CardContent className="py-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Entradas (Mês)
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-500">
            {formatCurrencyBRL(entradasMes)}
          </p>
        </CardContent>
      </Card>

      {/* SAÍDAS (MÊS) */}
      <Card>
        <CardContent className="py-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Saídas (Mês)
          </p>
          <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-500">
            {formatCurrencyBRL(saidasMes)}
          </p>
        </CardContent>
      </Card>

      {/* SALDO LIVRE */}
      <Card className="border-foreground/30 bg-muted/40 ring-1 ring-foreground/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide font-semibold text-foreground">
              Saldo Livre
            </p>
            <span
              className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded ${
                saldoLivre >= 0
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
              }`}
            >
              {saldoLivre >= 0 ? "Positivo" : "Negativo"}
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrencyBRL(saldoLivre)}
          </p>
        </CardContent>
      </Card>

      {/* PREVISTO A RECEBER */}
      <Card>
        <CardContent className="py-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Previsto a receber
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatCurrencyBRL(previstoAReceber)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
