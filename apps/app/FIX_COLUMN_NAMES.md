# Fix reflex_events Column Names

## Issue

The `reflex_events` table was created with snake_case column names (`user_agent`, `session_id`, etc.), but Prisma expects camelCase column names (`userAgent`, `sessionId`, etc.) to match the schema.

## Solution

A new migration file has been created: `supabase/migrations/20251110000002_fix_reflex_events_column_names.sql`

This migration will:
1. Drop the existing table (if it has wrong column names)
2. Recreate it with correct camelCase column names
3. Recreate all indexes
4. Re-enable RLS and policies

## How to Apply

### Via Supabase Dashboard:
1. Go to SQL Editor in Supabase
2. Copy the contents of `supabase/migrations/20251110000002_fix_reflex_events_column_names.sql`
3. Paste and run

### Column Name Mapping:
- `user_agent` → `"userAgent"` (quoted for camelCase)
- `session_id` → `"sessionId"`
- `payment_intent` → `"paymentIntent"`
- `payload_hash` → `"payloadHash"`
- `created_at` → `"createdAt"`
- `cta_source` → `"ctaSource"`
- `cta_type` → `"ctaType"`
- `campaign_id` → `"campaignId"`

## After Running Migration

Once the column names are fixed:
1. ✅ Lead creation will work
2. ✅ Prisma queries will succeed
3. ✅ CTA tracking will be logged correctly

## Test

After running the migration, test lead creation:
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

Expected: `{"success": true, "leadId": "...", "message": "Lead created successfully"}`

