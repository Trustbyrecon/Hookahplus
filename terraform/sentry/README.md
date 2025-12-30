# Sentry Alerts - Infrastructure as Code

This directory contains Terraform configuration for managing Sentry alerts as infrastructure as code.

## 🎯 Overview

This Terraform setup automatically provisions all recommended Sentry alert rules for HookahPlus projects:
- **Issue Alerts** (project-scoped): Critical errors, new issues, payment errors, database errors
- **Metric Alerts** (organization-scoped): Error rate spikes, performance degradation

## 📋 Prerequisites

1. **Terraform installed** (>= 1.0)
   ```bash
   # macOS
   brew install terraform
   
   # Or download from https://www.terraform.io/downloads
   ```

2. **Sentry Auth Token** ✅ (Already configured)
   - Token is stored in `terraform.tfvars` (git-ignored)
   - Token has required scopes: `org:read`, `project:read`, `project:write`

3. **Optional: Slack Integration**
   - Set up Slack integration in Sentry first
   - Get the workspace ID from Sentry → Settings → Integrations → Slack
   - Add to `terraform.tfvars`

## 🚀 Quick Start

### Initial Setup

1. **Initialize Terraform:**
   ```bash
   cd terraform/sentry
   terraform init
   ```

2. **Review planned changes:**
   ```bash
   terraform plan
   ```

3. **Apply configuration:**
   ```bash
   terraform apply
   ```

### Using the Setup Script

```bash
cd terraform/sentry
./setup.sh
```

## 📊 Alert Rules Created

### Issue Alerts (Project-scoped)

#### 1. Critical Production Errors (P0)
- **Projects:** `hookahplus-app`, `hookahplus-guests`
- **Triggers:** Every error in production
- **Frequency:** Every occurrence
- **Actions:** Email + Slack (if configured)

#### 2. New Issue Detected (P2)
- **Projects:** `hookahplus-app`, `hookahplus-guests`
- **Triggers:** First occurrence of new issues
- **Frequency:** Once per hour
- **Actions:** Email

#### 3. Payment-Related Errors (P0)
- **Project:** `hookahplus-app`
- **Triggers:** Errors tagged with `component=payment`
- **Frequency:** Every occurrence
- **Actions:** Email + Slack (if configured)

#### 4. Database Connection Errors (P1)
- **Project:** `hookahplus-app`
- **Triggers:** Errors containing "database" in message
- **Frequency:** Once per 5 minutes
- **Actions:** Email

#### 5. Authentication Failures (P2)
- **Project:** `hookahplus-app`
- **Triggers:** Errors containing "authentication" in message
- **Frequency:** Once per hour
- **Actions:** Email

## 🔧 Configuration

### Variables

Edit `terraform.tfvars` to customize:

- `sentry_auth_token`: Your Sentry API token (already set)
- `sentry_org`: Organization slug (default: `hookahplusnet`)
- `slack_workspace_id`: Optional Slack integration ID
- `slack_channel`: Slack channel for alerts (default: `#hookahplus-alerts`)
- `alert_email_recipients`: Custom email recipients (optional)

### Adding New Alerts

Edit `alerts.tf` to add new alert rules. Follow the existing patterns:

```hcl
resource "sentry_rule" "my_new_alert" {
  organization = var.sentry_org
  project      = "hookahplus-app"
  name         = "My New Alert"
  action_match = "all"
  frequency    = 60 # Once per hour

  conditions {
    # Add conditions here
  }

  actions {
    id      = "sentry.rules.actions.notify_event_service.NotifyEventServiceAction"
    service = "email"
  }
}
```

## 🔄 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/sentry-alerts.yml`:

```yaml
name: Apply Sentry Alerts

on:
  push:
    branches: [main]
    paths:
      - 'terraform/sentry/**'

jobs:
  apply-alerts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.5.0
      
      - name: Terraform Init
        working-directory: terraform/sentry
        run: terraform init
      
      - name: Terraform Plan
        working-directory: terraform/sentry
        env:
          TF_VAR_sentry_auth_token: ${{ secrets.SENTRY_AUTH_TOKEN }}
        run: terraform plan
      
      - name: Terraform Apply
        working-directory: terraform/sentry
        env:
          TF_VAR_sentry_auth_token: ${{ secrets.SENTRY_AUTH_TOKEN }}
        run: terraform apply -auto-approve
```

### Manual Application

```bash
# From project root
cd terraform/sentry
terraform init
terraform plan
terraform apply
```

## 📝 Updating Alerts

1. **Edit `alerts.tf`** with your changes
2. **Review changes:**
   ```bash
   terraform plan
   ```
3. **Apply changes:**
   ```bash
   terraform apply
   ```

## 🗑️ Removing Alerts

To remove an alert, delete the resource from `alerts.tf` and run:
```bash
terraform apply
```

## 🔍 Verification

After applying, verify alerts in Sentry:

1. Go to https://sentry.io/organizations/hookahplusnet/alerts/rules/
2. Check that all alert rules are created
3. Test an alert by triggering a test error

## 🐛 Troubleshooting

### Provider Authentication Error

- Verify your `sentry_auth_token` in `terraform.tfvars`
- Check token has required scopes: `org:read`, `project:read`, `project:write`
- Regenerate token if needed: https://sentry.io/settings/account/api/auth-tokens/

### Project Not Found

- Verify project slugs match exactly: `hookahplus-app`, `hookahplus-guests`
- Check organization slug: `hookahplusnet`
- Verify projects exist in Sentry dashboard

### Slack Integration Not Working

- Set up Slack integration in Sentry Dashboard first
- Get workspace ID from Sentry → Settings → Integrations → Slack
- Add to `terraform.tfvars`: `slack_workspace_id = "your-workspace-id"`

### Terraform Provider Issues

If you get provider errors, try:
```bash
terraform init -upgrade
```

## 📚 Resources

- [Sentry Terraform Provider Docs](https://registry.terraform.io/providers/jianyuan/sentry/latest/docs)
- [Sentry Alert Rules API](https://docs.sentry.io/api/alerts/)
- [Sentry Alert Conditions](https://docs.sentry.io/product/alerts/alert-rules/)
- [Terraform Documentation](https://www.terraform.io/docs)

## 🔐 Security Notes

- `terraform.tfvars` is git-ignored (contains sensitive token)
- Never commit `terraform.tfvars` to version control
- Use environment variables or secrets management in CI/CD
- Rotate tokens regularly

## ✅ Status

- ✅ Terraform configuration created
- ✅ Auth token configured
- ⏳ Ready to initialize and apply

**Next Steps:**
1. Run `terraform init` in `terraform/sentry/`
2. Run `terraform plan` to review changes
3. Run `terraform apply` to create alerts

