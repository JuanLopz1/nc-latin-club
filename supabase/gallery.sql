-- NC Latin Club: additive photo library upgrade. Run in the same Supabase SQL editor.
-- Safe to rerun; existing content, users, drafts and published versions are preserved.
begin;
alter table public.cms_documents drop constraint if exists cms_documents_key_check;
alter table public.cms_documents add constraint cms_documents_key_check
  check(key in ('settings','home','events','culture','places','pages','gallery'));
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
