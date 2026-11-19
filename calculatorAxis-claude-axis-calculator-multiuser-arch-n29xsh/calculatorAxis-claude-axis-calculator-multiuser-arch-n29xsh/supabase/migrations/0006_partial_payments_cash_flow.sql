-- 0006_partial_payments_cash_flow.sql
-- Integra pagamentos parciais (sinais) e quitações com o fluxo de caixa
-- Garante que:
-- 1. Ao criar um novo pedido com valor_pago > 0, lança entrada de Sinal ou Pagamento imediata.
-- 2. Ao editar um pedido aumentando o valor_pago, lança apenas a diferença no fluxo de caixa.
-- 3. Na quitação rápida, lança apenas a diferença que faltava pagar.
-- 4. Não duplica lançamentos quando outros campos forem editados.

create or replace function public.sync_order_to_cash_flow()
returns trigger
language plpgsql
security definer
as $$
declare
  v_customer_name text;
  v_customer_suffix text := '';
  v_desc text;
  v_diff numeric(12,2) := 0;
  v_is_full boolean := false;
begin
  -- 1. Obter nome do cliente se vinculado
  if new.customer_id is not null then
    select name into v_customer_name from public.customers where id = new.customer_id;
  end if;

  if v_customer_name is not null and trim(v_customer_name) <> '' then
    v_customer_suffix := ' (' || trim(v_customer_name) || ')';
  end if;

  -- 2. Determinar se o pedido está 100% quitado
  if new.payment_status = 'pago' or (new.sale_price is not null and new.sale_price > 0 and coalesce(new.amount_paid, 0) >= new.sale_price) then
    v_is_full := true;
  end if;

  -- 3. Caso INSERT (Novo Pedido): se amount_paid > 0, lança entrada
  if tg_op = 'INSERT' then
    if coalesce(new.amount_paid, 0) > 0 then
      v_diff := coalesce(new.amount_paid, 0);

      if v_is_full then
        v_desc := 'Pagamento - ' || trim(new.description) || v_customer_suffix;
      else
        v_desc := 'Sinal - ' || trim(new.description) || v_customer_suffix;
      end if;

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
        v_diff,
        current_date
      );
    end if;

  -- 4. Caso UPDATE (Edição ou Quitação do Pedido)
  elsif tg_op = 'UPDATE' then
    -- Se o valor já pago aumentou
    if coalesce(new.amount_paid, 0) > coalesce(old.amount_paid, 0) then
      v_diff := coalesce(new.amount_paid, 0) - coalesce(old.amount_paid, 0);
    -- Ou se foi marcado como 'pago' e não havia sido atualizado o amount_paid
    elsif (new.payment_status = 'pago' and old.payment_status is distinct from 'pago') and coalesce(new.sale_price, 0) > coalesce(old.amount_paid, 0) then
      v_diff := coalesce(new.sale_price, 0) - coalesce(old.amount_paid, 0);
    end if;

    if v_diff > 0 then
      if v_is_full then
        v_desc := 'Pagamento - ' || trim(new.description) || v_customer_suffix;
      else
        v_desc := 'Sinal - ' || trim(new.description) || v_customer_suffix;
      end if;

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
        v_diff,
        current_date
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_order_payment_status_changed on public.orders;
create trigger on_order_payment_status_changed
  after insert or update on public.orders
  for each row execute function public.sync_order_to_cash_flow();
