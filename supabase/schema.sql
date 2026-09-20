-- NevoaLaje — schema multi-tenant (idempotente)

create extension if not exists "pgcrypto";

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique not null,
  plano text not null default 'trial' check (plano in ('nevoa','oficina','fabrica','trial')),
  status text not null default 'trial' check (status in ('ativo','trial','inadimplente','cancelado')),
  cidade text,
  cnpj text,
  telefone text,
  logo_text text default 'NL',
  mp_preapproval_id text,
  mp_payer_email text,
  trial_ends_at timestamptz default now() + interval '14 days',
  created_at timestamptz default now()
);

alter table public.tenants add column if not exists logo_text text default 'NL';

create table if not exists public.platform_admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  nome text not null,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  nome text not null,
  role text not null default 'operador' check (role in ('owner','operador')),
  created_at timestamptz default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  nome text not null,
  telefone text,
  email text,
  endereco text,
  documento text,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  descricao text not null,
  unidade text not null,
  custo_unitario numeric(12,2) not null default 0,
  tipo text not null default 'material'
);

create table if not exists public.tenant_config (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  inter_eixo_eps numeric(6,3) default 0.50,
  inter_eixo_lajota numeric(6,3) default 0.43,
  barra_trelica numeric(6,2) default 12,
  barra_vergalhao numeric(6,2) default 12,
  capeamento_espessura numeric(6,3) default 0.02,
  capeamento_largura numeric(6,3) default 0.12,
  volume_por_traco numeric(8,4) default 0.1152,
  metros_lineares_por_traco numeric(8,2) default 48,
  cimento_por_traco numeric(6,2) default 1.5,
  latas_areia_por_traco numeric(6,2) default 6.5,
  latas_brita_por_traco numeric(6,2) default 5,
  lata_litros numeric(6,3) default 0.018,
  vergalhao_minimo numeric(6,2) default 3.40,
  lajotas_por_m2 numeric(6,2) default 13,
  precos_m2 jsonb default '{}'::jsonb,
  algoritmo_padrao text default 'DP'
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  numero int not null,
  client_id uuid references public.clients(id),
  cliente_nome text not null,
  status text not null default 'ABERTO',
  area_total numeric(12,3) default 0,
  valor_total numeric(12,2) default 0,
  algoritmo text default 'DP',
  observacao text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (tenant_id, numero)
);

create table if not exists public.quote_rooms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quote_id uuid not null references public.quotes(id) on delete cascade,
  nome text not null,
  vao_menor numeric(8,3) not null,
  vao_maior numeric(8,3) not null,
  tipo text not null,
  altura int not null,
  largura_viga numeric(8,2) default 0,
  qtd_vigotas int not null,
  tamanho_vigota numeric(8,3) not null,
  metragem_eps numeric(10,3) default 0,
  area numeric(10,3) not null,
  valor_estimado numeric(12,2) default 0,
  preco_m2 numeric(12,2) default 0
);

alter table public.quote_rooms add column if not exists preco_m2 numeric(12,2) default 0;

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quote_id uuid not null references public.quotes(id) on delete cascade,
  data date not null,
  vigotas jsonb not null default '[]'::jsonb,
  observacao text
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete set null,
  kind text not null check (kind in ('subscription','pix_yearly')),
  plan text not null,
  mp_id text,
  status text,
  amount numeric(12,2),
  raw jsonb,
  created_at timestamptz default now()
);

create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_admins pa
    join auth.users u on lower(u.email) = lower(pa.email)
    where u.id = auth.uid()
  )
$$;

alter table public.tenants enable row level security;
alter table public.platform_admins enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.tenant_config enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_rooms enable row level security;
alter table public.deliveries enable row level security;
alter table public.payments enable row level security;

drop policy if exists tenants_select on public.tenants;
drop policy if exists tenants_update_own on public.tenants;
drop policy if exists tenants_admin_all on public.tenants;
drop policy if exists t_admin on public.tenants;
create policy tenants_select on public.tenants for select using (id = public.current_tenant_id() or public.is_platform_admin());
create policy tenants_update_own on public.tenants for update using (id = public.current_tenant_id()) with check (id = public.current_tenant_id());
create policy tenants_admin_all on public.tenants for all using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists pa_admin on public.platform_admins;
create policy pa_admin on public.platform_admins for select using (public.is_platform_admin() or lower(email) = lower(coalesce(auth.jwt()->>'email','')));

drop policy if exists pr_self on public.profiles;
drop policy if exists pr_write on public.profiles;
create policy pr_self on public.profiles for select using (id = auth.uid() or tenant_id = public.current_tenant_id() or public.is_platform_admin());
create policy pr_write on public.profiles for all using (id = auth.uid() or public.is_platform_admin()) with check (id = auth.uid() or public.is_platform_admin());

drop policy if exists tenant_select on public.clients;
drop policy if exists tenant_write on public.clients;
create policy tenant_select on public.clients for select using (tenant_id = public.current_tenant_id() or public.is_platform_admin());
create policy tenant_write on public.clients for all using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists p_select on public.products;
drop policy if exists p_write on public.products;
create policy p_select on public.products for select using (tenant_id = public.current_tenant_id() or public.is_platform_admin());
create policy p_write on public.products for all using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists q_select on public.quotes;
drop policy if exists q_write on public.quotes;
create policy q_select on public.quotes for select using (tenant_id = public.current_tenant_id() or public.is_platform_admin());
create policy q_write on public.quotes for all using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists r_select on public.quote_rooms;
drop policy if exists r_write on public.quote_rooms;
create policy r_select on public.quote_rooms for select using (tenant_id = public.current_tenant_id() or public.is_platform_admin());
create policy r_write on public.quote_rooms for all using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists d_select on public.deliveries;
drop policy if exists d_write on public.deliveries;
create policy d_select on public.deliveries for select using (tenant_id = public.current_tenant_id() or public.is_platform_admin());
create policy d_write on public.deliveries for all using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists cfg_select on public.tenant_config;
drop policy if exists cfg_write on public.tenant_config;
create policy cfg_select on public.tenant_config for select using (tenant_id = public.current_tenant_id() or public.is_platform_admin());
create policy cfg_write on public.tenant_config for all using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());

drop policy if exists pay_admin on public.payments;
create policy pay_admin on public.payments for all using (public.is_platform_admin()) with check (public.is_platform_admin());

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.platform_admins to authenticated;
