import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderForm } from "@/components/orders/order-form";
import { updateOrderAction } from "../actions";
import type { Customer, Order } from "@/lib/types/database.types";

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: customers }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle<Order>(),
    supabase.from("customers").select("*").order("name").returns<Customer[]>(),
  ]);

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Editar pedido</h1>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{order.description}</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderForm
            action={updateOrderAction.bind(null, id)}
            customers={customers ?? []}
            defaultValues={order}
            submitLabel="Atualizar pedido"
          />
        </CardContent>
      </Card>
    </div>
  );
}
