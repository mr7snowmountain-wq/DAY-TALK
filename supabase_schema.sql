-- DayTalk — tables préfixées dt_ (partage le même projet Supabase qu'Aliyah)

create table public.dt_profiles (
  id                  uuid references auth.users on delete cascade primary key,
  display_name        text,
  usage_type          text default 'both',
  onboarding_complete boolean default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
alter table public.dt_profiles enable row level security;
create policy "dt_lecture_profil"   on dt_profiles for select using (auth.uid() = id);
create policy "dt_insertion_profil" on dt_profiles for insert with check (auth.uid() = id);
create policy "dt_maj_profil"       on dt_profiles for update using (auth.uid() = id);

create or replace function public.dt_handle_new_user()
returns trigger as $$
begin
  insert into public.dt_profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger dt_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.dt_handle_new_user();

create table public.dt_plannings (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete cascade not null,
  date       date not null default current_date,
  theme      text not null default 'planning',
  tasks      jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date, theme)
);

-- ⚠️ Si la table existe déjà, lancer cette migration dans Supabase SQL Editor :
-- ALTER TABLE public.dt_plannings ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'planning';
-- ALTER TABLE public.dt_plannings DROP CONSTRAINT IF EXISTS dt_plannings_user_id_date_key;
-- CREATE UNIQUE INDEX IF NOT EXISTS dt_plannings_user_id_date_theme_key ON public.dt_plannings(user_id, date, theme);
alter table public.dt_plannings enable row level security;
create policy "dt_lecture_planning"  on dt_plannings for select using (auth.uid() = user_id);
create policy "dt_insert_planning"   on dt_plannings for insert with check (auth.uid() = user_id);
create policy "dt_maj_planning"      on dt_plannings for update using (auth.uid() = user_id);
create policy "dt_del_planning"      on dt_plannings for delete using (auth.uid() = user_id);

create table public.dt_push_subscriptions (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users on delete cascade not null unique,
  subscription jsonb not null,
  updated_at   timestamptz default now()
);
alter table public.dt_push_subscriptions enable row level security;
create policy "dt_lecture_sub"  on dt_push_subscriptions for select using (auth.uid() = user_id);
create policy "dt_insert_sub"   on dt_push_subscriptions for insert with check (auth.uid() = user_id);
create policy "dt_maj_sub"      on dt_push_subscriptions for update using (auth.uid() = user_id);
create policy "dt_del_sub"      on dt_push_subscriptions for delete using (auth.uid() = user_id);
