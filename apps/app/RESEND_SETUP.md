# Resend Email Setup Guide

## Quick Setup

To enable email sending (test link emails), you need to configure the Resend API key.

### 1. Get Your Resend API Key

1. Go to [https://resend.com/api-keys](https://resend.com/api-keys)
2. Sign up or log in to Resend
3. Create a new API key
4. Copy the key (starts with `re_`)

### 2. Add to Environment Variables

**For Local Development:**

Create or edit `apps/app/.env.local`:

```bash
RESEND_API_KEY=re_your_actual_key_here
RESEND_FROM_EMAIL=Hookah+ <noreply@hookahplus.net>
```

**For Production (Vercel):**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `RESEND_API_KEY` = `re_your_actual_key_here`
   - `RESEND_FROM_EMAIL` = `Hookah+ <noreply@hookahplus.net>`
3. Redeploy your application

### 3. Restart Development Server

After adding the key to `.env.local`, restart your Next.js development server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## Security Notes

✅ **Your `.env.local` file is already in `.gitignore`** - it will never be committed to git.

✅ **API keys are protected** - The `.gitignore` file includes patterns to prevent committing:
- `.env*` files
- `*API_KEY*` patterns
- `*SECRET*` patterns

## Testing

After setup, try sending a test link email from the Operator Onboarding page. If you see an error, check:

1. ✅ API key is in `.env.local` (for local) or Vercel environment variables (for production)
2. ✅ Server has been restarted after adding the key
3. ✅ API key is valid and active in Resend dashboard
4. ✅ `RESEND_FROM_EMAIL` uses a verified domain or `onboarding@resend.dev` for testing

## Troubleshooting

**Error: "Email service not configured"**
- Make sure `RESEND_API_KEY` is set in your environment
- Restart your development server after adding the key
- Check that the key starts with `re_`

**Error: "Invalid API key"**
- Verify the key is correct in Resend dashboard
- Make sure there are no extra spaces or quotes around the key
- Check that the key hasn't been revoked

## Need Help?

- Resend Documentation: https://resend.com/docs
- Resend API Keys: https://resend.com/api-keys

