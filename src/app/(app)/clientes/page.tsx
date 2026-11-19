import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomerForm } from "@/components/customers/customer-form";
import { createCustomerAction } from "./actions";

export const metadata: Metadata = {
  title: "Novo Cliente",
};

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Cadastrar Cliente
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Cadastre os dados de contato do cliente para pedidos e mensagens no WhatsApp.
          </p>
        </div>

        <Link href="/meus-registros?aba=clientes">
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
          <CardTitle className="text-base font-semibold">Novo Cliente</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <CustomerForm action={createCustomerAction} />
        </CardContent>
      </Card>
    </div>
  );
}
