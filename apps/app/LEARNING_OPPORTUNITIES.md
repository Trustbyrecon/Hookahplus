# Learning Opportunities: Gaps Between Expectations and Delivery

**Date:** 2025-11-15  
**Agent:** Noor (session_agent)  
**Context:** Performance testing revealed gaps in connection pool configuration and security hardening

---

## Gap Analysis

### 1. Connection Pool Configuration

**Expectation:**
- System should handle 100 concurrent requests without connection timeouts
- Load tests should show >80% success rate

**Reality:**
- Load tests: 0/10, 0/50, 0/100 success (100% failure)
- Errors: "Timed out fetching a new connection"
- Connection pool exhausted with `connection_limit=15`

**Root Cause:**
- Connection pool size (15) was insufficient for high concurrency (100 requests)
- Pool timeout (5s) was too short for connection acquisition under load
- No retry logic for transient connection failures

**Learning:**
- **Connection Pool Sizing:** `connection_limit` should be sized for peak concurrent requests, not average
  - Formula: `connection_limit >= (peak_concurrent_requests / requests_per_connection_per_second)`
  - For 100 concurrent requests: `connection_limit >= 30` (with 3-4 req/sec per connection)
- **Pool Timeout:** Should account for connection acquisition delays under load
  - Default 5s may be too short during peak load
  - 10s provides buffer for connection pool queue
- **Retry Logic:** Prisma handles connection pooling internally, but application-level retries can help with transient failures

**Fix Applied:**
- Increased `connection_limit`: 15 → **30**
- Increased `pool_timeout`: 5s → **10s**
- Documented connection pool sizing guidelines

---

### 2. Security Hardening

**Expectation:**
- All database functions should pass Supabase Security Advisor checks
- No security warnings in production

**Reality:**
- Security warning: `function_search_path_mutable` for `taxonomy_unknown_upsert`
- Function had mutable `search_path`, creating risk of search_path injection attacks

**Root Cause:**
- Function created without `SET search_path` clause
- PostgreSQL functions with mutable search_path can be exploited if attacker controls search_path

**Learning:**
- **Security Best Practice:** Always set `SET search_path = ''` for functions that use `SECURITY DEFINER`
  - Prevents search_path injection attacks
  - Forces fully qualified table names (`public."TableName"`)
- **Supabase Security Advisor:** Regularly check for security warnings
  - Functions, RLS policies, and table permissions should be reviewed
  - Security warnings should be addressed before production deployment

**Fix Applied:**
- Added `SET search_path = ''` to function definition
- Added `SECURITY DEFINER` for proper privilege handling
- Created migration: `20251115000006_fix_taxonomy_function_security.sql`

---

### 3. Performance Testing Methodology

**Expectation:**
- Performance tests should accurately reflect production behavior
- Load tests should identify bottlenecks before production deployment

**Reality:**
- Performance tests revealed critical connection pool exhaustion
- Tests correctly identified the bottleneck (connection pool size)

**Learning:**
- **Load Testing:** Essential for identifying connection pool sizing issues
  - Test with realistic concurrency levels (10, 50, 100)
  - Monitor connection pool metrics during tests
  - Identify bottlenecks before production deployment
- **Performance Baselines:** Establish performance baselines early
  - Document expected response times
  - Set up monitoring for performance regressions
  - Use performance tests as part of CI/CD pipeline

**Action Items:**
- ✅ Fixed connection pool configuration
- ✅ Added performance test suite
- ⏳ Add connection pool monitoring/metrics
- ⏳ Set up performance regression alerts

---

## Key Takeaways

1. **Connection Pool Sizing:** Size for peak load, not average
   - Use formula: `connection_limit >= peak_concurrent_requests / requests_per_connection`
   - Add buffer (20-30%) for safety margin

2. **Security First:** Address security warnings immediately
   - Use `SET search_path = ''` for all `SECURITY DEFINER` functions
   - Regularly review Supabase Security Advisor warnings

3. **Performance Testing:** Essential for identifying bottlenecks
   - Test with realistic concurrency levels
   - Monitor connection pool metrics
   - Fix issues before production deployment

4. **Documentation:** Document configuration decisions
   - Why connection_limit=30? (100 concurrent requests / 3-4 req/sec = ~30)
   - Why pool_timeout=10? (Buffer for connection acquisition delays)

---

## Next Steps

1. ✅ Apply connection pool fixes
2. ✅ Apply security migration
3. ⏳ Re-run performance tests to verify improvements
4. ⏳ Monitor connection pool metrics in production
5. ⏳ Set up performance regression alerts

---

## Files Created/Modified

1. `apps/app/lib/db.ts` - Simplified PrismaClient configuration
2. `apps/app/scripts/update-database-url-pool.ts` - Updated pool limits
3. `supabase/migrations/20251115000006_fix_taxonomy_function_security.sql` - Security fix
4. `apps/app/FIX_CONNECTION_POOL_AND_SECURITY.md` - Fix documentation
5. `apps/app/LEARNING_OPPORTUNITIES.md` - This document

