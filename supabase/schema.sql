-- 골목 꽁초판: Supabase SQL Editor에서 실행
create extension if not exists "pgcrypto";

create table if not exists butts (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  pos_x float not null,
  pos_y float not null,
  rotation float not null,
  created_at timestamptz default now()
);

alter table butts enable row level security;

create policy "butts_select_public"
  on butts for select
  using (true);

create policy "butts_insert_public"
  on butts for insert
  with check (true);

create policy "butts_delete_public"
  on butts for delete
  using (true);

-- Realtime (이미 publication에 다른 테이블이 있으면 충돌 시 대시보드에서 활성화)
alter publication supabase_realtime add table butts;
