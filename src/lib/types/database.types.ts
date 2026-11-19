// Tipos manuais, alinhados com supabase/migrations/0001_init_schema.sql.
// Depois de conectar seu projeto Supabase, você pode substituir este arquivo
// pelo gerado automaticamente com:
//   npx supabase gen types typescript --project-id <seu-project-id> > src/lib/types/database.types.ts

export type OrderStatus =
  | "pendente"
  | "em_producao"
  | "pronto"
  | "entregue"
  | "cancelado";

export type PaymentStatus = "pendente" | "parcial" | "pago";

export type CashFlowType = "entrada" | "saida";

export type UserRole = "admin" | "user";

// Usamos `type` (não `interface`) porque o TypeScript só considera um
// `type` estruturalmente compatível com `Record<string, unknown>` em
// checagens condicionais — é assim que o `supabase gen types` também gera.
export type Profile = {
  id: string;
  full_name: string | null;
  business_name: string | null;
  pickup_address: string | null;
  pickup_hours: string | null;
  pix_key: string | null;
  whatsapp_template?: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  customer_id: string | null;
  description: string;
  status: OrderStatus;
  due_date: string;
  total_cost: number | null;
  sale_price: number | null;
  payment_status: PaymentStatus;
  amount_paid: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PriceCalculation = {
  id: string;
  user_id: string;
  order_id: string | null;
  unit_cost: number | null;
  quantity: number | null;
  total_cost: number;
  profit_margin_percent: number;
  suggested_price: number;
  net_profit: number | null;
  created_at: string;
};

export type CashFlowEntry = {
  id: string;
  user_id: string;
  order_id: string | null;
  type: CashFlowType;
  category: string;
  description: string;
  amount: number;
  entry_date: string;
  created_at: string;
  updated_at: string;
};

export type FinancialSummary = {
  user_id: string;
  total_gasto: number;
  total_recebido: number;
  lucro_realizado: number;
  previsto_a_receber: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: Partial<Customer> & { user_id: string; name: string };
        Update: Partial<Customer>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: Partial<Order> & {
          user_id: string;
          description: string;
          due_date: string;
        };
        Update: Partial<Order>;
        Relationships: [];
      };
      price_calculations: {
        Row: PriceCalculation;
        Insert: Partial<PriceCalculation> & {
          user_id: string;
          total_cost: number;
          profit_margin_percent: number;
          suggested_price: number;
        };
        Update: Partial<PriceCalculation>;
        Relationships: [];
      };
      cash_flow_entries: {
        Row: CashFlowEntry;
        Insert: Partial<CashFlowEntry> & {
          user_id: string;
          type: CashFlowType;
          category: string;
          description: string;
          amount: number;
        };
        Update: Partial<CashFlowEntry>;
        Relationships: [];
      };
    };
    Views: {
      financial_summary: {
        Row: FinancialSummary;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
  };
};
