import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerForm } from "@/components/customers/customer-form";
import { updateCustomerAction } from "../actions";
import type { Customer } from "@/lib/types/database.types";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle<Customer>();

  if (!customer) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Editar cliente</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{customer.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm
            action={updateCustomerAction.bind(null, id)}
            defaultValues={customer}
            submitLabel="Atualizar cliente"
          />
        </CardContent>
      </Card>
    </div>
  );
}
