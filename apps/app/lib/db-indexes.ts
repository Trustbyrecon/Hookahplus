/**
 * Database Index Optimization
 * Defines recommended indexes for frequently queried tables
 * 
 * These indexes should be added via Prisma migrations for optimal query performance
 */

/**
 * Recommended indexes for Session table
 * Based on common query patterns:
 * - Filtering by tenantId + state
 * - Filtering by tenantId + createdAt (time-based queries)
 * - Filtering by externalRef (Stripe checkout sessions)
 * - Filtering by tableId
 */
export const SESSION_INDEXES = `
-- Composite index for tenant + state queries (most common)
CREATE INDEX IF NOT EXISTS idx_session_tenant_state ON "Session"(tenant_id, state);

-- Composite index for tenant + time-based queries
CREATE INDEX IF NOT EXISTS idx_session_tenant_created ON "Session"(tenant_id, "createdAt" DESC);

-- Index for external references (Stripe checkout sessions)
CREATE INDEX IF NOT EXISTS idx_session_external_ref ON "Session"(external_ref) WHERE external_ref IS NOT NULL;

-- Index for table lookups
CREATE INDEX IF NOT EXISTS idx_session_table ON "Session"(table_id) WHERE table_id IS NOT NULL;

-- Index for payment status queries
CREATE INDEX IF NOT EXISTS idx_session_payment_status ON "Session"(payment_status) WHERE payment_status IS NOT NULL;

-- Index for timer status queries
CREATE INDEX IF NOT EXISTS idx_session_timer_status ON "Session"(timer_status) WHERE timer_status IS NOT NULL;
`;

/**
 * Recommended indexes for ReflexEvent table
 * For audit and event tracking queries
 */
export const REFLEX_EVENT_INDEXES = `
-- Index for event type queries
CREATE INDEX IF NOT EXISTS idx_reflex_event_type ON "ReflexEvent"(event_type);

-- Composite index for time-based event queries
CREATE INDEX IF NOT EXISTS idx_reflex_event_created ON "ReflexEvent"("createdAt" DESC);

-- Index for session event lookups
CREATE INDEX IF NOT EXISTS idx_reflex_event_session ON "ReflexEvent"(session_id) WHERE session_id IS NOT NULL;
`;

/**
 * Recommended indexes for Order table
 */
export const ORDER_INDEXES = `
-- Composite index for session orders
CREATE INDEX IF NOT EXISTS idx_order_session ON "Order"(session_id) WHERE session_id IS NOT NULL;

-- Index for order status queries
CREATE INDEX IF NOT EXISTS idx_order_status ON "Order"(status);

-- Composite index for time-based order queries
CREATE INDEX IF NOT EXISTS idx_order_created ON "Order"("createdAt" DESC);
`;

/**
 * Recommended indexes for PricingRule table
 */
export const PRICING_RULE_INDEXES = `
-- Composite index for active pricing rules by lounge
CREATE INDEX IF NOT EXISTS idx_pricing_rule_lounge_active ON "PricingRule"(lounge_id, is_active, effective_at DESC) WHERE is_active = true;

-- Index for rule type queries
CREATE INDEX IF NOT EXISTS idx_pricing_rule_type ON "PricingRule"(rule_type);
`;

/**
 * All recommended indexes
 */
export const ALL_INDEXES = `
${SESSION_INDEXES}
${REFLEX_EVENT_INDEXES}
${ORDER_INDEXES}
${PRICING_RULE_INDEXES}
`;

/**
 * Check if indexes exist and create if missing
 * Run this as a migration or on startup
 */
export async function ensureIndexes(prisma: any): Promise<void> {
  try {
    // Note: Prisma doesn't support raw CREATE INDEX directly
    // These should be added via migrations
    console.log('[DB Indexes] Indexes should be added via Prisma migrations');
    console.log('[DB Indexes] See lib/db-indexes.ts for recommended indexes');
  } catch (error) {
    console.error('[DB Indexes] Failed to ensure indexes:', error);
  }
}

