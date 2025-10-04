# HookahPlus Deployment Guide

## Environment Variables Required

The following environment variables must be set in your Vercel deployment:

### Supabase Configuration
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### Stripe Configuration  
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret

### Next.js Configuration
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `NEXTAUTH_URL` - Your production URL

### Database
- `DATABASE_URL` - Your PostgreSQL connection string

## Setting Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable with the appropriate value
5. Redeploy your project

## Local Development

Create a `.env.local` file with the same variables for local development.

## Build Status

✅ TypeScript compilation successful
✅ All type errors resolved
⚠️ Environment variables needed for production build
