-- ═══════════════════════════════════════════════════════
-- DISApline Database Schema
-- Run this in your Supabase SQL editor
-- ═══════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text,
  full_name   text,
  avatar_url  text,
  timezone    text default 'UTC',
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── TRADING RULES ──────────────────────────────────────
create table public.rules (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  title       text not null,
  description text,
  category    text check (category in ('entry','exit','risk','psychology','other')) default 'other',
  is_active   boolean default true,
  created_at  timestamptz default now()
);

alter table public.rules enable row level security;
create policy "Users manage own rules" on public.rules for all using (auth.uid() = user_id);

-- ─── TRADES ─────────────────────────────────────────────
create table public.trades (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  symbol          text not null,
  direction       text check (direction in ('long','short')) not null,
  asset_class     text check (asset_class in ('stocks','futures','forex','crypto','options','other')) default 'stocks',
  entry_price     numeric(18,6) not null,
  exit_price      numeric(18,6),
  quantity        numeric(18,4) not null,
  entry_at        timestamptz not null,
  exit_at         timestamptz,
  pnl             numeric(18,2),
  pnl_percent     numeric(10,4),
  commission      numeric(10,2) default 0,
  setup           text,                        -- setup/pattern name
  timeframe       text,                        -- chart timeframe used
  notes           text,
  screenshot_url  text,
  status          text check (status in ('open','closed')) default 'open',
  -- broker sync fields (v2)
  broker_id       text,
  broker_trade_id text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.trades enable row level security;
create policy "Users manage own trades" on public.trades for all using (auth.uid() = user_id);

create index idx_trades_user_id on public.trades(user_id);
create index idx_trades_entry_at on public.trades(entry_at desc);

-- ─── CHECK-INS (pre/post trade psychology) ──────────────
create table public.check_ins (
  id              uuid default uuid_generate_v4() primary key,
  trade_id        uuid references public.trades(id) on delete cascade not null,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  type            text check (type in ('pre','post')) not null,

  -- Emotional state (1-5 scale)
  mood            int check (mood between 1 and 5),
  confidence      int check (confidence between 1 and 5),
  stress          int check (stress between 1 and 5),
  focus           int check (focus between 1 and 5),

  -- Rule adherence
  followed_rules  boolean,
  broken_rule_ids uuid[],               -- which rules were broken
  rule_break_note text,

  -- Behavioral flags (detected at check-in time)
  flags           text[],               -- e.g. ['revenge_trade','fomo','oversize']

  -- Free-form
  reason          text,                 -- "why did you take this trade?"
  lesson          text,                 -- post only: "what did you learn?"

  created_at      timestamptz default now()
);

alter table public.check_ins enable row level security;
create policy "Users manage own check_ins" on public.check_ins for all using (auth.uid() = user_id);

create index idx_checkins_trade_id on public.check_ins(trade_id);
create index idx_checkins_user_id on public.check_ins(user_id);

-- ─── JOURNAL ENTRIES ────────────────────────────────────
create table public.journal_entries (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  date       date not null,
  content    text not null,
  mood       int check (mood between 1 and 5),
  tags       text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.journal_entries enable row level security;
create policy "Users manage own journal" on public.journal_entries for all using (auth.uid() = user_id);

-- ─── PSYCH SCORES (daily computed) ──────────────────────
create table public.psych_scores (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid references public.profiles(id) on delete cascade not null,
  date             date not null,
  emotion_score    numeric(5,2),       -- 0-100
  discipline_score numeric(5,2),       -- 0-100
  bias_score       numeric(5,2),       -- 0-100
  overall_score    numeric(5,2),       -- weighted average
  trade_count      int default 0,
  created_at       timestamptz default now(),
  unique (user_id, date)
);

alter table public.psych_scores enable row level security;
create policy "Users view own scores" on public.psych_scores for all using (auth.uid() = user_id);

-- ─── DETECTED PATTERNS ──────────────────────────────────
create table public.patterns (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  type         text not null,          -- 'revenge_trade','fomo','loss_aversion','anchoring', etc.
  severity     text check (severity in ('low','medium','high')) default 'medium',
  trade_ids    uuid[],                 -- trades that contributed to this pattern
  description  text not null,          -- human-readable insight
  pnl_impact   numeric(10,2),          -- estimated $ impact
  detected_at  timestamptz default now(),
  is_active    boolean default true
);

alter table public.patterns enable row level security;
create policy "Users view own patterns" on public.patterns for all using (auth.uid() = user_id);

create index idx_patterns_user_id on public.patterns(user_id);
