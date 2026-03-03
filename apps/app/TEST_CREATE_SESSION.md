# Testing Create Session Flow

## Overview
This document describes how to test the Create Session functionality to verify that manually entered sessions flow to the database.

## Test Steps

### 1. Open Fire Session Dashboard
- Navigate to `http://localhost:3002/fire-session-dashboard`
- Look for the "New Session" button or "Create New Session" card

### 2. Open Create Session Modal
- Click the "New Session" button
- Modal should open with form fields

### 3. Fill in Session Data
Required fields:
- **Table Selection**: Select a table (e.g., T-001)
- **Customer Name**: Enter a name (e.g., "Test Customer")
- **Flavor Mix**: Select at least one flavor
- **Pricing Model**: Choose Flat Fee or Time-Based
- **Session Duration**: Select duration (e.g., 45 minutes)

Optional fields:
- Customer Phone
- BOH Staff assignment
- FOH Staff assignment
- Session Notes

### 4. Submit Session
- Click "Create New Session" button
- Check browser console for logs:
  - `[Create Session] Sending to API:` - Shows the payload
  - `[Create Session] Success:` - Shows the response
  - `[Create Session] Error:` - Shows any errors

### 5. Verify Database Save
Check the database to confirm the session was saved:

```sql
-- Check latest sessions
SELECT * FROM "Session" ORDER BY "createdAt" DESC LIMIT 5;

-- Check specific table
SELECT * FROM "Session" WHERE "tableId" = 'T-001' ORDER BY "createdAt" DESC;
```

### 6. Verify UI Update
- Modal should close automatically
- Session list should refresh
- New session should appear in the dashboard
- Check Overview, BOH, or FOH tabs for the new session

## Expected API Payload

The modal sends data in this format:
```json
{
  "table_id": "T-001",
  "customer_name": "Test Customer",
  "customer_phone": "+1234567890",
  "flavor_mix": ["Blue Mist", "Mint Fresh"],
  "amount": 35.50,
  "pricing_model": "flat",
  "timer_duration": 45,
  "boh_staff": "Mike Rodriguez",
  "foh_staff": "John Smith",
  "notes": "Test session"
}
```

The API receives it converted to:
```json
{
  "tableId": "T-001",
  "customerName": "Test Customer",
  "customerPhone": "+1234567890",
  "flavor": "Blue Mist + Mint Fresh",
  "amount": 3550,
  "assignedStaff": {
    "boh": "Mike Rodriguez",
    "foh": "John Smith"
  },
  "notes": "Test session",
  "sessionDuration": 2700,
  "loungeId": "default-lounge",
  "source": "WALK_IN",
  "externalRef": "table-T-001-1234567890"
}
```

## Troubleshooting

### Issue: "Failed to create session"
- Check browser console for error details
- Verify API endpoint is accessible: `http://localhost:3002/api/sessions`
- Check database connection in API logs

### Issue: Session not appearing in UI
- Check if `refreshSessions()` is being called
- Verify session was actually saved to database
- Check browser console for any errors

### Issue: "Table already has an active session"
- The table already has a session in state other than COMPLETED/CANCELLED/CLOSED
- Either complete the existing session or use a different table

### Issue: Amount not saving correctly
- API expects amount in cents (or will convert from dollars)
- Check `priceCents` field in database
- Verify conversion: `amount * 100` for dollars to cents

## Database Verification Queries

```sql
-- Count total sessions
SELECT COUNT(*) FROM "Session";

-- View latest session details
SELECT 
  id,
  "tableId",
  "customerRef",
  flavor,
  "priceCents",
  state,
  "createdAt"
FROM "Session"
ORDER BY "createdAt" DESC
LIMIT 1;

-- Check session with all fields
SELECT * FROM "Session" WHERE id = '<session-id>';
```

## Success Criteria

✅ Modal opens and closes correctly
✅ Form validation works
✅ API receives correct payload format
✅ Session is saved to database with all fields
✅ Session appears in UI after creation
✅ Session can be viewed in Overview/BOH/FOH tabs
✅ No console errors

