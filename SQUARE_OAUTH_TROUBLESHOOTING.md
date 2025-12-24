# Square OAuth Troubleshooting

## Error: "Unable to find client by that `client_id`"

This error occurs when Square doesn't recognize your Application ID or the redirect URI doesn't match.

### ✅ **Step 1: Verify Application ID in Square Developer Console**

1. Go to: https://developer.squareup.com/apps
2. Make sure you're in **Sandbox** mode (toggle at top)
3. Select your app
4. Go to **Credentials** tab
5. Verify the **Sandbox Application ID** matches:
   ```
   sandbox-sq0idb-HwTEDJNDDoBxCMCoI7i6xg
   ```

### ✅ **Step 2: Register Redirect URI in Square**

**CRITICAL:** The redirect URI must be **exactly** registered in Square.

1. In Square Developer Console → Your App
2. Go to **OAuth** settings (or **Settings** → **OAuth**)
3. Under **Sandbox Redirect URLs**, add:
   ```
   http://localhost:3002/api/square/oauth/callback
   ```
4. **Important:** 
   - Must be **exact match** (no trailing slashes)
   - Must include `http://` (not `https://` for localhost)
   - Must include the full path `/api/square/oauth/callback`
5. Click **Save**

### ✅ **Step 3: Verify Environment Variables**

Check your `.env.local` file in `apps/app/`:

```bash
SQUARE_APPLICATION_ID=sandbox-sq0idb-HwTEDJNDDoBxCMCoI7i6xg
SQUARE_APPLICATION_SECRET=sandbox-sq0csb-9OTwRguXASQ_2-jHlBFip_N1GWkBvMAP-CMs2q-9dXU
ENCRYPTION_KEY=b7a7b68d375178a6c7bf2172bc9376fe09066f740388a2a028b5c0ea0c269386
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

**Restart your dev server** after updating `.env.local`:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### ✅ **Step 4: Check Square App Status**

1. In Square Developer Console
2. Make sure your app is **Active** (not Draft)
3. Check that you're using **Sandbox** credentials (not Production)
4. Verify the app has OAuth enabled

### ✅ **Step 5: Test the Redirect URI**

The redirect URI being sent is:
```
http://localhost:3002/api/square/oauth/callback
```

**This must match EXACTLY** what's registered in Square (including protocol, domain, and path).

### 🔍 **Common Issues:**

1. **Redirect URI mismatch:**
   - ❌ `http://localhost:3002/api/square/oauth/callback/` (trailing slash)
   - ✅ `http://localhost:3002/api/square/oauth/callback` (no trailing slash)

2. **Wrong environment:**
   - Using Production Application ID with Sandbox redirect URI
   - Make sure both are Sandbox

3. **App not active:**
   - App might be in Draft status
   - OAuth might not be enabled

4. **Application ID typo:**
   - Double-check the Application ID matches exactly
   - Copy-paste from Square Developer Console

### 📋 **Verification Checklist:**

- [ ] Application ID matches Square Developer Console
- [ ] Redirect URI registered in Square (exact match)
- [ ] Using Sandbox credentials (not Production)
- [ ] App is Active in Square
- [ ] OAuth is enabled for the app
- [ ] `.env.local` has correct values
- [ ] Dev server restarted after `.env.local` changes
- [ ] No typos in Application ID or redirect URI

### 🧪 **Test Steps:**

1. Verify redirect URI in Square: `http://localhost:3002/api/square/oauth/callback`
2. Restart dev server
3. Go to: `http://localhost:3002/square/connect`
4. Click "Connect Square Account"
5. Should redirect to Square OAuth page (not error)

---

**If still having issues:**
- Check Square Developer Console for any error messages
- Verify the Application ID is correct (copy-paste from Square)
- Make sure redirect URI is registered and matches exactly
- Try creating a new Square app if the current one has issues

