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

-- Realtime DELETE 시 삭제된 행 식별용(old 레코드) — 없으면 다른 탭에서 꽁초가 안 사라질 수 있음
alter table butts replica identity full;

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

-- 이미 예전 스키마로 butts 가 있다면, SQL Editor 에서 한 번 실행:
-- alter table butts replica identity full;
