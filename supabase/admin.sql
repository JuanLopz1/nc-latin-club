-- Run once in the SQL editor of the club's Supabase Free project.
begin;
create table if not exists public.cms_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','editor'))
);
alter table public.cms_members add column if not exists username text
  check (username ~ '^[a-z0-9][a-z0-9_.-]{2,31}$');
create unique index if not exists cms_members_username_unique
  on public.cms_members (username) where username is not null;
create or replace function public.cms_role() returns text
language sql stable security definer set search_path = ''
as $$ select role from public.cms_members where user_id=auth.uid() $$;
revoke all on function public.cms_role() from public;
grant execute on function public.cms_role() to authenticated;
alter table public.cms_members enable row level security;
drop policy if exists cms_own_membership on public.cms_members;
create policy cms_own_membership on public.cms_members for select to authenticated using (user_id=auth.uid());
revoke all on public.cms_members from anon, authenticated;
grant select on public.cms_members to authenticated;

create table if not exists public.cms_documents (
  key text primary key check (key in ('settings','home','events','culture','places','pages','gallery')),
  draft jsonb not null, published jsonb,
  version integer not null default 0, published_version integer not null default 0,
  updated_at timestamptz not null default now(), updated_by uuid references auth.users(id)
);
alter table public.cms_documents drop constraint if exists cms_documents_key_check;
alter table public.cms_documents add constraint cms_documents_key_check check(key in ('settings','home','events','culture','places','pages','gallery'));
create table if not exists public.cms_history (
  id bigint generated always as identity primary key,
  key text not null, content jsonb not null, action text not null check (action in ('save','publish')),
  version integer not null, created_at timestamptz not null default now(), actor uuid references auth.users(id)
);
create index if not exists cms_history_key_id on public.cms_history(key,id desc);
alter table public.cms_documents enable row level security;
alter table public.cms_history enable row level security;
revoke all on public.cms_documents, public.cms_history from anon, authenticated;
grant select on public.cms_documents, public.cms_history to authenticated;
drop policy if exists cms_documents_editor on public.cms_documents;
drop policy if exists cms_history_editor on public.cms_history;
create policy cms_documents_editor on public.cms_documents for select to authenticated using (public.cms_role() in ('admin','editor'));
create policy cms_history_editor on public.cms_history for select to authenticated using (public.cms_role() in ('admin','editor'));

-- Intentionally exposes only the published projection; never a draft or actor.
create or replace view public.cms_published with (security_barrier=true) as
select key,published as content,published_version from public.cms_documents where published is not null;
revoke all on public.cms_published from public;
grant select on public.cms_published to anon, authenticated;

-- Route namespace for the reviewed fallback used before first publication.
-- Generated from agenda-data.ts; private and immutable to editors.
create table if not exists public.cms_route_defaults (key text primary key, entries jsonb not null);
alter table public.cms_route_defaults enable row level security;
revoke all on public.cms_route_defaults from public, anon, authenticated;
insert into public.cms_route_defaults(key,entries) values
('events','[
{"id":"latin-fiesta-2026","slug":"latin-fiesta-2026"},
{"id":"muertos-niagara","slug":"muertos-niagara-2026"},
{"id":"sunset","slug":"sunset-2026"},
{"id":"welland","slug":"welland-2026"},
{"id":"salsa-niagara","slug":"salsa-niagara-2026"},
{"id":"burlington","slug":"burlington-2026"},
{"id":"salsa-toronto","slug":"salsa-toronto-2026"},
{"id":"panam","slug":"panam-2026"},
{"id":"brazilfest","slug":"brazilfest-2026"},
{"id":"latin-parade","slug":"latin-parade-2026"},
{"id":"lataff","slug":"lataff-2026"},
{"id":"alucine","slug":"alucine-2026"}
]'::jsonb),
('culture','[
{"id":"national-cu-0101-2026","slug":"national-cu-0101-2026"},
{"id":"new-year-2026","slug":"new-year-2026"},
{"id":"national-ht-0101-2026","slug":"national-ht-0101-2026"},
{"id":"reyes-2026","slug":"reyes-2026"},
{"id":"national-bo-0122-2026","slug":"national-bo-0122-2026"},
{"id":"alasita-2026","slug":"alasita-2026"},
{"id":"candelaria-2026","slug":"candelaria-2026"},
{"id":"national-cl-0212-2026","slug":"national-cl-0212-2026"},
{"id":"valentines-2026","slug":"valentines-2026"},
{"id":"mother-language-2026","slug":"mother-language-2026"},
{"id":"national-do-0227-2026","slug":"national-do-0227-2026"},
{"id":"women-2026","slug":"women-2026"},
{"id":"family-bo-0319-2026","slug":"family-bo-0319-2026"},
{"id":"family-hn-0319-2026","slug":"family-hn-0319-2026"},
{"id":"extended-pr-0322-2026","slug":"extended-pr-0322-2026"},
{"id":"national-cr-0411-2026","slug":"national-cr-0411-2026"},
{"id":"americas-2026","slug":"americas-2026"},
{"id":"national-ve-0419-2026","slug":"national-ve-0419-2026"},
{"id":"spanish-2026","slug":"spanish-2026"},
{"id":"labour-2026","slug":"labour-2026"},
{"id":"cinco-mayo-2026","slug":"cinco-mayo-2026"},
{"id":"family-sv-0510-2026","slug":"family-sv-0510-2026"},
{"id":"family-gt-0510-2026","slug":"family-gt-0510-2026"},
{"id":"family-mx-0510-2026","slug":"family-mx-0510-2026"},
{"id":"mothers-second-may-2026","slug":"mothers-second-may-2026"},
{"id":"national-py-0514-2026","slug":"national-py-0514-2026"},
{"id":"national-ht-0518-2026","slug":"national-ht-0518-2026"},
{"id":"national-cu-0520-2026","slug":"national-cu-0520-2026"},
{"id":"cultural-diversity-2026","slug":"cultural-diversity-2026"},
{"id":"national-ec-0524-2026","slug":"national-ec-0524-2026"},
{"id":"national-ar-0525-2026","slug":"national-ar-0525-2026"},
{"id":"extended-gy-0526-2026","slug":"extended-gy-0526-2026"},
{"id":"family-bo-0527-2026","slug":"family-bo-0527-2026"},
{"id":"family-ni-0530-2026","slug":"family-ni-0530-2026"},
{"id":"mothers-last-may-2026","slug":"mothers-last-may-2026"},
{"id":"juninas-2026","slug":"juninas-2026"},
{"id":"national-br-0612-2026","slug":"national-br-0612-2026"},
{"id":"national-py-0612-2026","slug":"national-py-0612-2026"},
{"id":"family-sv-0617-2026","slug":"family-sv-0617-2026"},
{"id":"family-gt-0617-2026","slug":"family-gt-0617-2026"},
{"id":"national-ar-0620-2026","slug":"national-ar-0620-2026"},
{"id":"fathers-third-june-2026","slug":"fathers-third-june-2026"},
{"id":"inti-raymi-2026","slug":"inti-raymi-2026"},
{"id":"san-juan-2026","slug":"san-juan-2026"},
{"id":"national-ve-0705-2026","slug":"national-ve-0705-2026"},
{"id":"national-ar-0709-2026","slug":"national-ar-0709-2026"},
{"id":"national-uy-0718-2026","slug":"national-uy-0718-2026"},
{"id":"national-co-0720-2026","slug":"national-co-0720-2026"},
{"id":"extended-pr-0725-2026","slug":"extended-pr-0725-2026"},
{"id":"afro-women-2026","slug":"afro-women-2026"},
{"id":"national-cu-0726-2026","slug":"national-cu-0726-2026"},
{"id":"national-pe-0728-2026","slug":"national-pe-0728-2026"},
{"id":"pachamama-2026","slug":"pachamama-2026"},
{"id":"national-sv-0806-2026","slug":"national-sv-0806-2026"},
{"id":"national-bo-0806-2026","slug":"national-bo-0806-2026"},
{"id":"national-co-0807-2026","slug":"national-co-0807-2026"},
{"id":"fathers-brazil-2026","slug":"fathers-brazil-2026"},
{"id":"indigenous-2026","slug":"indigenous-2026"},
{"id":"national-ec-0810-2026","slug":"national-ec-0810-2026"},
{"id":"family-cr-0815-2026","slug":"family-cr-0815-2026"},
{"id":"national-do-0816-2026","slug":"national-do-0816-2026"},
{"id":"national-uy-0825-2026","slug":"national-uy-0825-2026"},
{"id":"african-descent-2026","slug":"african-descent-2026"},
{"id":"national-br-0907-2026","slug":"national-br-0907-2026"},
{"id":"national-ni-0914-2026","slug":"national-ni-0914-2026"},
{"id":"national-cr-0915-2026","slug":"national-cr-0915-2026"},
{"id":"national-sv-0915-2026","slug":"national-sv-0915-2026"},
{"id":"national-gt-0915-2026","slug":"national-gt-0915-2026"},
{"id":"national-hn-0915-2026","slug":"national-hn-0915-2026"},
{"id":"national-ni-0915-2026","slug":"national-ni-0915-2026"},
{"id":"national-mx-0916-2026","slug":"national-mx-0916-2026"},
{"id":"national-cl-0918-2026","slug":"national-cl-0918-2026"},
{"id":"amor-amistad-2026","slug":"amor-amistad-2026"},
{"id":"extended-bz-0921-2026","slug":"extended-bz-0921-2026"},
{"id":"extended-pr-0923-2026","slug":"extended-pr-0923-2026"},
{"id":"latin-heritage-2026","slug":"latin-heritage-2026"},
{"id":"national-hn-1003-2026","slug":"national-hn-1003-2026"},
{"id":"national-ec-1009-2026","slug":"national-ec-1009-2026"},
{"id":"national-cu-1010-2026","slug":"national-cu-1010-2026"},
{"id":"oct12-2026","slug":"oct12-2026"},
{"id":"mothers-argentina-2026","slug":"mothers-argentina-2026"},
{"id":"national-gt-1020-2026","slug":"national-gt-1020-2026"},
{"id":"criolla-2026","slug":"criolla-2026"},
{"id":"muertos-2026","slug":"muertos-2026"},
{"id":"all-saints-2026","slug":"all-saints-2026"},
{"id":"difuntos-2026","slug":"difuntos-2026"},
{"id":"national-ec-1103-2026","slug":"national-ec-1103-2026"},
{"id":"national-pa-1103-2026","slug":"national-pa-1103-2026"},
{"id":"national-co-1111-2026","slug":"national-co-1111-2026"},
{"id":"national-br-1115-2026","slug":"national-br-1115-2026"},
{"id":"national-ht-1118-2026","slug":"national-ht-1118-2026"},
{"id":"garifuna-2026","slug":"garifuna-2026"},
{"id":"black-awareness-2026","slug":"black-awareness-2026"},
{"id":"violence-women-2026","slug":"violence-women-2026"},
{"id":"extended-sr-1125-2026","slug":"extended-sr-1125-2026"},
{"id":"merengue-2026","slug":"merengue-2026"},
{"id":"national-pa-1128-2026","slug":"national-pa-1128-2026"},
{"id":"candombe-2026","slug":"candombe-2026"},
{"id":"griteria-2026","slug":"griteria-2026"},
{"id":"velitas-2026","slug":"velitas-2026"},
{"id":"family-pa-1208-2026","slug":"family-pa-1208-2026"},
{"id":"inmaculada-2026","slug":"inmaculada-2026"},
{"id":"tango-2026","slug":"tango-2026"},
{"id":"posadas-2026","slug":"posadas-2026"},
{"id":"migrants-2026","slug":"migrants-2026"},
{"id":"nochebuena-2026","slug":"nochebuena-2026"},
{"id":"navidad-2026","slug":"navidad-2026"},
{"id":"negros-blancos-2026","slug":"negros-blancos-2026"},
{"id":"inocentes-2026","slug":"inocentes-2026"},
{"id":"year-end-2026","slug":"year-end-2026"},
{"id":"national-cu-0101-2027","slug":"national-cu-0101-2027"},
{"id":"new-year-2027","slug":"new-year-2027"},
{"id":"national-ht-0101-2027","slug":"national-ht-0101-2027"},
{"id":"reyes-2027","slug":"reyes-2027"},
{"id":"national-bo-0122-2027","slug":"national-bo-0122-2027"},
{"id":"alasita-2027","slug":"alasita-2027"},
{"id":"candelaria-2027","slug":"candelaria-2027"},
{"id":"barranquilla-2027-2027","slug":"barranquilla-2027-2027"},
{"id":"carnival-2027-2027","slug":"carnival-2027-2027"},
{"id":"national-cl-0212-2027","slug":"national-cl-0212-2027"},
{"id":"valentines-2027","slug":"valentines-2027"},
{"id":"mother-language-2027","slug":"mother-language-2027"},
{"id":"national-do-0227-2027","slug":"national-do-0227-2027"},
{"id":"women-2027","slug":"women-2027"},
{"id":"family-bo-0319-2027","slug":"family-bo-0319-2027"},
{"id":"family-hn-0319-2027","slug":"family-hn-0319-2027"},
{"id":"holy-week-2027-2027","slug":"holy-week-2027-2027"},
{"id":"extended-pr-0322-2027","slug":"extended-pr-0322-2027"},
{"id":"good-friday-2027-2027","slug":"good-friday-2027-2027"},
{"id":"easter-2027-2027","slug":"easter-2027-2027"},
{"id":"national-cr-0411-2027","slug":"national-cr-0411-2027"},
{"id":"americas-2027","slug":"americas-2027"},
{"id":"national-ve-0419-2027","slug":"national-ve-0419-2027"},
{"id":"spanish-2027","slug":"spanish-2027"},
{"id":"labour-2027","slug":"labour-2027"},
{"id":"cinco-mayo-2027","slug":"cinco-mayo-2027"},
{"id":"mothers-second-may-2027","slug":"mothers-second-may-2027"},
{"id":"family-sv-0510-2027","slug":"family-sv-0510-2027"},
{"id":"family-gt-0510-2027","slug":"family-gt-0510-2027"},
{"id":"family-mx-0510-2027","slug":"family-mx-0510-2027"},
{"id":"national-py-0514-2027","slug":"national-py-0514-2027"},
{"id":"national-ht-0518-2027","slug":"national-ht-0518-2027"},
{"id":"national-cu-0520-2027","slug":"national-cu-0520-2027"},
{"id":"cultural-diversity-2027","slug":"cultural-diversity-2027"},
{"id":"national-ec-0524-2027","slug":"national-ec-0524-2027"},
{"id":"national-ar-0525-2027","slug":"national-ar-0525-2027"},
{"id":"extended-gy-0526-2027","slug":"extended-gy-0526-2027"},
{"id":"family-bo-0527-2027","slug":"family-bo-0527-2027"},
{"id":"mothers-last-may-2027","slug":"mothers-last-may-2027"},
{"id":"family-ni-0530-2027","slug":"family-ni-0530-2027"},
{"id":"juninas-2027","slug":"juninas-2027"},
{"id":"national-br-0612-2027","slug":"national-br-0612-2027"},
{"id":"national-py-0612-2027","slug":"national-py-0612-2027"},
{"id":"family-sv-0617-2027","slug":"family-sv-0617-2027"},
{"id":"family-gt-0617-2027","slug":"family-gt-0617-2027"},
{"id":"national-ar-0620-2027","slug":"national-ar-0620-2027"},
{"id":"fathers-third-june-2027","slug":"fathers-third-june-2027"},
{"id":"inti-raymi-2027","slug":"inti-raymi-2027"},
{"id":"san-juan-2027","slug":"san-juan-2027"},
{"id":"national-ve-0705-2027","slug":"national-ve-0705-2027"},
{"id":"national-ar-0709-2027","slug":"national-ar-0709-2027"},
{"id":"national-uy-0718-2027","slug":"national-uy-0718-2027"},
{"id":"national-co-0720-2027","slug":"national-co-0720-2027"},
{"id":"extended-pr-0725-2027","slug":"extended-pr-0725-2027"},
{"id":"afro-women-2027","slug":"afro-women-2027"},
{"id":"national-cu-0726-2027","slug":"national-cu-0726-2027"},
{"id":"national-pe-0728-2027","slug":"national-pe-0728-2027"},
{"id":"pachamama-2027","slug":"pachamama-2027"},
{"id":"national-sv-0806-2027","slug":"national-sv-0806-2027"},
{"id":"national-bo-0806-2027","slug":"national-bo-0806-2027"},
{"id":"national-co-0807-2027","slug":"national-co-0807-2027"},
{"id":"fathers-brazil-2027","slug":"fathers-brazil-2027"},
{"id":"indigenous-2027","slug":"indigenous-2027"},
{"id":"national-ec-0810-2027","slug":"national-ec-0810-2027"},
{"id":"family-cr-0815-2027","slug":"family-cr-0815-2027"},
{"id":"national-do-0816-2027","slug":"national-do-0816-2027"},
{"id":"national-uy-0825-2027","slug":"national-uy-0825-2027"},
{"id":"african-descent-2027","slug":"african-descent-2027"},
{"id":"national-br-0907-2027","slug":"national-br-0907-2027"},
{"id":"national-ni-0914-2027","slug":"national-ni-0914-2027"},
{"id":"national-cr-0915-2027","slug":"national-cr-0915-2027"},
{"id":"national-sv-0915-2027","slug":"national-sv-0915-2027"},
{"id":"national-gt-0915-2027","slug":"national-gt-0915-2027"},
{"id":"national-hn-0915-2027","slug":"national-hn-0915-2027"},
{"id":"national-ni-0915-2027","slug":"national-ni-0915-2027"},
{"id":"national-mx-0916-2027","slug":"national-mx-0916-2027"},
{"id":"amor-amistad-2027","slug":"amor-amistad-2027"},
{"id":"national-cl-0918-2027","slug":"national-cl-0918-2027"},
{"id":"extended-bz-0921-2027","slug":"extended-bz-0921-2027"},
{"id":"extended-pr-0923-2027","slug":"extended-pr-0923-2027"},
{"id":"latin-heritage-2027","slug":"latin-heritage-2027"},
{"id":"national-hn-1003-2027","slug":"national-hn-1003-2027"},
{"id":"national-ec-1009-2027","slug":"national-ec-1009-2027"},
{"id":"national-cu-1010-2027","slug":"national-cu-1010-2027"},
{"id":"oct12-2027","slug":"oct12-2027"},
{"id":"mothers-argentina-2027","slug":"mothers-argentina-2027"},
{"id":"national-gt-1020-2027","slug":"national-gt-1020-2027"},
{"id":"criolla-2027","slug":"criolla-2027"},
{"id":"muertos-2027","slug":"muertos-2027"},
{"id":"all-saints-2027","slug":"all-saints-2027"},
{"id":"difuntos-2027","slug":"difuntos-2027"},
{"id":"national-ec-1103-2027","slug":"national-ec-1103-2027"},
{"id":"national-pa-1103-2027","slug":"national-pa-1103-2027"},
{"id":"national-co-1111-2027","slug":"national-co-1111-2027"},
{"id":"national-br-1115-2027","slug":"national-br-1115-2027"},
{"id":"national-ht-1118-2027","slug":"national-ht-1118-2027"},
{"id":"garifuna-2027","slug":"garifuna-2027"},
{"id":"black-awareness-2027","slug":"black-awareness-2027"},
{"id":"violence-women-2027","slug":"violence-women-2027"},
{"id":"extended-sr-1125-2027","slug":"extended-sr-1125-2027"},
{"id":"merengue-2027","slug":"merengue-2027"},
{"id":"national-pa-1128-2027","slug":"national-pa-1128-2027"},
{"id":"candombe-2027","slug":"candombe-2027"},
{"id":"griteria-2027","slug":"griteria-2027"},
{"id":"velitas-2027","slug":"velitas-2027"},
{"id":"family-pa-1208-2027","slug":"family-pa-1208-2027"},
{"id":"inmaculada-2027","slug":"inmaculada-2027"},
{"id":"tango-2027","slug":"tango-2027"},
{"id":"posadas-2027","slug":"posadas-2027"},
{"id":"migrants-2027","slug":"migrants-2027"},
{"id":"nochebuena-2027","slug":"nochebuena-2027"},
{"id":"navidad-2027","slug":"navidad-2027"},
{"id":"negros-blancos-2027","slug":"negros-blancos-2027"},
{"id":"inocentes-2027","slug":"inocentes-2027"},
{"id":"year-end-2027","slug":"year-end-2027"}
]'::jsonb)
on conflict(key) do update set entries=excluded.entries;

create or replace function public.cms_write(p_key text,p_content jsonb,p_version integer,p_publish boolean)
returns setof public.cms_documents
language plpgsql security definer set search_path = '' as $$
declare current_version integer; next_version integer; user_role text; other_entries jsonb;
begin
  user_role := public.cms_role();
  if auth.uid() is null or user_role is null or (p_publish and user_role <> 'admin') then
    raise insufficient_privilege using message='Editorial permission required';
  end if;
  if p_key is null or p_key not in ('settings','home','events','culture','places','pages','gallery') or p_version is null or p_publish is null or p_version<0 or p_content is null or pg_catalog.octet_length(p_content::text)>1600000 then
    raise check_violation using message='Invalid document';
  end if;
  if pg_catalog.jsonb_typeof(p_content) <> (case when p_key in ('settings','home','gallery') then 'object' else 'array' end) then
    raise check_violation using message='Invalid document shape';
  end if;
  -- Both collections share /events/[slug]. Serialize their publications together.
  if p_publish and p_key in ('events','culture') then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('cms-agenda-namespace',0));
    select coalesce(
      (select published from public.cms_documents where key=(case when p_key='events' then 'culture' else 'events' end)),
      (select entries from public.cms_route_defaults where key=(case when p_key='events' then 'culture' else 'events' end)),
      '[]'::jsonb) into other_entries;
    if exists(select 1 from pg_catalog.jsonb_array_elements(p_content) as incoming, pg_catalog.jsonb_array_elements(other_entries) as other
      where incoming->>'slug'=other->>'slug' or incoming->>'id'=other->>'id') then
      raise check_violation using message='Duplicate agenda identifier or URL';
    end if;
  end if;
  -- Also serialize the first insert; two tabs with revision zero cannot both win.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_key,0));
  select version into current_version from public.cms_documents where key=p_key for update;
  current_version := coalesce(current_version,0);
  if current_version <> p_version then raise serialization_failure using message='Content revision conflict'; end if;
  next_version := current_version+1;
  insert into public.cms_documents(key,draft,published,version,published_version,updated_by)
  values(p_key,p_content,case when p_publish then p_content else null end,next_version,case when p_publish then next_version else 0 end,auth.uid())
  on conflict (key) do update set draft=p_content,
    published=case when p_publish then p_content else cms_documents.published end,
    version=next_version,published_version=case when p_publish then next_version else cms_documents.published_version end,
    updated_at=now(),updated_by=auth.uid();
  insert into public.cms_history(key,content,action,version,actor) values(p_key,p_content,case when p_publish then 'publish' else 'save' end,next_version,auth.uid());
  return query select * from public.cms_documents where key=p_key;
end $$;
revoke all on function public.cms_write(text,jsonb,integer,boolean) from public;
grant execute on function public.cms_write(text,jsonb,integer,boolean) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('club-media','club-media',false,3145728,array['image/webp'])
on conflict(id) do update set public=false,file_size_limit=3145728,allowed_mime_types=array['image/webp'];
-- No anonymous/authenticated storage policies. Only the server can upload/read;
-- the app checks editorial access or an exact published reference before delivery.
create table if not exists public.photo_submissions (
  id uuid primary key, fingerprint text not null check(fingerprint ~ '^[a-f0-9]{64}$'),
  photos jsonb not null default '[]',
  status text not null default 'uploading' check(status in ('uploading','pending','approved','rejected','failed')),
  consent_at timestamptz, consent_version text,
  created_at timestamptz not null default now(), reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);
alter table public.photo_submissions add column if not exists uploads jsonb not null default '[]';
alter table public.photo_submissions add column if not exists uploads_cleared boolean not null default false;
create index if not exists photo_submissions_queue on public.photo_submissions(status,created_at desc);
create index if not exists photo_submissions_rate on public.photo_submissions(fingerprint,created_at desc);
alter table public.photo_submissions enable row level security;
revoke all on public.photo_submissions from public,anon,authenticated;
grant select(id,photos,status,created_at) on public.photo_submissions to authenticated;
grant select,insert,update,delete on public.photo_submissions to service_role;
drop policy if exists photo_submissions_editors on public.photo_submissions;
create policy photo_submissions_editors on public.photo_submissions for select to authenticated using(public.cms_role() in ('admin','editor'));

create or replace function public.gallery_reserve(p_id uuid,p_fingerprint text)
returns uuid language plpgsql security definer set search_path='' as $$
begin
  if p_id is null or p_fingerprint is null or p_fingerprint !~ '^[a-f0-9]{64}$' then raise check_violation using message='Invalid request'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('gallery-submission-quota',0));
  update public.photo_submissions set status='failed' where status='uploading' and created_at<now()-interval '1 hour';
  if (select count(*) from public.photo_submissions where fingerprint=p_fingerprint and created_at>now()-interval '1 hour')>=3
    or (select count(*) from public.photo_submissions where created_at>now()-interval '24 hours')>=60
    or (select count(*) from public.photo_submissions where status in ('pending','uploading'))>=160
    or (select count(*) from public.photo_submissions where status<>'approved' and not uploads_cleared)>=16 then
    raise exception 'Submission limit reached' using errcode='P0001';
  end if;
  insert into public.photo_submissions(id,fingerprint) values(p_id,p_fingerprint);
  return p_id;
end $$;
revoke all on function public.gallery_reserve(uuid,text) from public,anon,authenticated;
grant execute on function public.gallery_reserve(uuid,text) to service_role;

create or replace function public.gallery_finish(p_id uuid,p_photos jsonb,p_consent boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
  if p_consent is distinct from true or p_photos is null or pg_catalog.jsonb_typeof(p_photos)<>'array' then raise check_violation using message='Consent and photos required'; end if;
  if pg_catalog.jsonb_array_length(p_photos) not between 1 and 8 or pg_catalog.octet_length(p_photos::text)>20000 then raise check_violation using message='Invalid photos'; end if;
  if exists(select 1 from pg_catalog.jsonb_array_elements(p_photos) p where
    coalesce(p->>'id','') !~ '^[a-z0-9-]{1,80}$' or
    coalesce(p#>>'{image,src}','') !~ '^/api/media/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$' or
    coalesce(p#>>'{image,alt,en}','')='' or coalesce(p#>>'{image,alt,es}','')='' or
    coalesce(p#>>'{caption,en}','')='' or coalesce(p#>>'{caption,es}','')='' or
    coalesce(p->>'album','')='' or length(p->>'album')>80) then raise check_violation using message='Invalid photo fields'; end if;
  update public.photo_submissions set photos=p_photos,status='pending',consent_at=now(),consent_version='photo-permission-v1'
    where id=p_id and status='uploading';
  if not found and not exists(select 1 from public.photo_submissions where id=p_id and status in ('pending','approved','rejected') and photos=p_photos) then raise check_violation using message='Request already resolved'; end if;
end $$;
revoke all on function public.gallery_finish(uuid,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.gallery_finish(uuid,jsonb,boolean) to service_role;

create or replace function public.gallery_moderate(p_id uuid,p_action text,p_version integer)
returns setof public.cms_documents language plpgsql security definer set search_path='' as $$
declare incoming jsonb; current_draft jsonb; current_version integer;
begin
  if auth.uid() is null or public.cms_role() is null then raise insufficient_privilege using message='Editorial permission required'; end if;
  if p_id is null or p_action is null or p_action not in ('approve','reject') or p_version is null or p_version<0 then raise check_violation using message='Invalid moderation'; end if;
  -- Same lock as saving/publishing: moderation cannot overwrite another editor.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('gallery',0));
  select photos into incoming from public.photo_submissions where id=p_id and status='pending' for update;
  if not found then raise check_violation using message='Submission already resolved'; end if;
  select draft,version into current_draft,current_version from public.cms_documents where key='gallery';
  current_version:=coalesce(current_version,0);
  if current_version<>p_version then raise serialization_failure using message='Content revision conflict'; end if;
  if p_action='approve' then
    if current_draft is null or pg_catalog.jsonb_typeof(current_draft->'photos')<>'array' or current_draft->'photos' is null then raise check_violation using message='Save the gallery draft first'; end if;
    if pg_catalog.jsonb_array_length(current_draft->'photos')+pg_catalog.jsonb_array_length(incoming)>600 then raise check_violation using message='Gallery photo limit reached'; end if;
    if exists(select 1 from pg_catalog.jsonb_array_elements(incoming) n, pg_catalog.jsonb_array_elements(current_draft->'photos') old where n->>'id'=old->>'id') then raise check_violation using message='Photo identifier already exists'; end if;
    current_draft:=pg_catalog.jsonb_set(current_draft,'{photos}',(current_draft->'photos')||incoming);
    perform public.cms_write('gallery',current_draft,current_version,false);
  end if;
  update public.photo_submissions set status=case when p_action='approve' then 'approved' else 'rejected' end,reviewed_by=auth.uid(),reviewed_at=now() where id=p_id;
  return query select * from public.cms_documents where key='gallery';
end $$;
revoke all on function public.gallery_moderate(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.gallery_moderate(uuid,text,integer) to authenticated;

-- Register immutable slots before writing Storage, including abandoned uploads.
create or replace function public.gallery_claim_slot(p_id uuid,p_slot integer,p_media_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare registered jsonb; previous uuid;
begin
 if p_slot is null or p_slot not between 0 and 7 or p_media_id is null then raise check_violation using message='Invalid photo slot'; end if;
 select uploads into registered from public.photo_submissions where id=p_id and status='uploading' and created_at>now()-interval '1 hour' for update;
 if not found then raise check_violation using message='Upload session expired'; end if;
 select (item->>'media_id')::uuid into previous from pg_catalog.jsonb_array_elements(registered) item where (item->>'slot')::integer=p_slot;
 if previous is not null then return previous; end if;
 update public.photo_submissions set uploads=uploads||pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('slot',p_slot,'media_id',p_media_id)) where id=p_id;
 return p_media_id;
end $$;
revoke all on function public.gallery_claim_slot(uuid,integer,uuid) from public,anon,authenticated;
grant execute on function public.gallery_claim_slot(uuid,integer,uuid) to service_role;

create or replace function public.gallery_cleanup_candidates()
returns table(id uuid,uploads jsonb) language plpgsql security definer set search_path='' as $$
begin
 update public.photo_submissions set status='failed' where status='uploading' and created_at<now()-interval '1 hour';
 return query select s.id,s.uploads from public.photo_submissions s where not s.uploads_cleared
   and (s.status='failed' and s.created_at<now()-interval '1 hour' or s.status='rejected' and s.reviewed_at<now()-interval '7 days')
   and not exists(select 1 from public.cms_documents d,pg_catalog.jsonb_array_elements(s.uploads) u where
     pg_catalog.strpos(d.draft::text,'"/api/media/'||(u->>'media_id')||'"')>0 or pg_catalog.strpos(coalesce(d.published::text,''),'"/api/media/'||(u->>'media_id')||'"')>0)
   and not exists(select 1 from public.cms_history h,pg_catalog.jsonb_array_elements(s.uploads) u where pg_catalog.strpos(h.content::text,'"/api/media/'||(u->>'media_id')||'"')>0)
   order by s.created_at limit 8;
end $$;
revoke all on function public.gallery_cleanup_candidates() from public,anon,authenticated;
grant execute on function public.gallery_cleanup_candidates() to service_role;

create or replace function public.gallery_clear_uploads(p_id uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 update public.photo_submissions set uploads_cleared=true where id=p_id and status in ('failed','rejected');
end $$;
revoke all on function public.gallery_clear_uploads(uuid) from public,anon,authenticated;
grant execute on function public.gallery_clear_uploads(uuid) to service_role;
commit;

-- Create the initial user in Authentication > Users, then run separately:
-- insert into public.cms_members(user_id,role)
-- select id,'admin' from auth.users where lower(email)=lower('YOUR_EMAIL_HERE')
-- on conflict(user_id) do update set role=excluded.role;
