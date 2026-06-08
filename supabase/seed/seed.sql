-- Synthetic dev family (1 guardian, 1 child). No real PII. Used by `supabase db reset`.
-- Note: pilot_operator is a separate operational account, intentionally NOT seeded here.
-- Signal `type` values use Catalog v0.3 ids (slug reconciliation).
insert into users (id, auth_id, display_name, date_of_birth, is_pilot_operator) values
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-1111-1111-1111-111111111111','Demo Parent','1985-04-01', false),
  ('22222222-2222-2222-2222-222222222222','bbbbbbbb-2222-2222-2222-222222222222','Demo Teen','2012-09-15', false);

insert into families (id, name, created_by) values
  ('fa000000-0000-0000-0000-000000000001','Demo Family','11111111-1111-1111-1111-111111111111');

insert into memberships (family_id, user_id, role) values
  ('fa000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','guardian'),
  ('fa000000-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','child');

insert into relationship_edges (family_id, from_user_id, to_user_id, kind, domain) values
  ('fa000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','guardian_of', null);

insert into agreements (id, family_id, title, description, category, status, created_by, effective_at) values
  ('ag000000-0000-0000-0000-000000000001','fa000000-0000-0000-0000-000000000001','Weekday sleep','No more than 30 min late-night usage on weeknights','wellbeing','active','11111111-1111-1111-1111-111111111111', now());

insert into agreement_versions (id, agreement_id, version_no, human_text, rules, created_by) values
  ('av000000-0000-0000-0000-000000000001','ag000000-0000-0000-0000-000000000001',1,
   'No more than 30 minutes of late-night usage on weeknights',
   jsonb_build_array(jsonb_build_object(
     'id','ru000000-0000-0000-0000-000000000001',
     'subject_signal_type','late-night-activity',
     'subject_category', null,
     'operator','lte',
     'params', jsonb_build_object('threshold',30),
     'window','weekday 21:30-07:00 local',
     'weight',1,
     'on_breach_intervention_level',3,
     'visibility_action','prompt_discussion'
   )),
   '11111111-1111-1111-1111-111111111111');

update agreements set current_version_id = 'av000000-0000-0000-0000-000000000001'
  where id = 'ag000000-0000-0000-0000-000000000001';

insert into agreement_participants (agreement_id, user_id, role_in_agreement, consent_state, signed_at) values
  ('ag000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','proposer','accepted', now()),
  ('ag000000-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','signer','accepted', now());

insert into signals (family_id, subject_user_id, category, type, value, value_type, unit, window_start, window_end, confidence, source_type, transform_id, transform_version, privacy_class, domain, raw_exclusion_note) values
  ('fa000000-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','attention_engagement','late-night-activity',45,'scalar','minutes', now() - interval '7 days', now(), 0.9,'instagram_export','late-night-activity.v1','1.0.0','derived_safe','wellness','derived; raw destroyed'),
  ('fa000000-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','content_exposure','content-volume',12,'scalar','count', now() - interval '7 days', now(), 0.8,'instagram_export','content-volume.v1','1.0.0','derived_safe','wellness','count only');
