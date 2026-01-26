-- Migration: Square raw ingest + normalized tables
-- Date: 2026-01-26

BEGIN;

-- Raw webhook ingest
CREATE TABLE IF NOT EXISTS public.square_events_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  merchant_id TEXT,
  location_id TEXT,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_square_events_raw_merchant_id ON public.square_events_raw(merchant_id);
CREATE INDEX IF NOT EXISTS idx_square_events_raw_event_type ON public.square_events_raw(event_type);
CREATE INDEX IF NOT EXISTS idx_square_events_raw_processed_at ON public.square_events_raw(processed_at);

-- Normalized orders
CREATE TABLE IF NOT EXISTS public.square_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE,
  merchant_id TEXT,
  location_id TEXT,
  status TEXT,
  total_cents INTEGER,
  currency TEXT,
  line_items JSONB,
  raw JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_square_orders_merchant_id ON public.square_orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_square_orders_location_id ON public.square_orders(location_id);
CREATE INDEX IF NOT EXISTS idx_square_orders_status ON public.square_orders(status);

-- Normalized payments
CREATE TABLE IF NOT EXISTS public.square_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT NOT NULL UNIQUE,
  order_id TEXT,
  merchant_id TEXT,
  location_id TEXT,
  status TEXT,
  amount_cents INTEGER,
  currency TEXT,
  card_brand TEXT,
  card_last4 TEXT,
  raw JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_square_payments_merchant_id ON public.square_payments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_square_payments_location_id ON public.square_payments(location_id);
CREATE INDEX IF NOT EXISTS idx_square_payments_status ON public.square_payments(status);

-- Normalized customers
CREATE TABLE IF NOT EXISTS public.square_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL UNIQUE,
  merchant_id TEXT,
  location_id TEXT,
  phone_hash TEXT,
  email_hash TEXT,
  raw JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_square_customers_merchant_id ON public.square_customers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_square_customers_location_id ON public.square_customers(location_id);

COMMIT;

