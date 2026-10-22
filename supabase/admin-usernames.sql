-- Existing projects: run this migration before using username sign-in.
begin;
alter table public.cms_members add column if not exists username text
  check (username ~ '^[a-z0-9][a-z0-9_.-]{2,31}$');
create unique index if not exists cms_members_username_unique
  on public.cms_members (username) where username is not null;
commit;
