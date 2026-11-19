import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pedidos | Arte em Conta",
};
import { getCurrentUserAndProfile } from "@/lib/auth/get-current-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderForm } from "@/components/orders/order-form";
import { OrderTable } from "@/components/orders/order-table";
import { createOrderAction } from "./actions";
import type { Customer, Order } from "@/lib/types/database.types";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { profile } = await getCurrentUserAndProfile();

  const [{ data: orders }, { data: customers }] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .order("due_date", { ascending: true })
      .returns<Order[]>(),
    supabase.from("customers").select("*").order("name").returns<Customer[]>(),
  ]);

  const customersById = new Map(
    (customers ?? []).map((customer) => [customer.id, customer]),
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Pedidos</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Novo pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderForm action={createOrderAction} customers={customers ?? []} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Todos os pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTable
              orders={orders ?? []}
              customersById={customersById}
              profile={profile}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
