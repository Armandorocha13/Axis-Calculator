-- 0005_order_quick_settlement.sql
-- Atualiza a função de sincronização do pedido com o fluxo de caixa
-- para lidar com quitação e lançamento de saldo restante/sinal.

create or replace function public.sync_order_to_cash_flow()
returns trigger
language plpgsql
security definer
as $$
declare
  v_customer_name text;
  v_desc text;
  v_amount_to_launch numeric;
begin
  -- Caso 1: Pedido foi marcado como 'pago'
  if new.payment_status = 'pago' and (tg_op = 'INSERT' or old.payment_status is distinct from 'pago') then
    if new.customer_id is not null then
      select name into v_customer_name from public.customers where id = new.customer_id;
    end if;

    if v_customer_name is not null and v_customer_name <> '' then
      v_desc := new.description || ' - ' || v_customer_name;
    else
      v_desc := new.description;
    end if;

    -- Se já havia sinal (old.amount_paid > 0) e é menor que o preço de venda, lança só a diferença
    if tg_op = 'UPDATE' and coalesce(old.amount_paid, 0) > 0 and coalesce(old.amount_paid, 0) < coalesce(new.sale_price, 0) then
      v_amount_to_launch := coalesce(new.sale_price, 0) - coalesce(old.amount_paid, 0);
    else
      v_amount_to_launch := coalesce(new.sale_price, new.amount_paid, 0);
    end if;

    if v_amount_to_launch > 0 then
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
        v_amount_to_launch,
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
