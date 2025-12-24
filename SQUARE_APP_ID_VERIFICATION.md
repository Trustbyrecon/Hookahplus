# Square Application ID Verification

## ⚠️ Application ID Mismatch Detected

The error shows Square is receiving a different `client_id` than expected.

### **What Square Received (from error URL):**
```
sandbox-sq0idb-HwTEDJNDD0BxCMCol7i6xg
```

### **What We Have in .env.local:**
```
sandbox-sq0idb-HwTEDJNDDoBxCMCoI7i6xg
```

### **Differences:**
- `D0B` (zero) vs `DoB` (letter O)
- `Col` (lowercase L) vs `CoI` (uppercase I)

## ✅ **How to Fix:**

### **Step 1: Get the EXACT Application ID from Square**

1. Go to: https://developer.squareup.com/apps
2. Make sure you're in **Sandbox** mode (toggle at top)
3. Click on your app: "Sandbox for sq0idp-Up-XRz1icjh5fzrjaX9ocg"
4. Go to **Credentials** tab
5. Find **Sandbox Application ID**
6. **Copy the EXACT value** (don't type it, copy-paste it)

### **Step 2: Update .env.local**

Replace the Application ID in `apps/app/.env.local`:

```bash
SQUARE_APPLICATION_ID=<paste-exact-id-from-square>
```

### **Step 3: Verify Character-by-Character**

Common character confusions:
- `0` (zero) vs `O` (letter O)
- `1` (one) vs `l` (lowercase L) vs `I` (uppercase i)
- `5` (five) vs `S` (letter S)

**Always copy-paste from Square, never type manually!**

### **Step 4: Restart Dev Server**

After updating `.env.local`:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### **Step 5: Test Again**

1. Go to: `http://localhost:3002/square/connect`
2. Click "Connect Square Account"
3. Should redirect to Square OAuth (not error)

---

## 🔍 **Alternative: Check if You Need a Different App**

If the Application ID still doesn't work:

1. In Square Developer Console
2. Check if you have **multiple apps**
3. Make sure you're using the **Sandbox Application ID** (not Production)
4. The Application ID should start with `sandbox-sq0idb-`

---

## 📋 **Quick Checklist:**

- [ ] Copied Application ID directly from Square (not typed)
- [ ] Using Sandbox Application ID (not Production)
- [ ] Updated `.env.local` with exact Application ID
- [ ] Restarted dev server after updating `.env.local`
- [ ] Redirect URL is registered in Square: `http://localhost:3002/api/square/oauth/callback`
- [ ] No typos or character substitutions (0/O, 1/l/I, etc.)

