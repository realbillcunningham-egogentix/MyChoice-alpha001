-- 0003_lifecycle.sql  Family-exit + child-majority lifecycle (ADR-0005).

create type family_status as enum ('active','exit_requested','frozen','deleted');
alter table families add column status family_status not null default 'active';

-- Minimal, content-free receipt retained AFTER deletion. Counts + scope only, never content.
create table deletion_receipts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,                 -- intentionally not an FK: the family row may be deleted
  requested_by uuid,                       -- pilot_operator or guardian app user id
  scope text not null check (scope in ('family_exit','child_majority')),
  derived_export_provided boolean not null default false,
  raw_artifacts_deleted boolean not null default false,
  records_deleted jsonb not null default '{}',  -- e.g. {"signals":42,"agreements":3}
  created_at timestamptz not null default now()
);

alter table deletion_receipts enable row level security;
create policy receipts_operator on deletion_receipts for select
  using (exists (select 1 from users u where u.id = public.current_app_user_id() and u.is_pilot_operator));
