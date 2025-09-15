# 🗄️ Supabase Database Setup Guide

## Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Click "New Project"
   - Choose your organization
   - Enter project details:
     - **Name**: `hookahplus-mvp`
     - **Database Password**: Generate a strong password
     - **Region**: Choose closest to your users

2. **Wait for Project Creation**
   - This takes 2-3 minutes
   - Note down the project URL and API keys

## Step 2: Deploy Database Schema

1. **Open SQL Editor**
   - Go to your project dashboard
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

2. **Run the Schema**
   - Copy the contents of `scripts/migrations/supabase-schema.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

3. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `venues`
     - `staff`
     - `sessions`
     - `refills`
     - `reservations`
     - `ghostlog`

## Step 3: Get API Keys

1. **Go to Settings > API**
   - Copy the **Project URL**
   - Copy the **anon/public key**
   - Copy the **service_role key** (for server-side operations)

2. **Update Environment Variables**
   - Add these to your Vercel project settings
   - Or update your local `.env.local` file

## Step 4: Test Connection

1. **Test Database Connection**
   ```bash
   # Test with curl
   curl -X POST 'YOUR_SUPABASE_URL/rest/v1/sessions' \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"venue_id": "550e8400-e29b-41d4-a716-446655440000", "table_id": "T-001", "tier": "base"}'
   ```

2. **Verify Data**
   - Check that the test venue and staff were created
   - Verify RLS policies are active

## Step 5: Configure RLS Policies

The schema includes basic RLS policies, but you may need to adjust them based on your authentication setup:

1. **For Development**: You can temporarily disable RLS for testing
2. **For Production**: Ensure proper JWT claims are set

## Troubleshooting

### Common Issues:
- **Permission Denied**: Check RLS policies
- **Connection Failed**: Verify API keys and URL
- **Schema Errors**: Check for typos in the SQL

### Support:
- Supabase Docs: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions
