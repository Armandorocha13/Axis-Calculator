-- 0003_cash_flow.sql
-- Tabela de Fluxo de Caixa (Entradas e Saídas)

create table if not exists public.cash_flow_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  type text not null check (type in ('entrada', 'saida')),
  category text not null,
  description text not null,
  amount numeric(12,2) not null check (amount >= 0),
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cash_flow_user_id_idx on public.cash_flow_entries(user_id);
create index if not exists cash_flow_entry_date_idx on public.cash_flow_entries(entry_date);
create index if not exists cash_flow_order_id_idx on public.cash_flow_entries(order_id);

alter table public.cash_flow_entries enable row level security;

create policy "cash_flow_select_own" on public.cash_flow_entries
  for select using ((select auth.uid()) = user_id);

create policy "cash_flow_insert_own" on public.cash_flow_entries
  for insert with check ((select auth.uid()) = user_id);

create policy "cash_flow_update_own" on public.cash_flow_entries
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "cash_flow_delete_own" on public.cash_flow_entries
  for delete using ((select auth.uid()) = user_id);

drop trigger if exists cash_flow_set_updated_at on public.cash_flow_entries;
create trigger cash_flow_set_updated_at
  before update on public.cash_flow_entries
  for each row execute function public.set_updated_at();

-- Trigger de automação para sincronizar pedidos pagos com o fluxo de caixa
create or replace function public.sync_order_to_cash_flow()
returns trigger
language plpgsql
security definer
as $$
declare
  v_customer_name text;
  v_desc text;
begin
  -- Caso 1: Pedido foi marcado como 'pago'
  if new.payment_status = 'pago' then
    if new.customer_id is not null then
      select name into v_customer_name from public.customers where id = new.customer_id;
    end if;

    if v_customer_name is not null and v_customer_name <> '' then
      v_desc := new.description || ' - ' || v_customer_name;
    else
      v_desc := new.description;
    end if;

    -- Se já existir uma entrada vinculada a este pedido, atualiza o valor/descrição
    if exists (select 1 from public.cash_flow_entries where order_id = new.id) then
      update public.cash_flow_entries
      set amount = coalesce(new.sale_price, new.amount_paid, 0),
          description = v_desc,
          updated_at = now()
      where order_id = new.id;
    else
      -- Se não existir, insere uma nova entrada com data atual
      insert into public.cash_flow_entries (
        user_id,
        order_id,
        type,
        category,
        description,
        amount,
        entry_date
      ) values (
        new.user_id,
        new.id,
        'entrada',
        'Pedido',
        v_desc,
        coalesce(new.sale_price, new.amount_paid, 0),
        current_date
      );
    end if;
  end if;

  -- Caso 2: Pedido deixou de ser 'pago' (mudou para pendente ou parcial)
  if tg_op = 'UPDATE' and old.payment_status = 'pago' and new.payment_status <> 'pago' then
    delete from public.cash_flow_entries where order_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_order_payment_status_changed on public.orders;
create trigger on_order_payment_status_changed
  after insert or update of payment_status, sale_price, customer_id, description on public.orders
  for each row execute function public.sync_order_to_cash_flow();
