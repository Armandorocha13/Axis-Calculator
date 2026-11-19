"use client";

import { useState } from "react";
import Link from "next/link";
import { OrderTable } from "@/components/orders/order-table";
import { CustomerTable } from "@/components/customers/customer-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Customer, Order, Profile } from "@/lib/types/database.types";

interface RecordsViewProps {
  orders: Order[];
  customers: Customer[];
  customersById: Map<string, Customer>;
  profile?: Profile | null;
  initialTab?: "pedidos" | "clientes";
}

export function RecordsView({
  orders,
  customers,
  customersById,
  profile,
  initialTab = "pedidos",
}: RecordsViewProps) {
  const [activeTab, setActiveTab] = useState<"pedidos" | "clientes">(initialTab);

  const totalPedidos = orders.length;
  const totalClientes = customers.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho da página com título e controles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Meus Registros
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Consulte, gerencie e acompanhe todos os pedidos e clientes cadastrados no ateliê.
          </p>
        </div>

        {/* Botão de atalho para cadastrar novo conforme aba ativa */}
        <div className="flex items-center gap-2">
          {activeTab === "pedidos" ? (
            <Link href="/pedidos">
              <Button
                variant="primary"
                className="gap-2 text-xs sm:text-sm font-medium shadow-xs"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Novo Pedido</span>
              </Button>
            </Link>
          ) : (
            <Link href="/clientes">
              <Button
                variant="primary"
                className="gap-2 text-xs sm:text-sm font-medium shadow-xs"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Novo Cliente</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Abas Superiores de Alternância: Pedidos e Clientes */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <div className="inline-flex rounded-xl bg-card border border-border p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("pedidos")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer",
              activeTab === "pedidos"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={activeTab === "pedidos" ? "text-primary-foreground" : "text-muted-foreground"}
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Pedidos</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                activeTab === "pedidos"
                  ? "bg-white/25 text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {totalPedidos}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("clientes")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer",
              activeTab === "clientes"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={activeTab === "clientes" ? "text-primary-foreground" : "text-muted-foreground"}
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Clientes</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                activeTab === "clientes"
                  ? "bg-white/25 text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {totalClientes}
            </span>
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          {activeTab === "pedidos" ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Todos os Pedidos Cadastrados
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Filtre por status, pesquise por cliente ou descrição e envie avisos de retirada pelo WhatsApp.
                  </p>
                </div>
              </div>
              <OrderTable
                orders={orders}
                customersById={customersById}
                profile={profile}
              />
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Todos os Clientes Cadastrados
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Visualize o histórico de encomendas, dados de contato e inicie conversas no WhatsApp.
                  </p>
                </div>
              </div>
              <CustomerTable
                customers={customers}
                orders={orders}
                profile={profile}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
