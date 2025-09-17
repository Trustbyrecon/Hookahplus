-- Stripe webhook idempotency table
-- Run this in Supabase SQL Editor

create table if not exists public.stripe_webhook_events (
  id text primary key,           -- Stripe event id (evt_...)
  type text not null,
  received_at timestamptz not null default now()
);

-- Add index for cleanup queries
create index if not exists idx_stripe_webhook_events_received_at 
on public.stripe_webhook_events(received_at);

-- RLS policy (allow service role to insert)
alter table public.stripe_webhook_events enable row level security;

create policy "Service role can manage webhook events"
on public.stripe_webhook_events
for all
using (auth.role() = 'service_role');
