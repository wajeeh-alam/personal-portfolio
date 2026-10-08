-- Run this migration in the Supabase SQL editor or with the Supabase CLI.
-- The RPC updates the counter atomically and is the only write exposed to visitors.

create table if not exists public.page_likes (
  slug text primary key,
  like_count integer not null default 0 check (like_count >= 0),
  updated_at timestamptz not null default now()
);

insert into public.page_likes (slug, like_count)
values ('portfolio', 0)
on conflict (slug) do nothing;

alter table public.page_likes enable row level security;

drop policy if exists "Anyone can read portfolio likes" on public.page_likes;
create policy "Anyone can read portfolio likes"
  on public.page_likes for select
  to anon, authenticated
  using (slug = 'portfolio');

create or replace function public.increment_portfolio_likes()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_count integer;
begin
  update public.page_likes
  set like_count = like_count + 1,
      updated_at = now()
  where slug = 'portfolio'
  returning like_count into next_count;

  return coalesce(next_count, 0);
end;
$$;

revoke all on function public.increment_portfolio_likes() from public;
grant execute on function public.increment_portfolio_likes() to anon, authenticated;
