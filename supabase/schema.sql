-- 골목 꽁초판: Supabase SQL Editor에서 실행
create extension if not exists "pgcrypto";

create table if not exists butts (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  brand text not null default 'marlboro',
  location text not null default 'seoul',
  warm_until timestamptz,
  pos_x float not null,
  pos_y float not null,
  rotation float not null,
  created_at timestamptz default now()
);

alter table butts
  add column if not exists brand text not null default 'marlboro';
alter table butts
  add column if not exists location text not null default 'seoul';
alter table butts
  add column if not exists warm_until timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'butts_brand_check'
  ) then
    alter table butts
      add constraint butts_brand_check
      check (brand in ('mildseven','marlboro','esse','dunhill','parliament','raison','this','bohem','camel'));
  end if;
end $$;

create table if not exists butt_comments (
  id uuid primary key default gen_random_uuid(),
  butt_id uuid not null references butts(id) on delete cascade,
  author text not null,
  content text not null,
  password_hash text not null,
  created_at timestamptz default now()
);

create index if not exists idx_butt_comments_butt_id on butt_comments (butt_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'butts_location_check'
  ) then
    alter table butts
      add constraint butts_location_check
      check (location in ('seoul','anyang'));
  end if;
end $$;

-- Realtime DELETE 시 삭제된 행 식별용(old 레코드) — 없으면 다른 탭에서 꽁초가 안 사라질 수 있음
alter table butts replica identity full;

alter table butts enable row level security;

drop policy if exists "butts_select_public" on butts;
create policy "butts_select_public"
  on butts for select
  using (true);

drop policy if exists "butts_insert_public" on butts;
create policy "butts_insert_public"
  on butts for insert
  with check (true);

drop policy if exists "butts_delete_public" on butts;
create policy "butts_delete_public"
  on butts for delete
  using (true);

-- Realtime (이미 등록된 경우 재실행해도 안전하게 처리)
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'butts'
  ) then
    alter publication supabase_realtime add table butts;
  end if;
end $$;

-- 이미 예전 스키마로 butts 가 있다면, SQL Editor 에서 한 번 실행:
-- alter table butts replica identity full;
