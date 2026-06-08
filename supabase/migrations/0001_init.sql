-- 0001_init.sql  MyChoice Alpha schema (domain-first; mirrors @mychoice/domain).
-- There is deliberately NO raw-content column anywhere in this schema (ADR-0002).
create extension if not exists pgcrypto;

create type role as enum ('system_admin','guardian','child','professional');
create type membership_status as enum ('invited','active','suspended','removed');
create type signal_category as enum ('attention_engagement','social_interaction','content_exposure','emotional_behavioral','wellness','safety','growth_development','composite');
create type signal_domain as enum ('wellness','social','educational','safety','personal');
create type privacy_class as enum ('derived_safe','sensitive');
create type agreement_category as enum ('technology_usage','educational','wellbeing','communication','safety','autonomy');
create type agreement_status as enum ('draft','proposed','active','suspended','archived','superseded');
create type consent_kind as enum ('parental_consent','data_processing','professional_access');
create type consent_state as enum ('pending','granted','revoked');
create type flag_status as enum ('open','acknowledged','escalated','resolved');

create table users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique,
  display_name text not null,
  date_of_birth date,
  is_platform_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table memberships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role role not null,
  status membership_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create table relationship_edges (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  from_user_id uuid not null references users(id) on delete cascade,
  to_user_id uuid not null references users(id) on delete cascade,
  kind text not null check (kind in ('guardian_of','professional_of')),
  domain signal_domain,
  authority_rank int not null default 0,
  valid_from timestamptz not null default now(),
  valid_to timestamptz
);

create table data_sources (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  subject_user_id uuid not null references users(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);

create table ingest_runs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  subject_user_id uuid not null references users(id) on delete cascade,
  data_source_id uuid references data_sources(id) on delete set null,
  raw_object_path text,            -- ephemeral storage pointer
  raw_destroyed_at timestamptz,    -- set when raw payload deleted (ADR-0002)
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table signals (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  subject_user_id uuid not null references users(id) on delete cascade,
  category signal_category not null,
  type text not null,
  value double precision not null,
  value_type text not null check (value_type in ('scalar','score','boolean','categorical')),
  unit text,
  window_start timestamptz not null,
  window_end timestamptz not null,
  confidence real not null check (confidence between 0 and 1),
  source_type text not null,
  ingest_run_id uuid references ingest_runs(id) on delete set null,
  transform_id text,
  transform_version text,
  privacy_class privacy_class not null default 'derived_safe',
  domain signal_domain not null default 'wellness',
  raw_excluded boolean not null default true check (raw_excluded = true),
  raw_exclusion_note text,
  composite_of uuid[],
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  metadata jsonb not null default '{}'
);
create index signals_subject_type_idx on signals (subject_user_id, type, window_end desc);

create table agreements (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  description text,
  category agreement_category not null,
  status agreement_status not null default 'draft',
  current_version_id uuid,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  effective_at timestamptz,
  review_at timestamptz,
  expires_at timestamptz
);

create table agreement_versions (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references agreements(id) on delete cascade,
  version_no int not null,
  human_text text not null,
  rules jsonb not null default '[]',          -- machine-evaluatable AgreementRule[] (ADR-0003)
  success_criteria jsonb not null default '[]',
  autonomy_criteria jsonb not null default '[]',
  escalation_rules jsonb not null default '[]',
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  supersedes_version_id uuid references agreement_versions(id),
  unique (agreement_id, version_no)
);
alter table agreements add constraint agreements_current_version_fk
  foreign key (current_version_id) references agreement_versions(id) deferrable initially deferred;

create table agreement_participants (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references agreements(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role_in_agreement text not null check (role_in_agreement in ('proposer','signer','observer')),
  consent_state text not null default 'pending' check (consent_state in ('pending','accepted','declined','withdrawn')),
  signed_at timestamptz,
  unique (agreement_id, user_id)
);

create table recommendations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  subject_user_id uuid references users(id) on delete cascade,
  audience text not null check (audience in ('parent','child','shared')),
  agreement_id uuid references agreements(id) on delete set null,
  body text not null,           -- AI guidance derived from signals only; never raw content
  obligations text[] not null default '{}',
  reviewed_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table flags (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  subject_user_id uuid not null references users(id) on delete cascade,
  reason text not null default 'other' check (reason in ('uncomfortable','contact','content','other')),
  note text,
  status flag_status not null default 'open',
  created_at timestamptz not null default now()
);

create table consents (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  subject_user_id uuid not null references users(id) on delete cascade,
  granted_by_user_id uuid not null references users(id),
  kind consent_kind not null,
  state consent_state not null default 'pending',
  granted_at timestamptz,
  revoked_at timestamptz,
  expires_at timestamptz
);

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete set null,
  actor_user_id uuid references users(id) on delete set null,
  action text not null,
  object_type text not null,
  object_id text,
  decision text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'
);
