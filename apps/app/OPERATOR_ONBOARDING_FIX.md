# Operator Onboarding API Fix

## Issues Fixed

1. **Database Connection Checks**: Added connection testing before all database operations
2. **Better Error Handling**: More specific error messages for common Prisma errors
3. **CTA Logging**: Enhanced logging for CTA events (Create Lead button clicks)
4. **Table Existence Checks**: Added checks for missing database tables

## Changes Made

### API Route: `/api/admin/operator-onboarding`

**GET Route:**
- Added database connection test before querying
- Added error handling for missing tables
- Added logging for query results

**POST Route:**
- Added database connection test before creating/updating
- Added detailed logging for lead creation
- Enhanced error messages with specific Prisma error detection
- Better error details in development mode

## CTA Tracking

The API now properly logs CTA events when:
- User clicks "Add New Lead" button
- User clicks "Create Lead" button
- Lead is created successfully

All CTA events are stored in the `ReflexEvent` table with:
- `ctaSource`: 'manual' (for manually created leads)
- `ctaType`: 'onboarding_signup'
- `type`: 'onboarding.signup'
- Full payload with lead data

## Database Requirements

The API requires the `ReflexEvent` table (mapped to `reflex_events` in database) with these fields:
- `id` (String, primary key)
- `type` (String)
- `source` (String)
- `payload` (String, JSON)
- `ctaSource` (String, nullable)
- `ctaType` (String, nullable)
- `userAgent` (String, nullable)
- `ip` (String, nullable)
- `createdAt` (DateTime)

## Testing

1. **Test Lead Creation:**
   - Go to `/admin/operator-onboarding`
   - Click "Add New Lead"
   - Fill in Business Name and Email (required)
   - Click "Create Lead"
   - Should see success message and lead appear in list

2. **Check Logs:**
   - Check server console for `[Operator Onboarding API]` logs
   - Should see "Database connection successful"
   - Should see "Creating lead with data"
   - Should see "Lead created successfully"

3. **Check Database:**
   - Query `reflex_events` table
   - Should see new entry with `type = 'onboarding.signup'`
   - Should see `ctaSource = 'manual'` and `ctaType = 'onboarding_signup'`

## Error Messages

The API now provides specific error messages:

- **Database connection failed**: Check `DATABASE_URL` environment variable
- **Database table not found**: Run `npx prisma migrate deploy`
- **Duplicate entry**: Lead with same information already exists
- **Invalid reference**: Referenced record does not exist

## Next Steps

1. **Restart servers** to apply changes
2. **Test lead creation** via UI
3. **Check Supabase logs** to see CTA events being logged
4. **Verify data** appears in `reflex_events` table

## Supabase Logs

After creating a lead, you should see in Supabase logs:
- `POST /api/admin/operator-onboarding` with status 200
- Database queries to `reflex_events` table
- New entries in the `reflex_events` table

