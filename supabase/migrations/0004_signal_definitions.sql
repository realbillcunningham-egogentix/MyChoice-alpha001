-- 0004_signal_definitions.sql  Signal Catalog v0.3 registry + computed status on signals.
-- 13 LIVE definitions only (catalog-verbatim). Default bands here; AgreementRule overrides per family.

create type signal_status as enum ('aligned','attention','crossed','insufficient_data');
alter table signals add column status signal_status;  -- computed from the definition bands

create table signal_definitions (
  id text primary key,                          -- = catalog Signal ID
  display_name text not null,
  catalog_category text not null,
  governance_category signal_category not null,
  domain signal_domain not null,
  supported_platforms text[] not null,
  value_type text not null,
  unit text,
  inverted boolean not null,
  green_cut double precision not null,
  yellow_cut double precision not null,
  band_aligned text not null,
  band_attention text not null,
  band_crossed text not null,
  data_source_path text not null,
  min_data jsonb not null default '{}',
  tier text,
  lifecycle text not null
);

-- Reference data: readable by any authenticated user; writes via service role only.
alter table signal_definitions enable row level security;
create policy signal_definitions_read on signal_definitions for select using (true);

insert into signal_definitions
  (id, display_name, catalog_category, governance_category, domain, supported_platforms, value_type, unit, inverted, green_cut, yellow_cut, band_aligned, band_attention, band_crossed, data_source_path, min_data, tier, lifecycle) values
  ('feed-diversity','Feed Concentration','Feed & Algorithm','content_exposure','social',ARRAY['instagram','tiktok','youtube'],'scalar','%',false,40,60,'Top creator <=40% of views','40-60%','>60%','contentConsumed.byOwner','{}',null,'live'),
  ('algorithmic-amplification','Algorithm Influence','Feed & Algorithm','content_exposure','social',ARRAY['instagram','tiktok','youtube'],'scalar','%',false,30,50,'<=30% from unfollowed','30-50%','>50%','contentConsumed.byOwner vs following.accounts','{}',null,'live'),
  ('follow-feed-alignment','Follow-to-Feed Gap','Feed & Algorithm','social_interaction','social',ARRAY['instagram','tiktok'],'scalar','%',true,50,25,'>=50% of followed appear','25-50%','<25%','following.accounts vs contentConsumed.byOwner','{"following":5}',null,'live'),
  ('content-volume','Content Volume','Activity & Time','attention_engagement','wellness',ARRAY['instagram','tiktok','youtube','facebook'],'scalar','count',false,50,100,'<=50 items','50-100 items','>100 items','contentConsumed.total','{}',null,'live'),
  ('video-ratio','Short-Form Video','Content & Creation','content_exposure','social',ARRAY['instagram','tiktok','youtube','facebook'],'scalar','%',false,70,90,'<=70% video','70-90%','>90%','contentConsumed.videoCount / total','{}',null,'live'),
  ('late-night-activity','Late-Night Activity','Activity & Time','attention_engagement','wellness',ARRAY['instagram','tiktok','youtube'],'scalar','%',false,15,30,'<=15% after 9pm','15-30%','>30%','hourlyDistribution (21-23, 0-5)','{}',null,'live'),
  ('screen-time-distribution','Screen-Time Distribution','Activity & Time','attention_engagement','wellness',ARRAY['instagram','tiktok','youtube'],'scalar','%',false,60,80,'<60% in one period','60-80%','>80%','hourlyDistribution -> periodDistribution','{}',null,'live'),
  ('new-contacts','New Contacts','Social & Connections','social_interaction','social',ARRAY['instagram','tiktok'],'scalar','count',false,5,15,'<=5 new in 30 days','5-15 new','>15 new','following.accounts[].followedAt (recent 30 days)','{}',null,'live'),
  ('search-behavior','Search Activity','Discovery & Interests','content_exposure','social',ARRAY['instagram','tiktok','youtube','facebook'],'scalar','count',false,5,20,'<=5 searches','5-20 searches','>20 searches','searches.total','{}',null,'live'),
  ('binge-sessions','Compulsive Consumption','Activity & Time','attention_engagement','wellness',ARRAY['instagram','tiktok','youtube'],'scalar','count',false,30,50,'Longest session <=30 items','30-50 items','>50 items','contentTimeline[] (ordered timestamps)','{"contentTimeline":2}',null,'live'),
  ('pause-ratio','Recovery Gaps','Activity & Time','wellness','wellness',ARRAY['instagram','tiktok','youtube'],'scalar','%',true,40,20,'>=40% sessions have breaks','20-40%','<20%','contentTimeline[] (gaps within sessions)','{"contentTimeline":2}',null,'live'),
  ('rabbit-hole-depth','Rabbit-Hole Depth','Feed & Algorithm','content_exposure','social',ARRAY['instagram','tiktok','youtube'],'scalar','count',false,5,10,'Max run <=5 same-creator','5-10 consecutive','>10 consecutive','contentTimeline[].owner (consecutive same-owner runs)','{}',null,'live'),
  ('interest-diversity','Interest Diversity','Discovery & Interests','content_exposure','social',ARRAY['instagram','tiktok','youtube','facebook'],'scalar','ratio',true,0.30,0.15,'Ratio >=0.30','0.15-0.30','<0.15','contentTimeline unique owners / total items','{"items":5,"byOwner":1}',null,'live');

-- tier is NULL for all live signals (tier applies to planned/future catalog entries).
