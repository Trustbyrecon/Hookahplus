-- Quick diagnostic query to check what source values exist in reflex_events table
-- Run this BEFORE applying the migration to see what needs to be fixed

SELECT 
  source,
  COUNT(*) as count
FROM public.reflex_events
GROUP BY source
ORDER BY count DESC;

-- This will show you all unique source values and their counts
-- Any values not in ('ui', 'server', 'cron', 'webhook', 'backend', 'agent') will be updated to 'ui'

