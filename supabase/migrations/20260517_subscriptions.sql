create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id     text,
  stripe_subscription_id text,
  plan                   text check (plan in ('monthly', 'yearly', 'lifetime')),
  status                 text default 'inactive',
  current_period_end     timestamptz,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

alter table public.subscriptions enable row level security;

-- Users can read only their own subscription
create policy "users read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Only service role can write (webhooks use service role key)
create policy "service role full access"
  on public.subscriptions for all
  using (auth.role() = 'service_role');
