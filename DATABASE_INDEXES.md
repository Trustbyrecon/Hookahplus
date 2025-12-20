# Database Index Recommendations

Based on load testing results, these indexes will significantly improve query performance.

## Priority: HIGH (Immediate Impact)

### Sessions Table

```sql
-- Index for active sessions query (used in availability checks)
CREATE INDEX idx_sessions_state_tableid ON sessions(state, table_id) 
WHERE state NOT IN ('CLOSED', 'CANCELED') AND table_id IS NOT NULL;

-- Index for date range queries (used in analytics)
CREATE INDEX idx_sessions_created_at ON sessions(created_at) 
WHERE table_id IS NOT NULL;

-- Index for table-specific queries
CREATE INDEX idx_sessions_table_id ON sessions(table_id) 
WHERE table_id IS NOT NULL;

-- Composite index for analytics queries
CREATE INDEX idx_sessions_analytics ON sessions(created_at, table_id, price_cents, duration_secs, state)
WHERE table_id IS NOT NULL;
```

### Reservations Table

```sql
-- Index for active reservations lookup
CREATE INDEX idx_reservations_active ON reservations(venue_id, table_id, status, created_at)
WHERE status != 'CANCELLED';

-- Index for time-based reservation checks
CREATE INDEX idx_reservations_time ON reservations(table_id, created_at, window_minutes);
```

## Priority: MEDIUM (Performance Improvement)

### Org Settings Table

```sql
-- Index for layout lookups (if not already indexed)
CREATE INDEX idx_org_settings_key ON org_settings(key);
```

## Implementation Notes

1. **Partial Indexes**: The `WHERE` clauses in the indexes ensure they only index relevant rows, reducing index size and improving performance.

2. **Index Maintenance**: Monitor index usage and size. Consider periodic `VACUUM ANALYZE` for PostgreSQL.

3. **Query Plan Analysis**: After adding indexes, use `EXPLAIN ANALYZE` to verify they're being used.

4. **Migration**: Add these indexes during a maintenance window or use `CREATE INDEX CONCURRENTLY` in PostgreSQL to avoid locking.

## Expected Performance Improvements

- **Table Availability Endpoint**: 60-80% reduction in query time (from ~8.4s to ~1-2s)
- **Analytics Endpoints**: 40-60% reduction in query time
- **Overall**: Significant improvement in concurrent load handling

## Prisma Schema Updates

If using Prisma migrations, add these indexes via raw SQL in a migration:

```typescript
// In a Prisma migration file
export async function up(db: PrismaClient) {
  await db.$executeRaw`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_state_tableid 
    ON sessions(state, table_id) 
    WHERE state NOT IN ('CLOSED', 'CANCELED') AND table_id IS NOT NULL;
  `;
  // ... other indexes
}
```

