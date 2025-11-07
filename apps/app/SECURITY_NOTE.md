# 🔒 Security Note: Database Connection String

## ⚠️ IMPORTANT

The `DATABASE_URL` in `.env.local` contains **sensitive credentials** including:
- Database password
- Database host and port
- Project reference

## ✅ Protection Measures

1. **`.gitignore` Protection:**
   - `.env.local` is excluded from git
   - Database connection string patterns are blocked
   - All `.env*` files are ignored

2. **Never Commit:**
   - ❌ Never commit `.env.local`
   - ❌ Never commit files containing `postgresql://` or `DATABASE_URL`
   - ❌ Never commit database passwords

3. **If Accidentally Committed:**
   - Immediately rotate the database password in Supabase
   - Remove the commit from git history
   - Update `.env.local` with new credentials

## 🔐 Best Practices

- Use environment variables in production (Vercel)
- Rotate passwords regularly
- Use different credentials for dev/staging/production
- Never share connection strings in chat, email, or documentation

## 📝 Current Configuration

- **Database:** Supabase PostgreSQL
- **Project Ref:** `hsypmyqtlxjwpnkkacmo`
- **Connection:** Configured in `apps/app/.env.local` (not in git)

