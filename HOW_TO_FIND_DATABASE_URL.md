# How to Find and Configure DATABASE_URL

## ⚠️ Important: DATABASE_URL is NOT updated in Supabase

**Supabase** only **provides** the connection string (you can view it, but not edit it).  
**Vercel** is where you **configure** the `DATABASE_URL` environment variable.

---

## 📍 Step 1: Find Your Connection String in Supabase (For Reference)

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **Settings** (gear icon in bottom left sidebar)
4. Click **Database** in the settings menu
5. Scroll to **Connection String** section
6. You'll see several connection string options:
   - **URI** - Full connection string (use this)
   - **JDBC** - For Java applications
   - **Node.js** - For Node.js applications

### Example Format:
```
postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```

**Note:** Replace `[YOUR-PASSWORD]` with your actual database password.

---

## ⚙️ Step 2: Configure DATABASE_URL in Vercel

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project: `hookahplus-app` (or your project name)
3. Go to **Settings** → **Environment Variables**
4. Look for `DATABASE_URL`:
   - If it exists: Verify it matches your Supabase connection string
   - If it doesn't exist: Click **Add New** and create it

### Configuration:
```
Name: DATABASE_URL
Value: postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
Environment: Production ✅ (also set for Preview if needed)
```

---

## ✅ Step 3: Verify It's Working

Since your RLS migration succeeded and webhooks are processing, **your DATABASE_URL is likely already configured correctly** in Vercel.

### Quick Check:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Search for `DATABASE_URL`
3. If it exists and has a value, you're good!
4. If webhooks are working, it's definitely configured correctly

---

## 🤔 Do You Still Need It?

**YES, you still need DATABASE_URL**, but you don't need to "update" it in Supabase because:
- Supabase provides the connection string (read-only)
- Vercel stores it as an environment variable
- If webhooks are working, it's already set correctly

---

## 🔍 Quick Verification Query

If you want to verify your connection is working, you can test it in Supabase SQL Editor:

```sql
-- This will confirm you can connect to your database
SELECT current_database(), current_user;
```

If this works, your DATABASE_URL is correct!

