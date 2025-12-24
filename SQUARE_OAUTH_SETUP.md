# Square OAuth Setup Guide

## ✅ Environment Variables Configured

All Square environment variables have been set in Vercel for all environments (Production, Preview, Development):

- ✅ `SQUARE_APPLICATION_ID` = `sandbox-sq0idb-HwTEDJNDDoBxCMCoI7i6xg`
- ✅ `SQUARE_APPLICATION_SECRET` = `sandbox-sq0csb-9OTwRguXASQ_2-jHlBFip_N1GWkBvMAP-CMs2q-9dXU`
- ✅ `ENCRYPTION_KEY` = `b7a7b68d375178a6c7bf2172bc9376fe09066f740388a2a028b5c0ea0c269386`

---

## 🔗 Square Redirect URL Configuration

### **For Sandbox (Development/Testing):**

In Square Developer Console → Your App → OAuth Settings, enter:

**Redirect URL:**
```
http://localhost:3002/api/square/oauth/callback
```

**For Production (when ready):**
```
https://your-production-domain.vercel.app/api/square/oauth/callback
```

Replace `your-production-domain.vercel.app` with your actual Vercel production domain.

---

## 📋 Steps to Complete Setup

### 1. **Configure Redirect URL in Square Developer Console**

1. Go to: https://developer.squareup.com/apps
2. Select your app (or create new app)
3. Navigate to **OAuth** settings
4. Under **Sandbox Redirect URLs**, add:
   ```
   http://localhost:3002/api/square/oauth/callback
   ```
5. Click **Save**

### 2. **For Production (Later)**

When you're ready for production:
1. Get your production Vercel domain
2. Add production redirect URL in Square:
   ```
   https://your-domain.vercel.app/api/square/oauth/callback
   ```
3. Update `NEXT_PUBLIC_APP_URL` in Vercel to match your production domain

### 3. **Test the Integration**

1. Start your local development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3002/square/connect`

3. Click "Connect Square Account"

4. You'll be redirected to Square's OAuth page

5. Authorize the app

6. You'll be redirected back to `/square/settings?connected=true`

---

## 🔐 Security Notes

- **Encryption Key**: The `ENCRYPTION_KEY` is a 64-character hex string used to encrypt Square tokens in the database
- **OAuth Tokens**: Access tokens and refresh tokens are encrypted before storage
- **Token Refresh**: Tokens automatically refresh when expired
- **Revocation**: You can disconnect Square accounts, which revokes tokens

---

## 🧪 Testing Checklist

- [ ] Redirect URL configured in Square Developer Console
- [ ] Local development server running
- [ ] Navigate to `/square/connect`
- [ ] Click "Connect Square Account"
- [ ] Complete OAuth flow
- [ ] Verify connection status at `/square/settings`
- [ ] Test token refresh (wait for expiration or manually trigger)
- [ ] Test disconnect functionality

---

## 📝 Additional Notes

### **Multiple Redirect URLs**

Square allows multiple redirect URLs. You can add:
- `http://localhost:3002/api/square/oauth/callback` (local dev)
- `https://your-preview-url.vercel.app/api/square/oauth/callback` (preview)
- `https://your-production-url.vercel.app/api/square/oauth/callback` (production)

### **Environment Variables**

The following environment variables are now set in Vercel:
- `SQUARE_APPLICATION_ID` - Your Square Application ID
- `SQUARE_APPLICATION_SECRET` - Your Square Application Secret
- `ENCRYPTION_KEY` - Encryption key for token storage

### **Local Development**

For local development, create a `.env.local` file:

```bash
SQUARE_APPLICATION_ID=sandbox-sq0idb-HwTEDJNDDoBxCMCoI7i6xg
SQUARE_APPLICATION_SECRET=sandbox-sq0csb-9OTwRguXASQ_2-jHlBFip_N1GWkBvMAP-CMs2q-9dXU
ENCRYPTION_KEY=b7a7b68d375178a6c7bf2172bc9376fe09066f740388a2a028b5c0ea0c269386
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

---

## ✅ Setup Complete!

Your Square OAuth integration is now configured. The redirect URL you need to enter in Square Developer Console is:

**`http://localhost:3002/api/square/oauth/callback`**

Once you add this in Square's OAuth settings, you can test the connection flow!

