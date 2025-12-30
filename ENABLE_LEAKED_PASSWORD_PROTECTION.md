# Enable Leaked Password Protection

**Date:** 2025-01-28  
**Status:** ⚠️ Configuration Required

---

## Problem

Supabase Security Advisor detected that **Leaked Password Protection is disabled**.

This feature prevents users from using compromised passwords by checking against HaveIBeenPwned.org's database of leaked passwords.

---

## Why This Matters

- **Security Risk:** Users can set passwords that have been compromised in data breaches
- **Best Practice:** Modern authentication systems should check against known password leaks
- **Compliance:** Many security standards recommend leaked password protection

---

## How to Enable

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project

### Step 2: Navigate to Auth Settings

1. Click **Authentication** in the left sidebar
2. Click **Policies** (or **Settings** → **Auth**)
3. Scroll down to **Password Security** section

### Step 3: Enable Leaked Password Protection

1. Find the **"Leaked Password Protection"** toggle
2. Enable it (toggle to ON)
3. Save changes

**Alternative Path:**
- Go to **Settings** → **Auth** → **Password Security**
- Enable **"Check passwords against HaveIBeenPwned database"**

---

## How It Works

When enabled, Supabase Auth will:

1. **Check passwords** against HaveIBeenPwned.org's database
2. **Block compromised passwords** during signup and password reset
3. **Show user-friendly error** message when a leaked password is detected
4. **Use secure API** (k-anonymity) - only sends first 5 characters of password hash

### User Experience

When a user tries to use a leaked password, they'll see an error like:
> "This password has been found in a data breach. Please choose a different password."

---

## Security Details

### Privacy Protection

- Uses **k-anonymity protocol** (first 5 characters of SHA-1 hash)
- **No full password** is sent to HaveIBeenPwned
- **No user data** is exposed
- Complies with privacy best practices

### API Usage

- Supabase calls HaveIBeenPwned API (pwnedpasswords.com)
- Rate-limited and cached for performance
- No additional cost for this feature

---

## Verification

After enabling:

1. **Test with a known leaked password:**
   - Try signing up with password: `password123`
   - Should be blocked (if it's in the database)

2. **Check Supabase Security Advisor:**
   - Go to Database → Security Advisor
   - Warning for `auth_leaked_password_protection` should be resolved

3. **Verify in Auth Settings:**
   - Settings → Auth → Password Security
   - "Leaked Password Protection" should show as **Enabled**

---

## Additional Password Security Settings

While you're in the Auth settings, consider enabling:

### Password Strength Requirements

- **Minimum length:** 8+ characters (recommended: 12+)
- **Require uppercase:** Yes
- **Require lowercase:** Yes
- **Require numbers:** Yes
- **Require special characters:** Optional (can reduce usability)

### Password Expiration (Optional)

- Consider requiring password changes periodically
- Balance security with user experience

---

## Impact on Users

### Positive Impact

- ✅ Better security for user accounts
- ✅ Prevents use of compromised passwords
- ✅ Educates users about password security

### Potential Issues

- ⚠️ Some users may need to choose different passwords
- ⚠️ Slight delay during signup (API call to HaveIBeenPwned)
- ⚠️ Users with existing leaked passwords won't be forced to change (only new passwords are checked)

---

## Best Practices

1. **Enable immediately** - No downside, only security benefits
2. **Combine with strong password requirements** - Length + complexity
3. **Consider password expiration** - For high-security applications
4. **Educate users** - Explain why certain passwords are blocked
5. **Monitor false positives** - Rare, but some legitimate passwords may be flagged

---

## Troubleshooting

### Feature Not Available

- **Check Supabase plan:** Some features may require Pro plan
- **Check project region:** Some regions may have different features
- **Contact Supabase support:** If option doesn't appear

### Users Complaining About Blocked Passwords

- **Explain the security benefit:** Their account is more secure
- **Suggest password managers:** Generate strong, unique passwords
- **Provide examples:** Show what makes a good password

### Performance Concerns

- **Caching:** Supabase caches results for performance
- **Rate limiting:** Built-in to prevent abuse
- **Minimal impact:** API call is fast (< 100ms typically)

---

## Related Security Features

After enabling leaked password protection, also consider:

1. ✅ **Two-Factor Authentication (2FA)** - Enable in Auth settings
2. ✅ **Email verification** - Require verified emails
3. ✅ **Rate limiting** - Prevent brute force attacks
4. ✅ **Session management** - Configure session timeouts
5. ✅ **Password reset security** - Secure reset flow

---

## Status

- ⏳ **Action Required:** Enable in Supabase Dashboard
- ⏳ **Verification:** Check Security Advisor after enabling
- ⏳ **Testing:** Verify with test account

---

**Next Steps:**
1. Open Supabase Dashboard → Authentication → Settings
2. Enable "Leaked Password Protection"
3. Save changes
4. Verify in Security Advisor (warning should disappear)

