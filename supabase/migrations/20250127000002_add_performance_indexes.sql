-- Migration: Add Performance Indexes
-- Date: 2025-01-27
-- Purpose: Optimize frequently queried tables for better performance

BEGIN;

-- ============================================================================
-- Session Table Indexes
-- ============================================================================

-- Composite index for tenant + state queries (most common pattern)
CREATE INDEX IF NOT EXISTS idx_session_tenant_state 
  ON "Session"("tenant_id", state)
  WHERE "tenant_id" IS NOT NULL;

-- Composite index for tenant + time-based queries
CREATE INDEX IF NOT EXISTS idx_session_tenant_created 
  ON "Session"("tenant_id", "createdAt" DESC)
  WHERE "tenant_id" IS NOT NULL;

-- Index for external references (Stripe checkout sessions)
CREATE INDEX IF NOT EXISTS idx_session_external_ref 
  ON "Session"("externalRef") 
  WHERE "externalRef" IS NOT NULL;

-- Index for table lookups
CREATE INDEX IF NOT EXISTS idx_session_table 
  ON "Session"("tableId") 
  WHERE "tableId" IS NOT NULL;

-- Index for payment status queries
CREATE INDEX IF NOT EXISTS idx_session_payment_status 
  ON "Session"("paymentStatus") 
  WHERE "paymentStatus" IS NOT NULL;

-- Index for timer status queries
CREATE INDEX IF NOT EXISTS idx_session_timer_status 
  ON "Session"("timerStatus") 
  WHERE "timerStatus" IS NOT NULL;

-- ============================================================================
-- reflex_events Table Indexes (if table exists)
-- Note: Table name is reflex_events (snake_case), not ReflexEvent
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reflex_events') THEN
    -- Index for event type queries
    CREATE INDEX IF NOT EXISTS idx_reflex_events_type 
      ON public.reflex_events(type)
      WHERE type IS NOT NULL;

    -- Composite index for time-based event queries
    CREATE INDEX IF NOT EXISTS idx_reflex_events_created 
      ON public.reflex_events("createdAt" DESC);

    -- Index for session event lookups
    CREATE INDEX IF NOT EXISTS idx_reflex_events_session 
      ON public.reflex_events("sessionId") 
      WHERE "sessionId" IS NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- Order Table Indexes (if table exists)
-- ============================================================================

DO $$
BEGIN
  -- Check for Order table (PascalCase) or orders table (snake_case)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Order') THEN
    -- Composite index for session orders
    CREATE INDEX IF NOT EXISTS idx_order_session 
      ON "Order"("sessionId") 
      WHERE "sessionId" IS NOT NULL;

    -- Index for order status queries
    CREATE INDEX IF NOT EXISTS idx_order_status 
      ON "Order"(status) 
      WHERE status IS NOT NULL;

    -- Composite index for time-based order queries
    CREATE INDEX IF NOT EXISTS idx_order_created 
      ON "Order"("createdAt" DESC);
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    -- Composite index for session orders (snake_case table)
    CREATE INDEX IF NOT EXISTS idx_orders_session 
      ON public.orders(session_id) 
      WHERE session_id IS NOT NULL;

    -- Index for order status queries
    CREATE INDEX IF NOT EXISTS idx_orders_status 
      ON public.orders(status) 
      WHERE status IS NOT NULL;

    -- Composite index for time-based order queries
    CREATE INDEX IF NOT EXISTS idx_orders_created 
      ON public.orders(created_at DESC);
  END IF;
END $$;

-- ============================================================================
-- PricingRule Table Indexes (if table exists)
-- ============================================================================

DO $$
BEGIN
  -- Check for PricingRule table (PascalCase) or pricing_rules table (snake_case)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'PricingRule') THEN
    -- Composite index for active pricing rules by lounge
    CREATE INDEX IF NOT EXISTS idx_pricing_rule_lounge_active 
      ON "PricingRule"("loungeId", "isActive", "effectiveAt" DESC) 
      WHERE "isActive" = true;

    -- Index for rule type queries
    CREATE INDEX IF NOT EXISTS idx_pricing_rule_type 
      ON "PricingRule"("ruleType") 
      WHERE "ruleType" IS NOT NULL;
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pricing_rules') THEN
    -- Composite index for active pricing rules by lounge (snake_case table)
    CREATE INDEX IF NOT EXISTS idx_pricing_rules_lounge_active 
      ON public.pricing_rules(lounge_id, is_active, effective_at DESC) 
      WHERE is_active = true;

    -- Index for rule type queries
    CREATE INDEX IF NOT EXISTS idx_pricing_rules_type 
      ON public.pricing_rules(rule_type) 
      WHERE rule_type IS NOT NULL;
  END IF;
END $$;

COMMIT;

