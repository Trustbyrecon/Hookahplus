# 🔔 Sentry Alerts Configuration Guide

**Date:** 2025-01-27  
**Status:** Ready to Configure

---

## 📋 Overview

This guide helps you configure Sentry alerts to get notified when errors occur in production. You can set up alerts for:
- **Issue Alerts**: Notify when specific errors occur
- **Metric Alerts**: Notify based on error rates or performance thresholds
- **Spike Alerts**: Notify when error volume suddenly increases

---

## 🎯 Recommended Alert Rules

### 1. Critical Errors (P0 - Immediate Action)

**When:** Any new error in production  
**Action:** Email + Slack (if configured)  
**Frequency:** Every occurrence

**Setup Steps:**
1. Go to Sentry Dashboard → **Alerts** → **Create Alert Rule**
2. Select **Issue Alert**
3. Configure:
   - **Name:** `Critical Production Errors`
   - **Conditions:**
     - Environment: `production` (or `vercel-production`)
     - Issue Level: `error` or `fatal`
   - **Actions:**
     - Send email notification
     - (Optional) Send to Slack webhook
   - **Frequency:** Every occurrence
4. Click **Save Alert Rule**

---

### 2. Error Rate Spike (P1 - High Priority)

**When:** Error rate increases by 50% in 5 minutes  
**Action:** Email notification  
**Frequency:** Once per 10 minutes

**Setup Steps:**
1. Go to **Alerts** → **Create Alert Rule**
2. Select **Metric Alert**
3. Configure:
   - **Name:** `Error Rate Spike`
   - **Metric:** Events per minute
   - **Condition:** Increase by 50% in 5 minutes
   - **Environment:** `production`
   - **Actions:** Email notification
   - **Frequency:** Once per 10 minutes
4. Click **Save Alert Rule**

---

### 3. New Issue Detection (P2 - Medium Priority)

**When:** New issue is created  
**Action:** Email notification  
**Frequency:** Once per hour

**Setup Steps:**
1. Go to **Alerts** → **Create Alert Rule**
2. Select **Issue Alert**
3. Configure:
   - **Name:** `New Issue Detected`
   - **Conditions:**
     - Environment: `production`
     - Issue is: `new` (first occurrence)
   - **Actions:** Email notification
   - **Frequency:** Once per hour
4. Click **Save Alert Rule**

---

### 4. Performance Degradation (P2 - Medium Priority)

**When:** P95 response time > 2 seconds  
**Action:** Email notification  
**Frequency:** Once per 15 minutes

**Setup Steps:**
1. Go to **Alerts** → **Create Alert Rule**
2. Select **Metric Alert**
3. Configure:
   - **Name:** `Performance Degradation`
   - **Metric:** P95 Transaction Duration
   - **Condition:** > 2000ms (2 seconds)
   - **Environment:** `production`
   - **Actions:** Email notification
   - **Frequency:** Once per 15 minutes
4. Click **Save Alert Rule**

---

## 🔧 Alert Configuration Details

### Issue Alert Conditions

**Common Conditions:**
- **Environment:** Filter by `production`, `preview`, `development`
- **Issue Level:** `error`, `warning`, `fatal`
- **Issue Tags:** Filter by component, action, user role, etc.
- **Issue Status:** `new`, `unresolved`, `escalating`

**Example Advanced Condition:**
```
Environment is production
AND Issue level is error or fatal
AND Issue tag "component" is one of: payment, checkout, session
```

---

### Metric Alert Conditions

**Common Metrics:**
- **Events per minute**: Error volume
- **P50/P95/P99 Transaction Duration**: Performance
- **Apdex Score**: User satisfaction
- **Error Rate**: Percentage of failed transactions

**Example Thresholds:**
- Error rate > 1% of transactions
- P95 duration > 2 seconds
- Events per minute > 10

---

### Alert Actions

**Available Actions:**
1. **Email Notification**
   - Sent to project members
   - Can customize recipients per alert

2. **Slack Integration**
   - Requires Slack webhook URL
   - Real-time notifications in Slack channel

3. **PagerDuty Integration**
   - For on-call rotations
   - Escalation policies

4. **Microsoft Teams Integration**
   - Team channel notifications

5. **Webhook**
   - Custom integrations
   - Trigger external systems

---

## 📧 Email Notification Setup

**Default Behavior:**
- Sent to all project members
- Includes error details, stack trace, user context

**Customize Recipients:**
1. Go to **Alerts** → Select alert rule
2. Click **Edit**
3. Under **Actions**, click **Add Action**
4. Select **Send Email**
5. Choose recipients:
   - All project members (default)
   - Specific team members
   - Custom email addresses

---

## 🔗 Slack Integration

### Setup Steps

1. **Create Slack Webhook:**
   - Go to Slack → Your workspace → Apps → Incoming Webhooks
   - Click **Add to Slack**
   - Choose channel (e.g., `#alerts` or `#engineering`)
   - Copy webhook URL

2. **Add to Sentry:**
   - Go to Sentry → **Settings** → **Integrations**
   - Find **Slack** → Click **Configure**
   - Paste webhook URL
   - Select projects to monitor
   - Click **Save**

3. **Add to Alert Rule:**
   - Edit alert rule
   - Under **Actions**, click **Add Action**
   - Select **Send to Slack**
   - Choose channel
   - Click **Save**

---

## 🎛️ Alert Frequency & Throttling

**Frequency Options:**
- **Every occurrence**: Get notified for every error (use sparingly)
- **Once per minute**: Max 1 notification per minute
- **Once per 5 minutes**: Max 1 notification per 5 minutes
- **Once per hour**: Max 1 notification per hour
- **Once per day**: Max 1 notification per day

**Best Practices:**
- **Critical errors**: Every occurrence or once per minute
- **Error spikes**: Once per 5-10 minutes
- **New issues**: Once per hour
- **Performance alerts**: Once per 15 minutes

---

## 🌍 Environment-Specific Alerts

### Production-Only Alerts

**Recommended:** Set up separate alerts for production vs. development

**Production Alert Example:**
```
Environment is production
AND Issue level is error or fatal
```

**Development Alert Example:**
```
Environment is development
AND Issue level is fatal only
```

This prevents development noise from flooding your inbox.

---

## 🏷️ Tag-Based Filtering

**Use Tags to Filter Alerts:**

Common tags in your app:
- `component`: `payment`, `session`, `checkout`, `refill`
- `action`: `create`, `update`, `delete`, `process`
- `userRole`: `operator`, `admin`, `customer`
- `environment`: `production`, `preview`, `development`

**Example Tag-Based Alert:**
```
Environment is production
AND Tag "component" is payment
AND Issue level is error or fatal
```

This alerts only for payment-related errors in production.

---

## 📊 Alert Dashboard

**View All Alerts:**
- Go to **Alerts** → **Alert Rules**
- See all configured alerts
- View alert history and triggers

**Alert Status:**
- ✅ **Active**: Alert is enabled and monitoring
- ⏸️ **Paused**: Alert is temporarily disabled
- ❌ **Disabled**: Alert is turned off

---

## 🧪 Testing Alerts

**Test Alert Rule:**
1. Go to **Alerts** → Select alert rule
2. Click **Test Alert**
3. Sentry will send a test notification
4. Verify you receive it

**Trigger Test Error:**
1. Visit test endpoint: `/api/test-sentry`
2. Check Sentry dashboard for new issue
3. Verify alert triggers (if conditions match)
4. Check email/Slack for notification

---

## ✅ Recommended Alert Checklist

- [ ] Critical production errors (every occurrence)
- [ ] Error rate spike (once per 10 minutes)
- [ ] New issue detection (once per hour)
- [ ] Performance degradation (once per 15 minutes)
- [ ] Payment-related errors (every occurrence in production)
- [ ] Database connection errors (once per 5 minutes)
- [ ] Authentication failures (once per hour)

---

## 🔗 Quick Links

- **Sentry Alerts:** https://hookahplusnet.sentry.io/alerts/rules/
- **Sentry Integrations:** https://hookahplusnet.sentry.io/settings/integrations/
- **Sentry Documentation:** https://docs.sentry.io/product/alerts/

---

## 📝 Notes

- **Start Conservative**: Begin with fewer, more critical alerts
- **Adjust Over Time**: Add more alerts as you learn what's important
- **Review Regularly**: Check alert effectiveness monthly
- **Disable Noisy Alerts**: If an alert triggers too often, adjust conditions or disable it

---

**Last Updated:** 2025-01-27

