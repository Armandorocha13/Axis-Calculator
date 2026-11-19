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
      <Card className="hover:border-salvia/40">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Entradas (Mês)
            </p>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-salvia-bg text-salvia-foreground border border-salvia/30">
              Recebido
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-salvia-foreground">
            {formatCurrencyBRL(entradasMes)}
          </p>
        </CardContent>
      </Card>

      {/* SAÍDAS (MÊS) */}
      <Card className="hover:border-rosa/40">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Saídas (Mês)
            </p>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-rosa-bg text-rosa-foreground border border-rosa/30">
              Custos
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-rosa-foreground">
            {formatCurrencyBRL(saidasMes)}
          </p>
        </CardContent>
      </Card>

      {/* SALDO LIVRE */}
      <Card className="border-primary/30 ring-1 ring-primary/20 shadow-xs">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider font-semibold text-foreground">
              Saldo Livre
            </p>
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                saldoLivre >= 0
                  ? "bg-salvia-bg text-salvia-foreground border-salvia/40"
                  : "bg-rosa-bg text-rosa-foreground border-rosa/40"
              }`}
            >
              {saldoLivre >= 0 ? "Positivo" : "Negativo"}
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrencyBRL(saldoLivre)}
          </p>
        </CardContent>
      </Card>

      {/* PREVISTO A RECEBER */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Previsto a receber
            </p>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border">
              A receber
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrencyBRL(previstoAReceber)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
