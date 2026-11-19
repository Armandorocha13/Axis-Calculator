-- Calculadora de preço por unidade: adiciona custo unitário, quantidade e
-- lucro líquido ao histórico. Aditiva e não destrutiva — linhas antigas
-- ficam com essas colunas nulas.

alter table public.price_calculations
  add column unit_cost numeric(12,2),
  add column quantity numeric(12,2),
  add column net_profit numeric(12,2);
