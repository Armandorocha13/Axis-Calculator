-- Adiciona coluna de modelo customizado de mensagem de WhatsApp no perfil do usuário
alter table public.profiles
  add column if not exists whatsapp_template text;

comment on column public.profiles.whatsapp_template is
  'Modelo personalizado para avisos de retirada via WhatsApp, com suporte a variáveis {cliente}, {pedido}, {endereco}, etc.';
