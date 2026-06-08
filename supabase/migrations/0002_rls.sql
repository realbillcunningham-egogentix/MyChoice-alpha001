-- 0002_rls.sql  Deny-by-default RLS. Enforcement of record for client reads (ADR-0002).
-- Service-role writes (Edge Functions) bypass RLS. Mirrors governance-engine/visibility.ts.

create or replace function public.current_app_user_id() returns uuid
  language sql stable as $$ select id from public.users where auth_id = auth.uid() $$;

create or replace function public.is_guardian_of(subject uuid) returns boolean
  language sql stable as $$
    select exists (
      select 1 from public.relationship_edges e
      where e.kind = 'guardian_of'
        and e.from_user_id = public.current_app_user_id()
        and e.to_user_id = subject
        and (e.valid_to is null or e.valid_to > now())
    )
  $$;

create or replace function public.is_family_member(fam uuid) returns boolean
  language sql stable as $$
    select exists (
      select 1 from public.memberships m
      where m.family_id = fam and m.user_id = public.current_app_user_id() and m.status = 'active'
    )
  $$;

alter table users               enable row level security;
alter table families            enable row level security;
alter table memberships         enable row level security;
alter table relationship_edges  enable row level security;
alter table data_sources        enable row level security;
alter table ingest_runs         enable row level security;
alter table signals             enable row level security;
alter table agreements          enable row level security;
alter table agreement_versions  enable row level security;
alter table agreement_participants enable row level security;
alter table recommendations     enable row level security;
alter table flags               enable row level security;
alter table consents            enable row level security;
alter table audit_events        enable row level security;

create policy users_self on users for select
  using (id = public.current_app_user_id() or is_pilot_operator = true);

create policy families_member on families for select using (public.is_family_member(id));
create policy memberships_member on memberships for select using (public.is_family_member(family_id));
create policy edges_member on relationship_edges for select using (public.is_family_member(family_id));

-- SIGNALS: subject reads own; guardian reads ONLY derived_safe of their subjects. pilot_operator: none.
create policy signals_self on signals for select
  using (subject_user_id = public.current_app_user_id());
create policy signals_guardian_derived on signals for select
  using (privacy_class = 'derived_safe' and public.is_guardian_of(subject_user_id));

create policy agreements_read on agreements for select using (public.is_family_member(family_id));
create policy agreements_propose on agreements for insert with check (public.is_family_member(family_id));
create policy aversions_read on agreement_versions for select
  using (exists (select 1 from agreements a where a.id = agreement_id and public.is_family_member(a.family_id)));
create policy aparticipants_read on agreement_participants for select
  using (exists (select 1 from agreements a where a.id = agreement_id and public.is_family_member(a.family_id)));

create policy recs_child on recommendations for select
  using (audience in ('child','shared') and subject_user_id = public.current_app_user_id());
create policy recs_parent on recommendations for select
  using (audience in ('parent','shared') and public.is_guardian_of(subject_user_id));

create policy flags_self_read on flags for select using (subject_user_id = public.current_app_user_id());
create policy flags_self_insert on flags for insert with check (subject_user_id = public.current_app_user_id());

create policy consents_read on consents for select
  using (subject_user_id = public.current_app_user_id() or granted_by_user_id = public.current_app_user_id());

-- audit: pilot_operator reads METADATA only (no content lives here).
create policy audit_operator on audit_events for select
  using (exists (select 1 from users u where u.id = public.current_app_user_id() and u.is_pilot_operator));

create policy ingest_meta on ingest_runs for select
  using (subject_user_id = public.current_app_user_id() or public.is_guardian_of(subject_user_id));
create policy sources_meta on data_sources for select
  using (subject_user_id = public.current_app_user_id() or public.is_guardian_of(subject_user_id));
