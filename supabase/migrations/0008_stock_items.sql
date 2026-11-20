-- 0008_stock_items.sql
-- Controle de estoque simples com cálculo automático de custo unitário para Arte em Conta

create table if not exists public.stock_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  unit text not null default 'un',
  current_quantity numeric(12,2) not null default 0 check (current_quantity >= 0),
  min_quantity numeric(12,2) not null default 0 check (min_quantity >= 0),
  last_purchase_total numeric(12,2) not null default 0 check (last_purchase_total >= 0),
  last_purchase_quantity numeric(12,2) not null default 1 check (last_purchase_quantity > 0),
  unit_cost numeric(12,4) not null default 0 check (unit_cost >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_transactions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.stock_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('entrada', 'saida')),
  quantity numeric(12,2) not null check (quantity > 0),
  unit_cost numeric(12,4) check (unit_cost >= 0),
  total_cost numeric(12,2) check (total_cost >= 0),
  notes text,
  created_at timestamptz not null default now()
);

-- Índices de consulta rápida
create index if not exists stock_items_user_id_idx on public.stock_items(user_id);
create index if not exists stock_items_name_idx on public.stock_items(name);
create index if not exists stock_transactions_item_id_idx on public.stock_transactions(item_id);
create index if not exists stock_transactions_user_id_idx on public.stock_transactions(user_id);

-- Habilitar Row Level Security (RLS)
alter table public.stock_items enable row level security;
alter table public.stock_transactions enable row level security;

-- Políticas de RLS para stock_items
create policy "stock_items_select_own" on public.stock_items
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "stock_items_insert_own" on public.stock_items
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "stock_items_update_own" on public.stock_items
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "stock_items_delete_own" on public.stock_items
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Políticas de RLS para stock_transactions
create policy "stock_transactions_select_own" on public.stock_transactions
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "stock_transactions_insert_own" on public.stock_transactions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "stock_transactions_delete_own" on public.stock_transactions
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Trigger de updated_at para stock_items
drop trigger if exists stock_items_set_updated_at on public.stock_items;
create trigger stock_items_set_updated_at
  before update on public.stock_items
  for each row execute function public.set_updated_at();

comment on table public.stock_items is 'Cadastro e saldo de materiais de ateliê com custo unitário';
comment on table public.stock_transactions is 'Histórico de entradas (compras) e saídas (baixas) de estoque';
