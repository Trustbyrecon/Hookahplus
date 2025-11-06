# Local Development Workflow Guide

## Overview

This guide outlines the local development setup for the Hookah+ monorepo, including standardized ports and Vercel cost control strategies.

## Port Configuration

The local development servers use the following standardized ports:

| Application | Port | URL | Description |
|------------|------|-----|-------------|
| **Site** | 3000 | http://localhost:3000 | Marketing/public website |
| **Guest** | 3001 | http://localhost:3001 | Guest-facing application |
| **App** | 3002 | http://localhost:3002 | Operator/admin application |

## Starting Local Development Servers

### Start All Servers (Recommended)

From the project root, run:

```bash
npm run dev:all
```

This will start all three servers concurrently:
- Site on port 3000
- Guest on port 3001  
- App on port 3002

### Start Individual Servers

If you only need to work on a specific application:

```bash
# Start Site only
npm run dev:site

# Start Guest only
npm run dev:guest

# Start App only
npm run dev:app
```

Or navigate to the specific app directory:

```bash
# Site
cd apps/site && npm run dev

# Guest
cd apps/guest && npm run dev

# App
cd apps/app && npm run dev
```

## Quick Access Links

Once servers are running, access:

- **Site**: http://localhost:3000
- **Guest**: http://localhost:3001
- **App**: http://localhost:3002
- **Admin Control Center**: http://localhost:3002/admin
- **Operator Onboarding**: http://localhost:3002/admin/operator-onboarding

## Vercel Cost Control: Disable Auto-Deployments

To reduce Vercel build costs and prevent unnecessary builds during development, disable automatic deployments. This allows you to QA locally first, then manually deploy when ready.

### Step-by-Step: Disable Auto-Deployments

#### For Each Project (Guest, App, Site):

1. **Navigate to Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select your project (Guest, App, or Site)

2. **Access Project Settings**
   - Click on your project
   - Go to **Settings** tab
   - Click **Git** in the left sidebar

3. **Disable Automatic Deployments**
   - Scroll to **Deploy Hooks** section
   - Find **Automatic Deployments** toggle
   - **Disable** the toggle for:
     - Production Branch (main/master)
     - Preview Deployments (optional, but recommended)
   - Click **Save**

4. **Enable Manual Deployments**
   - In the same **Git** settings
   - Ensure **Manual Deployments** option is available
   - You can now deploy manually from:
     - Vercel Dashboard → Deployments → **Deploy** button
     - Vercel CLI: `vercel --prod`
     - Git tags (if configured)

### Projects to Configure

Repeat the above steps for all three projects:

1. **Guest App Project**
   - Project name: `hookahplus-guest` (or your project name)
   - Disable auto-deployments for production branch

2. **App Build Project**
   - Project name: `hookahplus-app` (or your project name)
   - Disable auto-deployments for production branch

3. **Site Build Project**
   - Project name: `hookahplus-site` (or your project name)
   - Disable auto-deployments for production branch

## Manual Deployment Workflow

Once auto-deployments are disabled, follow this workflow:

### 1. Local Development & QA
```bash
# Start all local servers
npm run dev:all

# Test your changes locally
# - Site: http://localhost:3000
# - Guest: http://localhost:3001
# - App: http://localhost:3002
```

### 2. Commit Changes
```bash
git add .
git commit -m "Your commit message"
git push origin your-branch
```

**Note:** Pushing to Git will NOT trigger Vercel builds (auto-deployments disabled)

### 3. Manual Deployment (When Ready)

#### Option A: Vercel Dashboard
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Click **Deploy** button
4. Select branch and click **Deploy**

#### Option B: Vercel CLI
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy to production
vercel --prod

# Or deploy specific project
cd apps/site && vercel --prod
cd apps/guest && vercel --prod
cd apps/app && vercel --prod
```

#### Option C: Git Tags (Advanced)
```bash
# Create a release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Configure Vercel to deploy on tags (optional)
# Settings → Git → Deploy Hooks → Add tag-based hook
```

## Benefits of This Workflow

### Cost Savings
- **No automatic builds** = No build minutes consumed during development
- **Manual control** = Deploy only when ready to QA in production
- **Reduced errors** = Fix build errors locally before deploying

### Development Efficiency
- **Faster iteration** = Test changes instantly on localhost
- **No waiting** = No need to wait for Vercel builds to see changes
- **Better debugging** = Local environment easier to debug than Vercel logs

### Quality Control
- **Local QA first** = Catch issues before deploying
- **Controlled releases** = Deploy when you're confident
- **Less back-and-forth** = Fewer failed builds = less credit usage

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Concurrently Not Found

If `npm run dev:all` fails:

```bash
npm install concurrently --save-dev
```

### Server Won't Start

1. Check if port is available
2. Verify Node.js version (requires Node 18+)
3. Clear `.next` folders:
   ```bash
   npm run clean
   ```

## Additional Resources

- [Vercel Cost Optimization Guide](./VERCEL_COST_OPTIMIZATION_GUIDE.md)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments)
- [Next.js Development Documentation](https://nextjs.org/docs/getting-started)

## Summary

- **Local Ports**: Site (3000), Guest (3001), App (3002)
- **Start All**: `npm run dev:all`
- **Vercel**: Disable auto-deployments → Deploy manually when ready
- **Workflow**: Develop locally → QA locally → Deploy manually → Test in production

