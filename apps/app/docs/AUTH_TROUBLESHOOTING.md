# Auth Troubleshooting

## Magic link or password login not working

### 1. Supabase Redirect URLs (most common)

Magic links and password reset emails redirect to your app. Supabase **must** have your callback URL in the allow list.

**Fix:** Supabase Dashboard → Authentication → [URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration)

Add these to **Redirect URLs**:

| Environment | Add this URL |
|-------------|--------------|
| Production  | `https://app.hookahplus.net/**` |
| Local dev   | `http://localhost:3002/**`     |

Set **Site URL** to your main app URL (e.g. `https://app.hookahplus.net`).

### 1b. Reset password lands on home page (`/?code=...`)

If the reset link drops you on the home page with `?code=...` in the URL instead of `/auth/set-password`, the **Reset Password** email template is using `{{ .SiteURL }}` instead of `{{ .RedirectTo }}`.

**Fix:** Supabase Dashboard → Authentication → Email Templates → **Reset Password**. Change the confirmation link to use `{{ .RedirectTo }}`:

```html
<a href="{{ .RedirectTo }}">Reset password</a>
```

The app also has a fallback: landing on `/?code=...` will auto-redirect to the auth callback and then to `/auth/set-password`.

### 2. No password set (magic-link-only users)

If you signed up via magic link only, you don't have a password. **Password sign-in will fail.**

**Fix:** Use one of these:

- **Magic link** — Enter email, click "Send magic link", use the link in the email
- **Forgot password** — Enter email, click "Forgot password?", use the reset link to set a password, then sign in with password

### 3. Email provider / spam

- Check spam/junk for the magic link or reset email
- Supabase Dashboard → Authentication → Email Templates — ensure templates are correct
- Verify your domain in Supabase if using custom SMTP

### 4. Session / cookies

- Clear cookies for the site and try again
- Use a private/incognito window
- Ensure you're on the same domain as configured (e.g. `app.hookahplus.net`, not `www.`)

### 5. Environment variables

Ensure these are set (Vercel, `.env.local`, etc.):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (production URL, e.g. `https://app.hookahplus.net`)

## Quick checklist

- [ ] Redirect URLs include `https://app.hookahplus.net/**` (or your domain)
- [ ] Site URL is set in Supabase
- [ ] Magic link: check email (including spam)
- [ ] Password: use "Forgot password?" to set one first
- [ ] Cookies cleared / incognito test
