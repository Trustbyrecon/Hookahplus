# Square OAuth 404 Error Troubleshooting

## Error: `GET https://app.squareup.com/oauth2/authorize ... 404 (Not Found)`

This 404 error indicates that Square doesn't recognize your Application ID or the OAuth endpoint is incorrect.

## ✅ **Step 1: Verify Application ID in Square Developer Console**

1. Go to: https://developer.squareup.com/apps
2. **Make sure you're in Sandbox mode** (toggle at top)
3. Click on your app
4. Go to **Credentials** tab
5. Find **Sandbox Application ID**
6. **Copy the EXACT value** - it should look like:
   ```
   sandbox-sq0idb-XXXXXXXXXXXXXXXXXXXX
   ```

## ✅ **Step 2: Verify Application ID Format**

The Application ID should:
- Start with `sandbox-sq0idb-` for sandbox
- Be about 37 characters long
- Match exactly what's in Square Developer Console

**Common mistakes:**
- ❌ `sq0idb-...` (missing `sandbox-` prefix)
- ❌ `sandbox-sq0idp-...` (wrong prefix - should be `sq0idb`)
- ❌ Typos in the ID (0 vs O, 1 vs l vs I)

## ✅ **Step 3: Check App Status in Square**

1. In Square Developer Console
2. Make sure your app is **Active** (not Draft)
3. Verify OAuth is enabled for the app
4. Check that you're using **Sandbox** credentials (not Production)

## ✅ **Step 4: Verify Redirect URL**

The redirect URL in Square must be **exactly**:
```
http://localhost:3002/api/square/oauth/callback
```

**Check in Square:**
1. Go to your app → **OAuth** settings
2. Under **Sandbox Redirect URLs**
3. Must match exactly (no trailing slash, must be `http://`)

## ✅ **Step 5: Verify Environment Variables**

Check your `apps/app/.env.local` file:

```bash
SQUARE_APPLICATION_ID=sandbox-sq0idb-XXXXXXXXXXXXXXXXXXXX
SQUARE_APPLICATION_SECRET=sandbox-sq0csb-XXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

**⚠️ IMPORTANT:** Replace the `X` placeholders with your actual values from Square Developer Console.

**After updating `.env.local`, restart your dev server:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

## ✅ **Step 6: Test Application ID**

Try accessing this URL directly in your browser (replace `YOUR_APP_ID` with your actual Application ID):
```
https://connect.squareup.com/oauth2/authorize?client_id=YOUR_APP_ID&scope=ORDERS_READ&redirect_uri=http://localhost:3002/api/square/oauth/callback
```

If you get a 404, the Application ID is not recognized by Square.

## 🔍 **Common Issues:**

### **Issue 1: Wrong Application ID**
- **Symptom:** 404 error on authorize endpoint
- **Fix:** Copy-paste Application ID directly from Square Developer Console

### **Issue 2: Using Production ID in Sandbox**
- **Symptom:** 404 error
- **Fix:** Make sure you're using **Sandbox Application ID** (starts with `sandbox-sq0idb-`)

### **Issue 3: App Not Active**
- **Symptom:** 404 error
- **Fix:** Make sure app is **Active** in Square Developer Console

### **Issue 4: Redirect URL Mismatch**
- **Symptom:** 404 or missing_params error
- **Fix:** Verify redirect URL matches exactly in Square

## 📋 **Complete Checklist:**

- [ ] Application ID copied directly from Square (not typed)
- [ ] Application ID starts with `sandbox-sq0idb-`
- [ ] Using Sandbox credentials (not Production)
- [ ] App is Active in Square Developer Console
- [ ] OAuth is enabled for the app
- [ ] Redirect URL registered in Square: `http://localhost:3002/api/square/oauth/callback`
- [ ] `.env.local` has correct Application ID
- [ ] Dev server restarted after updating `.env.local`
- [ ] No typos in Application ID

## 🧪 **Debug Steps:**

1. **Check server logs** when clicking "Connect Square Account"
   - Look for `[Square OAuth] Generated auth URL` log
   - Verify the Application ID being used

2. **Check browser network tab**
   - See the exact URL being requested
   - Check if it's going to `connect.squareup.com` or `app.squareup.com`

3. **Verify Application ID format**
   ```bash
   # In apps/app directory
   node -e "const id = process.env.SQUARE_APPLICATION_ID || require('fs').readFileSync('.env.local', 'utf8').match(/SQUARE_APPLICATION_ID=(.+)/)?.[1]; console.log('ID:', id); console.log('Starts with sandbox-sq0idb-:', id?.startsWith('sandbox-sq0idb-'));"
   ```

## 🚨 **If Still Getting 404:**

1. **Create a new Square app** in Developer Console
2. **Copy the new Sandbox Application ID**
3. **Update `.env.local`** with the new ID
4. **Register the redirect URL** in the new app
5. **Restart dev server**
6. **Try again**

---

**The 404 error means Square doesn't recognize your Application ID. Double-check it matches exactly what's in Square Developer Console!**


