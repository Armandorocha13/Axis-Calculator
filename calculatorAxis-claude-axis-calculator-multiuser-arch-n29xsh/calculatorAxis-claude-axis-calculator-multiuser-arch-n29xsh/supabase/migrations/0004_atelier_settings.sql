-- 0004_atelier_settings.sql
-- Adiciona configurações do ateliê ao perfil do usuário (endereço de retirada, horários e chave pix)

alter table public.profiles
  add column if not exists pickup_address text,
  add column if not exists pickup_hours text,
  add column if not exists pix_key text;
