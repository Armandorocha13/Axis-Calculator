import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderForm } from "@/components/orders/order-form";
import { createOrderAction } from "./actions";
import type { Customer } from "@/lib/types/database.types";

export const metadata: Metadata = {
  title: "Novo Pedido | Arte em Conta",
};

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("name")
    .returns<Customer[]>();

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Cadastrar Pedido
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Preencha os dados da nova encomenda do ateliê.
          </p>
        </div>

        <Link href="/meus-registros?aba=pedidos">
          <Button
            variant="secondary"
            className="text-xs sm:text-sm font-medium gap-1.5 shadow-2xs"
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Ver Meus Registros</span>
            <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </div>

      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardHeader className="pb-3 border-b border-border/70">
          <CardTitle className="text-base font-semibold">Novo Pedido</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <OrderForm action={createOrderAction} customers={customers ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
