# Axis Calculator

Sistema de organização de pedidos: calculadora de preço (custo + margem de lucro), acompanhamento de pedidos com aviso de prazo de entrega, contato de clientes e organização financeira. Multiusuário via Supabase, com isolamento de dados por Row Level Security (RLS) — cada usuário só vê os próprios dados.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Auth + RLS)

## Configuração inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar/conectar seu projeto Supabase

Crie um projeto em [supabase.com](https://supabase.com) (ou use um já existente).

Em **Project Settings → API**, copie:
- **Project URL**
- **anon public key**
- **service_role key** (mantenha em segredo — nunca vai para o navegador)

Copie `.env.local.example` para `.env.local` e preencha essas três variáveis.

### 3. Rodar a migração do banco

Abra o **SQL Editor** do seu projeto Supabase, cole todo o conteúdo de `supabase/migrations/0001_init_schema.sql` e execute. Isso cria as tabelas (`profiles`, `customers`, `orders`, `price_calculations`), a view `financial_summary` e todas as políticas de RLS.

### 4. Criar sua conta e virar admin

Não existe tela pública de cadastro — contas são criadas pelo admin, de dentro do próprio sistema. Para criar a **primeira** conta (a sua), é necessário um passo manual único:

1. No Supabase Dashboard: **Authentication → Users → Add User**, preencha e-mail/senha e marque "Auto Confirm User".
2. No **SQL Editor**, rode (trocando pelo seu UUID de usuário, visível na lista de Users):
   ```sql
   update public.profiles set role = 'admin' where id = '<seu-uuid>';
   ```

A partir daqui, você pode criar todos os demais usuários direto pelo painel em `/admin/usuarios` — sem precisar voltar ao Supabase Dashboard.

### 5. Rodar localmente

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — você será redirecionado para `/login`.

## Estrutura

- `/login` — autenticação (e-mail/senha via Supabase Auth)
- `/dashboard` — resumo financeiro e alertas de prazo
- `/calcular-preco` — calculadora de preço de venda (custo + margem de lucro)
- `/pedidos` — cadastro e acompanhamento de pedidos, com aviso de prazo
- `/clientes` — cadastro de clientes
- `/admin/usuarios` — (somente admins) criar, editar, bloquear e excluir usuários

## Isolamento entre usuários

Todas as tabelas de negócio (`customers`, `orders`, `price_calculations`) têm uma coluna `user_id` e políticas de Row Level Security que restringem toda leitura/escrita a `auth.uid() = user_id`. Isso é reforçado no nível do banco de dados — mesmo que haja um bug no código do app, um usuário não consegue ler ou alterar dados de outro.

A única exceção é o painel `/admin`, que usa a `service_role key` (que ignora RLS) para gerenciar contas — e só está acessível a usuários com `role = 'admin'` na tabela `profiles`.
