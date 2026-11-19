import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/auth/get-current-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerForm } from "@/components/customers/customer-form";
import { CustomerTable } from "@/components/customers/customer-table";
import { createCustomerAction } from "./actions";
import type { Customer, Order } from "@/lib/types/database.types";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { profile } = await getCurrentUserAndProfile();

  const [{ data: customers }, { data: orders }] = await Promise.all([
    supabase
      .from("customers")
      .select("*")
      .order("name", { ascending: true })
      .returns<Customer[]>(),
    supabase
      .from("orders")
      .select("*")
      .order("due_date", { ascending: false })
      .returns<Order[]>(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Clientes</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Novo cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerForm action={createCustomerAction} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Todos os clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerTable
              customers={customers ?? []}
              orders={orders ?? []}
              profile={profile}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
