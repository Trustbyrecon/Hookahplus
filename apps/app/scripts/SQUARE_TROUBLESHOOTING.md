# Square Integration Troubleshooting Guide

## Issue 1: "Unable to find client by that `client_id`" (OAuth Error)

**Symptoms:**
- OAuth redirect shows error page
- URL contains `%0D%0A` in client_id (newline characters)

**Solution:**
1. Check your `.env.local` file for `SQUARE_APPLICATION_ID`
2. Ensure there are no extra spaces or newlines
3. The value should be exactly: `sandbox-sq0idb-XXXXXXXXXXXXXXXXXXXX` (no quotes, no spaces)
4. Restart your dev server after fixing

**Fix:**
```bash
# In apps/app/.env.local, make sure it's exactly:
SQUARE_APPLICATION_ID=sandbox-sq0idb-XXXXXXXXXXXXXXXXXXXX
# No quotes, no trailing spaces, no newlines
# Replace X's with your actual Application ID from Square Developer Console
```

---

## Issue 2: "UNAUTHORIZED" Error (Order Creation Fails)

**Symptoms:**
- Test passes initialization but fails on order creation
- Error: `"category": "AUTHENTICATION_ERROR", "code": "UNAUTHORIZED"`

**Possible Causes:**

### A. Invalid or Expired Token
**Check:**
```bash
cd apps/app
npm run debug:square test_venue
```

**Solutions:**
1. **Token is expired:**
   - Get a new Sandbox Access Token from Square Developer Console
   - Update `SQUARE_ACCESS_TOKEN` in `.env.local`
   - Restart dev server

2. **Token has whitespace:**
   - Check for leading/trailing spaces in `.env.local`
   - Token should be exactly: `EAAA_sandbox_XXXXXXXXXXXXXXXXXXXX`
   - No quotes, no spaces

3. **Token format is wrong:**
   - Sandbox tokens start with `EAAA_sandbox_`
   - Production tokens start with `EAAA_`
   - Verify in Square Developer Console → Credentials

### B. Missing Permissions
**Check:**
- Your Square app needs these permissions:
  - `ORDERS_WRITE`
  - `ORDERS_READ`
  - `PAYMENTS_WRITE`
  - `MERCHANT_PROFILE_READ`
  - `LOCATIONS_READ`

**Solution:**
1. Go to Square Developer Console → Your App → Permissions
2. Ensure all required permissions are enabled
3. If using OAuth, re-authorize with correct scopes

### C. Wrong Location ID
**Check:**
```bash
cd apps/app
npm run debug:square test_venue
```

**Solution:**
1. Get correct Location ID from Square Dashboard → Locations
2. Update `SQUARE_LOCATION_ID` in `.env.local`
3. Ensure Location ID matches the token's access level

### D. Token Not Matching Location
**Solution:**
- The access token must have access to the specified location
- Some tokens are location-specific
- Try using a token that has access to all locations

---

## Quick Fixes

### Fix 1: Regenerate Token
1. Go to: https://developer.squareup.com/apps
2. Select your app
3. Go to **Credentials** tab
4. Click **Regenerate** for Sandbox Access Token
5. Copy the new token (starts with `EAAA_sandbox_`)
6. Update `.env.local`:
   ```bash
   SQUARE_ACCESS_TOKEN=EAAA_sandbox_your_new_token_here
   ```
7. Restart dev server

### Fix 2: Verify Environment Variables
```bash
cd apps/app
node -e "require('dotenv').config({ path: '.env.local' }); console.log('Token length:', process.env.SQUARE_ACCESS_TOKEN?.length); console.log('Token starts with:', process.env.SQUARE_ACCESS_TOKEN?.substring(0, 15)); console.log('Location ID:', process.env.SQUARE_LOCATION_ID);"
```

### Fix 3: Test Token Manually
```bash
curl -X GET "https://connect.squareup.com/v2/merchants" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Square-Version: 2024-01-18"
```

If this returns 401, your token is invalid.

---

## Common Mistakes

1. **Copying token with quotes:**
   ```bash
   # ❌ Wrong
   SQUARE_ACCESS_TOKEN="EAAA_sandbox_..."
   
   # ✅ Correct
   SQUARE_ACCESS_TOKEN=EAAA_sandbox_...
   ```

2. **Extra whitespace:**
   ```bash
   # ❌ Wrong
   SQUARE_ACCESS_TOKEN= EAAA_sandbox_...
   
   # ✅ Correct
   SQUARE_ACCESS_TOKEN=EAAA_sandbox_...
   ```

3. **Using production token in sandbox:**
   - Sandbox tokens start with `EAAA_sandbox_`
   - Production tokens start with `EAAA_`
   - Make sure you're using the right one

4. **Token from wrong app:**
   - Each Square app has its own tokens
   - Make sure you're using tokens from the correct app

---

## Still Having Issues?

1. Run the debug script:
   ```bash
   npm run debug:square test_venue
   ```

2. Check Square API status:
   - https://status.squareup.com/

3. Verify Square app is active:
   - Go to Square Developer Console
   - Ensure app is not in Draft status

4. Check Square API version:
   - We're using `2024-01-18`
   - Verify this version is still supported

5. Review Square API logs:
   - Check Square Developer Console → Logs
   - Look for API errors related to your requests

