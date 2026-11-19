-- Axis Calculator — schema inicial + Row Level Security
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase
-- (Project → SQL Editor → New query → colar → Run).

create extension if not exists "pgcrypto";

create type public.order_status as enum (
  'pendente', 'em_producao', 'pronto', 'entregue', 'cancelado'
);

create type public.payment_status as enum (
  'pendente', 'parcial', 'pago'
);

create type public.user_role as enum ('admin', 'user');

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ==== PROFILES (espelha auth.users) ====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  business_name text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Impede que o próprio usuário se autopromova a admin via update comum.
-- A policy de update abaixo só valida "é dono da linha", não protege a
-- coluna role — só a service role key (usada nas Server Actions de /admin)
-- consegue alterar essa coluna.
create or replace function public.prevent_role_escalation()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role and auth.role() <> 'service_role' then
    new.role = old.role;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Cria o profile automaticamente quando um usuário é criado no Auth
-- (seja pelo painel /admin, seja pelo Supabase Dashboard).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==== CUSTOMERS ====
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_user_id_idx on public.customers(user_id);

create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

alter table public.customers enable row level security;

create policy "customers_select_own" on public.customers
  for select using (auth.uid() = user_id);
create policy "customers_insert_own" on public.customers
  for insert with check (auth.uid() = user_id);
create policy "customers_update_own" on public.customers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "customers_delete_own" on public.customers
  for delete using (auth.uid() = user_id);

-- ==== ORDERS ====
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  description text not null,
  status public.order_status not null default 'pendente',
  due_date date not null,
  total_cost numeric(12,2),
  sale_price numeric(12,2),
  payment_status public.payment_status not null default 'pendente',
  amount_paid numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders(user_id);
create index orders_due_date_idx on public.orders(due_date);
create index orders_customer_id_idx on public.orders(customer_id);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

-- No insert/update, além de garantir dono, garante que o customer_id
-- (se informado) também pertence ao mesmo usuário.
create policy "orders_insert_own" on public.orders
  for insert with check (
    auth.uid() = user_id
    and (
      customer_id is null
      or exists (
        select 1 from public.customers c
        where c.id = customer_id and c.user_id = auth.uid()
      )
    )
  );

create policy "orders_update_own" on public.orders
  for update using (auth.uid() = user_id) with check (
    auth.uid() = user_id
    and (
      customer_id is null
      or exists (
        select 1 from public.customers c
        where c.id = customer_id and c.user_id = auth.uid()
      )
    )
  );

create policy "orders_delete_own" on public.orders
  for delete using (auth.uid() = user_id);

-- ==== PRICE_CALCULATIONS (histórico da calculadora) ====
create table public.price_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  total_cost numeric(12,2) not null,
  profit_margin_percent numeric(6,2) not null,
  suggested_price numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index price_calculations_user_id_idx on public.price_calculations(user_id);
create index price_calculations_order_id_idx on public.price_calculations(order_id);

alter table public.price_calculations enable row level security;

create policy "price_calc_select_own" on public.price_calculations
  for select using (auth.uid() = user_id);

create policy "price_calc_insert_own" on public.price_calculations
  for insert with check (
    auth.uid() = user_id
    and (
      order_id is null
      or exists (
        select 1 from public.orders o
        where o.id = order_id and o.user_id = auth.uid()
      )
    )
  );

create policy "price_calc_delete_own" on public.price_calculations
  for delete using (auth.uid() = user_id);

-- ==== VIEW: resumo financeiro (derivado de orders) ====
create view public.financial_summary
with (security_invoker = true) as
select
  user_id,
  coalesce(sum(total_cost), 0)                                   as total_gasto,
  coalesce(sum(amount_paid), 0)                                  as total_recebido,
  coalesce(sum(amount_paid), 0) - coalesce(sum(total_cost), 0)   as lucro_realizado,
  coalesce(sum(sale_price) filter (
    where status not in ('entregue', 'cancelado')
  ), 0)                                                          as previsto_a_receber
from public.orders
group by user_id;
