# Campaign Manager Migration Guide

**Date:** January 2025  
**Status:** Migration SQL Created - Ready to Apply

---

## ✅ Migration File Created

The migration SQL file has been created at:
```
apps/app/prisma/migrations/20250120000000_add_campaigns/migration.sql
```

## 📋 What the Migration Creates

### 1. `campaigns` Table
- Campaign management with all campaign types
- Status tracking (draft, active, paused, completed, scheduled)
- Budget and spending tracking
- Performance metrics (reach, engagement, conversions, ROI)
- Campaign configuration (JSON field for type-specific rules)
- QR code prefix for tracking
- Tenant and lounge associations

### 2. `campaign_usages` Table
- Tracks campaign applications to sessions
- Records discount amounts
- Links to campaigns, sessions, and customers
- Stores metadata for analytics

### 3. Indexes
- Performance indexes on:
  - `lounge_id`, `status`, `start_date`
  - `lounge_id`, `is_active`
  - `tenant_id`
  - `status`, `start_date`, `end_date`
  - `campaign_id`, `applied_at` (for usage tracking)
  - `session_id` and `customer_ref` (for lookups)

### 4. Foreign Keys
- `campaigns.tenant_id` → `tenants.id`
- `campaign_usages.campaign_id` → `campaigns.id` (CASCADE delete)

---

## 🚀 How to Apply the Migration

### Option 1: When Database Connection is Available

```bash
cd apps/app
npx prisma migrate deploy
```

This will apply all pending migrations, including the campaigns migration.

### Option 2: Manual SQL Execution

If you have direct database access, you can run the SQL file directly:

```bash
# Using psql
psql -h db.hsypmyqtlxjwpnkkacmo.supabase.co -U your_user -d postgres -f prisma/migrations/20250120000000_add_campaigns/migration.sql

# Or copy the SQL and run it in your database admin tool
```

### Option 3: Using Prisma Migrate Dev (Development)

```bash
cd apps/app
npx prisma migrate dev --name add_campaigns
```

This will:
1. Apply the migration
2. Regenerate Prisma Client
3. Mark the migration as applied

---

## 🔍 Verify Migration

After applying the migration, verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('campaigns', 'campaign_usages');

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('campaigns', 'campaign_usages');
```

---

## ⚠️ Database Connection Issue

The migration couldn't be applied automatically because:
- Database server at `db.hsypmyqtlxjwpnkkacmo.supabase.co:5432` is unreachable

**Possible causes:**
1. Database server is down or paused (Supabase free tier pauses after inactivity)
2. Network/firewall blocking connection
3. Incorrect DATABASE_URL in `.env` file
4. Database credentials expired

**Solutions:**
1. Check Supabase dashboard - ensure database is active
2. Verify DATABASE_URL in `.env.local` or `.env`
3. Test connection: `npx prisma db pull` (should connect)
4. Once connection is restored, run `npx prisma migrate deploy`

---

## 📊 After Migration

Once the migration is applied:

1. **Prisma Client is already generated** ✅
   - The client was generated successfully
   - Campaign models are available in code

2. **Test the API endpoints:**
   ```bash
   # Create a campaign
   curl -X POST http://localhost:3002/api/campaigns \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Campaign",
       "type": "percentage_off",
       "loungeId": "HOPE_GLOBAL_FORUM",
       "startDate": "2025-01-20T00:00:00Z",
       "budget": 1000,
       "campaignConfig": {"percentageOff": 20}
     }'
   ```

3. **Access Campaigns Page:**
   - Navigate to `/campaigns` in the app
   - Create and manage campaigns
   - View analytics with ROI and conversion rates

---

## 🎯 Next Steps

1. ✅ Migration SQL created
2. ✅ Prisma Client generated
3. ⏳ Apply migration when database is available
4. ✅ All code is ready - Campaign Manager fully integrated!

---

**The Campaign Manager is ready to use once the migration is applied!** 🚀

