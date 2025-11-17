-- Verification queries for security fixes
-- Run these after executing 20251116000001_fix_rls_performance_and_duplicate_indexes.sql

-- ============================================================================
-- 1. Verify indexes on reflex_events (should only see camelCase versions)
-- ============================================================================
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'reflex_events'
  AND indexname LIKE 'idx_reflex_events%'
ORDER BY indexname;

-- Expected results:
-- - idx_reflex_events_campaignId
-- - idx_reflex_events_ctaSource
-- - idx_reflex_events_ctaType
-- - idx_reflex_events_type_createdAt
-- - (plus any other indexes like payloadHash, sessionId if they exist)
-- Should NOT see: campaign_id, cta_source, cta_type, type_created_at (snake_case)

-- ============================================================================
-- 2. Verify policies on reflex_events (should only see one)
-- ============================================================================
SELECT 
  policyname,
  cmd as action,
  roles,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'reflex_events'
ORDER BY policyname;

-- Expected result:
-- - Only one policy: "dev_allow_all_reflex_events"
-- Should NOT see: "Allow all operations on reflex_events"

-- ============================================================================
-- 3. Check for any remaining duplicate indexes (should return 0 rows)
-- ============================================================================
SELECT 
  tablename,
  array_agg(indexname ORDER BY indexname) as duplicate_indexes,
  COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'reflex_events'
  AND (
    indexname LIKE '%campaign%' OR
    indexname LIKE '%cta%' OR
    indexname LIKE '%created%'
  )
GROUP BY tablename
HAVING COUNT(*) > 1;

-- Expected result: 0 rows (no duplicates found)

-- ============================================================================
-- 4. Verify index definitions use correct column names
-- ============================================================================
SELECT 
  indexname,
  CASE 
    WHEN indexdef LIKE '%"campaignId"%' THEN '✅ Correct (camelCase)'
    WHEN indexdef LIKE '%campaign_id%' THEN '❌ Wrong (snake_case)'
    WHEN indexdef LIKE '%"ctaSource"%' THEN '✅ Correct (camelCase)'
    WHEN indexdef LIKE '%cta_source%' THEN '❌ Wrong (snake_case)'
    WHEN indexdef LIKE '%"ctaType"%' THEN '✅ Correct (camelCase)'
    WHEN indexdef LIKE '%cta_type%' THEN '❌ Wrong (snake_case)'
    WHEN indexdef LIKE '%"createdAt"%' THEN '✅ Correct (camelCase)'
    WHEN indexdef LIKE '%created_at%' THEN '❌ Wrong (snake_case)'
    ELSE 'N/A'
  END as column_name_check
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'reflex_events'
  AND indexname LIKE 'idx_reflex_events%'
ORDER BY indexname;

-- Expected: All should show "✅ Correct (camelCase)"

-- ============================================================================
-- 5. Summary report
-- ============================================================================
SELECT 
  'Indexes' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ Expected indexes present'
    ELSE '⚠️ Missing some indexes'
  END as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'reflex_events'
  AND indexname LIKE 'idx_reflex_events%'

UNION ALL

SELECT 
  'Policies' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ Single policy (correct)'
    WHEN COUNT(*) > 1 THEN '❌ Multiple policies (duplicate)'
    ELSE '⚠️ No policies found'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'reflex_events';

