-- HookahPlus MVP Schema with RLS
-- Run this in Supabase SQL Editor

-- venues & staff (multi-tenant)
create table venues(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table staff(
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  role text check (role in ('FOH','BOH','MANAGER')) not null,
  email text unique,
  created_at timestamptz default now()
);

-- sessions (core)
create type session_status as enum ('PENDING','ACTIVE','PAUSED','COMPLETE','STAFF_HOLD','STOCK_BLOCKED');
create table sessions(
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  table_id text not null,
  tier text not null,                    -- base|premium|vip
  flavors text[] default '{}',
  status session_status default 'PENDING',
  started_at timestamptz,
  ends_at timestamptz,
  price_lookup_key text,                 -- e.g., price_hookah_session_base
  payment_intent_id text,
  checkout_session_id text,
  created_by uuid references staff(id),
  created_at timestamptz default now()
);

-- refills
create table refills(
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  requested_at timestamptz default now(),
  completed_at timestamptz
);

-- reservations (auth-only $10 hold)
create type res_status as enum ('HOLD','ARRIVED','NO_SHOW','CANCELLED');
create table reservations(
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  table_id text not null,
  status res_status default 'HOLD',
  payment_intent_id text,  -- capture_method=manual
  hold_amount_cents int default 1000,
  window_minutes int default 15,
  created_at timestamptz default now()
);

-- audit
create table ghostlog(
  id bigserial primary key,
  venue_id uuid,
  session_id uuid,
  actor text,                            -- staff_x | system
  event text,
  meta jsonb,
  created_at timestamptz default now()
);

-- RLS (very simple: per-venue isolation)
alter table venues enable row level security;
alter table staff enable row level security;
alter table sessions enable row level security;
alter table refills enable row level security;
alter table reservations enable row level security;
alter table ghostlog enable row level security;

-- assume jwt includes claim 'venue_id'
create policy "venue read/write"
on sessions for all
using (venue_id = current_setting('request.jwt.claims', true)::jsonb->>'venue_id')
with check (venue_id = current_setting('request.jwt.claims', true)::jsonb->>'venue_id');

create policy "venue read/write refills"
on refills for all
using (venue_id = current_setting('request.jwt.claims', true)::jsonb->>'venue_id')
with check (venue_id = current_setting('request.jwt.claims', true)::jsonb->>'venue_id');

create policy "venue read/write reservations"
on reservations for all
using (venue_id = current_setting('request.jwt.claims', true)::jsonb->>'venue_id')
with check (venue_id = current_setting('request.jwt.claims', true)::jsonb->>'venue_id');

create policy "venue write ghostlog"
on ghostlog for insert
with check (venue_id = current_setting('request.jwt.claims', true)::jsonb->>'venue_id');

-- Indexes for performance
create index idx_sessions_venue_status on sessions(venue_id, status);
create index idx_sessions_table on sessions(table_id);
create index idx_refills_session on refills(session_id);
create index idx_reservations_venue on reservations(venue_id);
create index idx_ghostlog_venue on ghostlog(venue_id);

-- Insert sample venue for testing
insert into venues (id, name) values 
  ('550e8400-e29b-41d4-a716-446655440000', 'HookahPlus Demo Venue');

-- Insert sample staff
insert into staff (venue_id, role, email) values 
  ('550e8400-e29b-41d4-a716-446655440000', 'MANAGER', 'manager@hookahplus.net'),
  ('550e8400-e29b-41d4-a716-446655440000', 'FOH', 'foh@hookahplus.net'),
  ('550e8400-e29b-41d4-a716-446655440000', 'BOH', 'boh@hookahplus.net');
