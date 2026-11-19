import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/auth/get-current-profile";
import { RecordsView } from "@/components/records/records-view";
import type { Customer, Order } from "@/lib/types/database.types";

export const metadata: Metadata = {
  title: "Meus Registros | Arte em Conta",
};

export default async function MeusRegistrosPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const { aba } = await searchParams;
  const initialTab = aba === "clientes" ? "clientes" : "pedidos";

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
    <RecordsView
      orders={orders ?? []}
      customers={customers ?? []}
      customersById={customersById}
      profile={profile}
      initialTab={initialTab}
    />
  );
}
