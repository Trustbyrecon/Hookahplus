# Quick Square Test Setup Guide

## Option 1: OAuth Connection (Recommended) ⭐

### Steps:
1. **Start your dev server:**
   ```bash
   cd apps/app
   npm run dev
   ```

2. **Navigate to Square Connect page:**
   ```
   http://localhost:3002/square/connect?loungeId=test_venue
   ```

3. **Complete OAuth flow:**
   - Click "Connect Square Account"
   - Authorize in Square
   - You'll be redirected back with connection confirmed

4. **Run the test:**
   ```bash
   npm run test:square test_venue
   ```

### Prerequisites:
- `SQUARE_APPLICATION_ID` set in `.env.local`
- `SQUARE_APPLICATION_SECRET` set in `.env.local`
- `ENCRYPTION_KEY` set in `.env.local`
- Redirect URL configured in Square Developer Console

---

## Option 2: Environment Variables (Quick Test) ⚡

### Steps:
1. **Get Square Sandbox Credentials:**
   - Go to: https://developer.squareup.com/apps
   - Select your app (or create new)
   - Go to **Credentials** tab
   - Copy **Sandbox Access Token**
   - Copy **Location ID** from Locations tab

2. **Add to `.env.local` in `apps/app/`:**
   ```bash
   # Square API credentials
   SQUARE_ACCESS_TOKEN=EAAA_sandbox_your_token_here
   SQUARE_LOCATION_ID=your_location_id_here
   # Generate with: openssl rand -hex 32
   # TRUSTLOCK_SECRET=your_generated_secret_here
   ```

3. **Run the test:**
   ```bash
   npm run test:square test_venue
   ```

---

## Quick Check: What Do You Have?

Run this to check your current setup:

```bash
cd apps/app
node -e "console.log('SQUARE_APPLICATION_ID:', process.env.SQUARE_APPLICATION_ID ? 'SET' : 'NOT SET'); console.log('SQUARE_ACCESS_TOKEN:', process.env.SQUARE_ACCESS_TOKEN ? 'SET' : 'NOT SET'); console.log('SQUARE_LOCATION_ID:', process.env.SQUARE_LOCATION_ID ? 'SET' : 'NOT SET');"
```

---

## Which Option Should I Use?

- **OAuth (Option 1)**: Use if you want production-like setup, automatic token refresh, and multi-venue support
- **Env Vars (Option 2)**: Use for quick testing, development, or if you don't need OAuth features

---

## Troubleshooting

### "No Square connection found"
- Check that you've completed one of the setup options above
- Verify environment variables are in `apps/app/.env.local`
- Restart dev server after adding env vars

### "TRUSTLOCK_SECRET environment variable is required"
- Add `TRUSTLOCK_SECRET` to `.env.local`
- Generate one: `openssl rand -hex 32`

### "Failed to initialize Square adapter"
- Verify access token is valid
- Check location ID exists in Square dashboard
- Ensure you're using sandbox credentials for testing

