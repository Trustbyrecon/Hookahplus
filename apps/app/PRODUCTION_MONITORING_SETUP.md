# Production Monitoring & Alerting Setup

**Date:** 2025-01-27  
**Status:** ✅ Complete  
**Phase:** Production Readiness

---

## 🎯 Overview

This document provides setup instructions for production monitoring, alerting, and observability for HookahPlus.

---

## ✅ Components Implemented

### 1. Error Tracking (Sentry) ✅

**Status:** Configured and enhanced

**Configuration Files:**
- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `next.config.js` - Sentry webpack integration

**Features:**
- ✅ Error tracking with stack traces
- ✅ Performance monitoring (10% sample rate in production)
- ✅ Session Replay (100% on errors, 10% on normal sessions)
- ✅ Release tracking for better error grouping
- ✅ Automatic filtering of health checks and noise

**Setup Steps:**

1. **Get Sentry DSN:**
   - Go to https://sentry.io
   - Create a project or select existing project
   - Copy the DSN from Settings → Client Keys (DSN)

2. **Set Environment Variables in Vercel:**
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
   SENTRY_ORG=your-org-name (optional, for source maps)
   SENTRY_PROJECT=your-project-name (optional, for source maps)
   SENTRY_AUTH_TOKEN=your-auth-token (optional, for source maps)
   ```

3. **Verify Setup:**
   - Deploy to production
   - Trigger a test error
   - Check Sentry dashboard for the error

**Documentation:**
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

### 2. Structured Logging (Pino) ✅

**Status:** Upgraded from custom logger to Pino

**Configuration Files:**
- `lib/logger-pino.ts` - Pino-based logger implementation
- `lib/logger.ts` - Backward-compatible wrapper

**Features:**
- ✅ Fast, low-overhead logging
- ✅ JSON output for log aggregation
- ✅ Pretty printing in development
- ✅ Log levels: debug, info, warn, error
- ✅ Child loggers with context

**Environment Variables:**
```bash
LOG_LEVEL=info  # debug, info, warn, error (default: info in production, debug in development)
STRUCTURED_LOGGING=true  # Force JSON output even in development
```

**Usage:**
```typescript
import { logger } from '@/lib/logger';

logger.info('User logged in', { userId: '123', component: 'auth' });
logger.error('Database connection failed', { component: 'database' }, error);
```

**Log Aggregation Setup:**

#### Option A: Vercel Logs (Built-in)
- Vercel automatically collects logs from serverless functions
- View logs in Vercel Dashboard → Deployments → Logs
- Logs are available for 30 days (Pro plan) or 7 days (Hobby plan)

#### Option B: Datadog
1. Install Datadog agent or use Datadog Log Management
2. Configure log forwarding from Vercel
3. Set up log parsing for JSON logs

#### Option C: LogRocket
1. Sign up at https://logrocket.com
2. Install LogRocket SDK (if needed for client-side)
3. Configure server-side log forwarding

#### Option D: ELK Stack (Self-hosted)
1. Set up Elasticsearch, Logstash, and Kibana
2. Configure log forwarding from Vercel
3. Set up log parsing for JSON logs

---

### 3. Monitoring Dashboards

#### A. Vercel Analytics ✅

**Setup Steps:**

1. **Enable Vercel Analytics:**
   - Go to Vercel Dashboard → Project Settings → Analytics
   - Enable Web Analytics (free tier available)
   - Enable Speed Insights (optional, for performance metrics)

2. **View Analytics:**
   - Navigate to Vercel Dashboard → Analytics
   - View page views, unique visitors, top pages
   - Monitor performance metrics (if Speed Insights enabled)

**Features:**
- Real-time analytics
- Page view tracking
- Performance metrics
- Geographic distribution

**Documentation:**
- [Vercel Analytics Docs](https://vercel.com/docs/analytics)

#### B. Uptime Monitoring

**Recommended Services:**

1. **UptimeRobot (Free tier available)**
   - Sign up at https://uptimerobot.com
   - Add monitor:
     - Type: HTTP(s)
     - URL: `https://your-app.vercel.app/api/health/ready`
     - Interval: 5 minutes
   - Set up alerts (email, SMS, Slack, etc.)

2. **Pingdom**
   - Sign up at https://pingdom.com
   - Add check:
     - URL: `https://your-app.vercel.app/api/health/ready`
     - Interval: 1 minute
   - Set up alerts

3. **Better Uptime**
   - Sign up at https://betteruptime.com
   - Add monitor:
     - URL: `https://your-app.vercel.app/api/health/ready`
     - Interval: 1 minute
   - Set up alerts

**Health Check Endpoints:**
- `/api/health/live` - Liveness check (server running)
- `/api/health/ready` - Readiness check (can serve traffic) ⭐ **Use this for uptime monitoring**
- `/api/health` - Legacy endpoint (backward compatibility)

#### C. Database Monitoring (Supabase)

**Setup Steps:**

1. **Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Navigate to Database → Monitoring
   - View:
     - Connection pool usage
     - Query performance
     - Database size
     - Active connections

2. **Set Up Alerts:**
   - Go to Settings → Database
   - Configure connection pool limits
   - Set up email alerts for:
     - High connection usage (>80%)
     - Slow queries (>1s)
     - Database size warnings

**Recommended Monitoring:**
- Connection pool usage (should stay <80%)
- Query performance (P95 <500ms)
- Database size (monitor growth)
- Active connections (should stay within pool limits)

---

### 4. Health Check Alerts

**Health Check Endpoints:**

| Endpoint | Purpose | Status Codes |
|----------|---------|--------------|
| `/api/health/live` | Liveness probe | 200 = alive |
| `/api/health/ready` | Readiness probe | 200 = ready, 503 = not ready |
| `/api/health` | Legacy endpoint | 200 = ok, 503 = down |

**Alert Configuration:**

#### A. UptimeRobot Setup

1. **Create Monitor:**
   - Type: HTTP(s)
   - URL: `https://your-app.vercel.app/api/health/ready`
   - Interval: 5 minutes
   - Alert Contacts: Add your email/Slack

2. **Alert Conditions:**
   - Alert when: Down for 2 consecutive checks
   - Recovery alert: When back up

#### B. Pingdom Setup

1. **Create Check:**
   - Type: HTTP
   - URL: `https://your-app.vercel.app/api/health/ready`
   - Interval: 1 minute
   - Expected status: 200

2. **Alert Configuration:**
   - Alert when: Down for 1 minute
   - Recovery alert: When back up
   - Notification channels: Email, SMS, Slack

#### C. Custom Alert Script (Optional)

Create a simple monitoring script:

```bash
#!/bin/bash
# health-check-monitor.sh

URL="https://your-app.vercel.app/api/health/ready"
ALERT_EMAIL="your-email@example.com"

response=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $response -ne 200 ]; then
  echo "Health check failed: $response" | mail -s "Alert: App Health Check Failed" $ALERT_EMAIL
fi
```

Run via cron:
```bash
# Check every 5 minutes
*/5 * * * * /path/to/health-check-monitor.sh
```

**Recommended Alert Thresholds:**

- **Critical:** Health check down for >2 minutes
- **Warning:** Health check response time >2s
- **Info:** Health check response time >1s

---

### 5. Database Connection Pooling ✅

**Status:** Configured and optimized

**Configuration Files:**
- `lib/database/connectionPool.ts` - Connection pool configuration
- `lib/db.ts` - Prisma client with pool settings

**Current Settings:**

```typescript
// Default pool configuration
maxConnections: 10
minConnections: 2
connectionTimeout: 10000ms (10s)
idleTimeout: 30000ms (30s)
queryTimeout: 5000ms (5s)
```

**Environment Variables:**

```bash
# Connection pool settings
DATABASE_POOL_MAX=10        # Maximum connections
DATABASE_POOL_MIN=2         # Minimum connections
DATABASE_POOL_TIMEOUT=10000  # Connection timeout (ms)
DATABASE_POOL_IDLE_TIMEOUT=30000  # Idle timeout (ms)
```

**Supabase Connection Pooler:**

For Vercel serverless functions, use Supabase's connection pooler:

1. **Get Pooler URL:**
   - Go to Supabase Dashboard → Settings → Database
   - Scroll to "Connection Pooling"
   - Copy "Session Mode" connection string
   - Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require`

2. **Set DATABASE_URL in Vercel:**
   - Use the pooler URL (port 6543) instead of direct connection (port 5432)
   - This prevents connection limit issues with serverless functions

**Monitoring Connection Pool:**

1. **Supabase Dashboard:**
   - Go to Database → Monitoring
   - View "Connection Pool" metrics
   - Monitor active connections vs. pool size

2. **Application Logs:**
   - Monitor for connection timeout errors
   - Watch for "too many connections" errors
   - Track connection pool usage

**Optimization Recommendations:**

- **For low traffic:** Keep default settings (max 10 connections)
- **For medium traffic:** Increase to max 20-30 connections
- **For high traffic:** Consider read replicas and increase pool size

**Troubleshooting:**

- **"Too many connections" error:**
  - Increase `DATABASE_POOL_MAX`
  - Check for connection leaks (connections not being closed)
  - Consider using connection pooler (Supabase pooler recommended)

- **Slow queries:**
  - Check query performance in Supabase dashboard
  - Add database indexes for frequently queried columns
  - Optimize query patterns

---

## 📊 Monitoring Checklist

### Pre-Launch
- [ ] Sentry DSN configured in Vercel
- [ ] Health check endpoints tested
- [ ] Uptime monitoring configured
- [ ] Database connection pooler URL set
- [ ] Log aggregation configured (if using external service)

### Post-Launch
- [ ] Verify Sentry is receiving errors
- [ ] Verify uptime monitoring is working
- [ ] Check database connection pool usage
- [ ] Review application logs
- [ ] Set up alert notifications

---

## 🚨 Alert Thresholds

### Critical Alerts (Immediate Action Required)
- Health check down for >2 minutes
- Database connection failures
- Error rate >5% for 5 minutes
- P95 response time >2s for 10 minutes

### Warning Alerts (Monitor Closely)
- Health check response time >1s
- Database connection pool usage >80%
- Error rate >2% for 5 minutes
- P95 response time >1s for 10 minutes

### Info Alerts (For Awareness)
- Health check response time >500ms
- Database connection pool usage >60%
- Unusual traffic patterns
- New error types appearing

---

## 📚 Additional Resources

- [Sentry Documentation](https://docs.sentry.io)
- [Pino Documentation](https://getpino.io)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

---

**Last Updated:** 2025-01-27  
**Status:** ✅ Production Ready

