# Sentry Alerts Provisioning Script

**Status:** ✅ Ready to use

This script creates Sentry alert rules via the REST API. It's idempotent - safe to run multiple times.

---

## 🚀 Quick Start

### 1. Set Auth Token (Optional)

The script uses a hardcoded token, but you can override with environment variable:

```bash
export SENTRY_AUTH_TOKEN="your-token-here"
```

### 2. Run the Script

**Dry run (preview what will be created):**
```bash
npx tsx scripts/sentry-alerts.ts --dry-run
```

**Create alerts:**
```bash
npx tsx scripts/sentry-alerts.ts
```

---

## 📋 What Gets Created

The script creates **7 alert rules** across both projects:

### hookahplus-app (5 alerts):
1. **Critical Production Errors** (P0) - Every occurrence
2. **New Issue Detected** (P2) - Once per hour
3. **Payment-Related Errors** (P0) - Every occurrence
4. **Database Connection Errors** (P1) - Once per 5 minutes
5. **Authentication Failures** (P2) - Once per hour

### hookahplus-guests (2 alerts):
1. **Critical Production Errors** (P0) - Every occurrence
2. **New Issue Detected** (P2) - Once per hour

---

## 🔧 Configuration

Edit `scripts/sentry-alerts.ts` to modify alert configurations:

- Change conditions
- Add/remove actions
- Modify frequency
- Add Slack integration

---

## ✅ Idempotent

The script is **idempotent** - safe to run multiple times:
- Checks if alert already exists before creating
- Skips existing alerts
- Only creates new ones

---

## 🔍 Verification

After running, verify alerts at:
- https://sentry.io/organizations/hookahplusnet/alerts/rules/

---

## 📝 Adding Slack Integration

To add Slack notifications, edit the script and add to actions:

```typescript
actions: [
  {
    id: 'sentry.rules.actions.notify_event_service.NotifyEventServiceAction',
    service: 'email'
  },
  {
    id: 'sentry.integrations.slack.notify_action.SlackNotifyServiceAction',
    workspace: 'your-slack-workspace-id',
    channel: '#hookahplus-alerts'
  }
]
```

Get workspace ID from: Sentry → Settings → Integrations → Slack

---

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Provision Sentry Alerts

on:
  push:
    branches: [main]
    paths:
      - 'scripts/sentry-alerts.ts'

jobs:
  provision-alerts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Provision Sentry Alerts
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
        run: npx tsx scripts/sentry-alerts.ts
```

---

## 🆘 Troubleshooting

### Auth Token Error

- Verify token is valid: https://sentry.io/settings/account/api/auth-tokens/
- Check token has required scopes: `project:read`, `project:write`

### Project Not Found

- Verify project slugs: `hookahplus-app`, `hookahplus-guests`
- Check organization slug: `hookahplusnet`

### Network Errors

- Check internet connection
- Verify Sentry API is accessible
- Check firewall/proxy settings

---

## 📚 API Documentation

- [Sentry Issue Alert Rules API](https://docs.sentry.io/api/alerts/create-an-issue-alert-rule-for-a-project/)
- [Sentry Alert Conditions](https://docs.sentry.io/product/alerts/alert-rules/conditions/)
- [Sentry Alert Actions](https://docs.sentry.io/product/alerts/alert-rules/actions/)

---

**Ready to use! Run `npx tsx scripts/sentry-alerts.ts` to create all alerts.** 🎯

