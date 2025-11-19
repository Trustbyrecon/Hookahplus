-- Migration: Add tenant_id to Existing Tables & Create Payments Table
-- Adds tenant_id column to Session and ReflexEvent tables
-- Creates payments table for payment tracking
-- Agent: Noor (session_agent)
-- Date: 2025-11-18

BEGIN;

-- ============================================================================
-- 1. Add tenant_id to Session Table (idempotent)
-- ============================================================================

ALTER TABLE public."Session"
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;

-- Add index for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_session_tenant_id ON public."Session"(tenant_id) WHERE tenant_id IS NOT NULL;

-- Add comment (idempotent - will update if exists)
COMMENT ON COLUMN public."Session".tenant_id IS 'Tenant/organization that owns this session';

-- ============================================================================
-- 2. Add tenant_id to ReflexEvent Table (events) (idempotent)
-- ============================================================================

ALTER TABLE public.reflex_events
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;

-- Add index for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_reflex_events_tenant_id ON public.reflex_events(tenant_id) WHERE tenant_id IS NOT NULL;

-- Add comment (idempotent - will update if exists)
COMMENT ON COLUMN public.reflex_events.tenant_id IS 'Tenant/organization that owns this event';

-- ============================================================================
-- 3. Create Payments Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES public."Session"(id) ON DELETE SET NULL,
  stripe_charge_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'succeeded', 'failed', 'refunded'
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_session_id ON public.payments(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_stripe_charge_id ON public.payments(stripe_charge_id) WHERE stripe_charge_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON public.payments(paid_at) WHERE paid_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);

COMMENT ON TABLE public.payments IS 'Payment records for sessions (replaces legacy Session.paymentIntent)';
COMMENT ON COLUMN public.payments.tenant_id IS 'Tenant/organization that owns this payment';
COMMENT ON COLUMN public.payments.session_id IS 'Associated session (nullable for standalone payments)';
COMMENT ON COLUMN public.payments.stripe_charge_id IS 'Stripe charge ID (unique)';
COMMENT ON COLUMN public.payments.amount_cents IS 'Payment amount in cents';
COMMENT ON COLUMN public.payments.status IS 'Payment status: pending, succeeded, failed, refunded';

COMMIT;

