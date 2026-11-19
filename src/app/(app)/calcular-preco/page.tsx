import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Calcular Preço",
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableTd,
  TableTh,
} from "@/components/ui/table";
import { PriceCalculatorForm } from "@/components/pricing/price-calculator-form";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import type { Order, PriceCalculation } from "@/lib/types/database.types";

export default async function PriceCalculatorPage() {
  const supabase = await createClient();

  const [{ data: orders }, { data: history }] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .in("status", ["pendente", "em_producao", "pronto"])
      .order("due_date", { ascending: true })
      .returns<Order[]>(),
    supabase
      .from("price_calculations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)
      .returns<PriceCalculation[]>(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Calcular Preço</h1>

      <Card>
        <CardHeader>
          <CardTitle>Nova simulação</CardTitle>
        </CardHeader>
        <CardContent>
          <PriceCalculatorForm orders={orders ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico recente</CardTitle>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Data</TableTh>
                  <TableTh>Qtd.</TableTh>
                  <TableTh>Custo</TableTh>
                  <TableTh>Margem</TableTh>
                  <TableTh>Preço sugerido</TableTh>
                  <TableTh>Lucro líquido</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableTd>{formatDateBR(item.created_at)}</TableTd>
                    <TableTd>{item.quantity ?? "—"}</TableTd>
                    <TableTd>{formatCurrencyBRL(item.total_cost)}</TableTd>
                    <TableTd>{item.profit_margin_percent}%</TableTd>
                    <TableTd>{formatCurrencyBRL(item.suggested_price)}</TableTd>
                    <TableTd>
                      {item.net_profit != null
                        ? formatCurrencyBRL(item.net_profit)
                        : "—"}
                    </TableTd>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum cálculo salvo ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
