# Create reflex_events Table - Status

## Current Status

**Problem**: The `reflex_events` table does not exist in the Supabase database, preventing lead creation in Operator Onboarding Management.

**Error**: `The table public.reflex_events does not exist in the current database`

## Solution

A migration file has been created: `supabase/migrations/20251110000001_create_reflex_events_table.sql`

This migration will:
1. Create the `reflex_events` table with all required columns
2. Add indexes for performance
3. Enable Row Level Security (RLS)
4. Create a policy to allow all operations

## How to Apply the Migration

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20251110000001_create_reflex_events_table.sql`
4. Paste and run the SQL

### Option 2: Via Prisma Migrate
```bash
cd apps/app
npx prisma migrate deploy
```

### Option 3: Manual SQL Execution
Run each statement separately in Supabase SQL Editor or via psql:

```sql
-- Create table
CREATE TABLE IF NOT EXISTS public.reflex_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'ui',
  session_id TEXT,
  payment_intent TEXT,
  payload TEXT,
  payload_hash TEXT,
  user_agent TEXT,
  ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  cta_source TEXT,
  cta_type TEXT,
  referrer TEXT,
  campaign_id TEXT,
  metadata TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reflex_events_type_created_at ON public.reflex_events(type, created_at);
CREATE INDEX IF NOT EXISTS idx_reflex_events_cta_source ON public.reflex_events(cta_source);
CREATE INDEX IF NOT EXISTS idx_reflex_events_cta_type ON public.reflex_events(cta_type);
CREATE INDEX IF NOT EXISTS idx_reflex_events_campaign_id ON public.reflex_events(campaign_id);

-- Enable RLS
ALTER TABLE public.reflex_events ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations on reflex_events"
ON public.reflex_events
FOR ALL
USING (true)
WITH CHECK (true);
```

## After Migration

Once the table is created:
1. ✅ Lead creation will work
2. ✅ CTA tracking will be logged
3. ✅ Operator onboarding data will load
4. ✅ All events will be stored in Supabase

## Test After Migration

```bash
curl -X POST http://localhost:3002/api/admin/operator-onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_lead",
    "leadData": {
      "businessName": "Test Business",
      "ownerName": "Test Owner",
      "email": "test@example.com",
      "phone": "555-1234",
      "location": "Atlanta, GA",
      "stage": "new-leads"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "leadId": "...",
  "message": "Lead created successfully"
}
```

