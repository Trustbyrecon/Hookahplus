# ✅ Sentry Terraform Setup Complete

**Date:** 2025-01-28  
**Status:** Configuration files created, ready to apply

---

## 📦 What Was Created

All Terraform configuration files for Sentry alerts have been created:

1. ✅ **provider.tf** - Terraform provider configuration
2. ✅ **variables.tf** - Variable definitions
3. ✅ **alerts.tf** - All alert rule definitions
4. ✅ **terraform.tfvars** - Configuration with your auth token (git-ignored)
5. ✅ **terraform.tfvars.example** - Example template
6. ✅ **README.md** - Complete documentation
7. ✅ **setup.sh** - Automated setup script
8. ✅ **.gitignore** - Protects sensitive files

---

## 🎯 Alert Rules Configured

### Issue Alerts (Project-scoped)

1. **Critical Production Errors** (P0)
   - Projects: `hookahplus-app`, `hookahplus-guests`
   - Triggers: Every error in production
   - Frequency: Every occurrence
   - Actions: Email + Slack (if configured)

2. **New Issue Detected** (P2)
   - Projects: `hookahplus-app`, `hookahplus-guests`
   - Triggers: First occurrence of new issues
   - Frequency: Once per hour
   - Actions: Email

3. **Payment-Related Errors** (P0)
   - Project: `hookahplus-app`
   - Triggers: Errors tagged with `component=payment`
   - Frequency: Every occurrence
   - Actions: Email + Slack (if configured)

4. **Database Connection Errors** (P1)
   - Project: `hookahplus-app`
   - Triggers: Errors containing "database" in message
   - Frequency: Once per 5 minutes
   - Actions: Email

5. **Authentication Failures** (P2)
   - Project: `hookahplus-app`
   - Triggers: Errors containing "authentication" in message
   - Frequency: Once per hour
   - Actions: Email

---

## 🚀 Next Steps

### 1. Install Terraform

**Windows (You're on Windows):**

**Option A: Using Winget (Windows 10/11 - Easiest):**
```bash
winget install HashiCorp.Terraform
```

**Option B: Using Chocolatey:**
```bash
choco install terraform
```

**Option C: Manual Download:**
1. Go to: https://www.terraform.io/downloads
2. Download Windows 64-bit zip
3. Extract and add to PATH

**macOS:**
```bash
brew install terraform
```

**Linux:**
```bash
apt install terraform  # Ubuntu/Debian
```

**Verify installation:**
```bash
terraform version
```

See `INSTALL_TERRAFORM_WINDOWS.md` for detailed Windows instructions.

### 2. Initialize Terraform

```bash
cd terraform/sentry
terraform init
```

This will download the Sentry provider.

### 3. Review Planned Changes

```bash
terraform plan
```

This shows what alerts will be created without applying them.

### 4. Apply Configuration

```bash
terraform apply
```

Type `yes` when prompted to create the alerts.

**Or use the setup script:**
```bash
cd terraform/sentry
./setup.sh
```

---

## ✅ Verification

After applying, verify alerts in Sentry:

1. Go to: https://sentry.io/organizations/hookahplusnet/alerts/rules/
2. You should see all 5 alert rules created
3. Test an alert by triggering a test error

---

## 🔧 Configuration

Your auth token is already configured in `terraform.tfvars` (git-ignored).

To add Slack integration:
1. Set up Slack in Sentry Dashboard
2. Get workspace ID from Sentry → Settings → Integrations → Slack
3. Edit `terraform.tfvars`:
   ```hcl
   slack_workspace_id = "your-workspace-id"
   slack_channel      = "#hookahplus-alerts"
   ```
4. Run `terraform apply` again

---

## 📚 Documentation

See `README.md` for:
- Complete usage guide
- CI/CD integration examples
- Troubleshooting tips
- Adding new alerts

---

## 🔐 Security

- ✅ `terraform.tfvars` is git-ignored (contains auth token)
- ✅ Terraform state files are git-ignored
- ✅ Never commit sensitive files

---

**Status:** ✅ Ready to apply - just install Terraform and run `terraform init` + `terraform apply`

