# 🚀 Quick Start - Apply Sentry Alerts

**Status:** ✅ Terraform initialized, ready to apply!

---

## ✅ Ready to Go!

Terraform is initialized and ready. Use the helper script to run Terraform commands.

---

## 📋 Next Steps

### 1. Review Planned Changes

```bash
cd terraform/sentry
bash use-terraform.sh plan
```

This shows what alerts will be created (without applying them).

### 2. Apply Configuration

```bash
bash use-terraform.sh apply
```

Type `yes` when prompted to create all the alerts.

---

## 💡 Using Terraform Commands

**Use the helper script instead of `terraform` directly:**

```bash
# Instead of: terraform plan
bash use-terraform.sh plan

# Instead of: terraform apply
bash use-terraform.sh apply

# Instead of: terraform destroy
bash use-terraform.sh destroy
```

The helper script automatically finds Terraform wherever it's installed.

**Want to fix PATH permanently?** See `FIX_PATH.md` for options.

---

## ✅ What Will Be Created

After applying, you'll have **5 alert rules** across both projects:

1. **Critical Production Errors** (P0) - Both projects
2. **New Issue Detected** (P2) - Both projects  
3. **Payment-Related Errors** (P0) - App project
4. **Database Connection Errors** (P1) - App project
5. **Authentication Failures** (P2) - App project

---

## 🔍 Verify in Sentry

After applying, check:
- https://sentry.io/organizations/hookahplusnet/alerts/rules/

All alerts should appear there!

---

## 🆘 Troubleshooting

**If `terraform` command not found after restart:**
- Try: `refreshenv` (if using Chocolatey)
- Or manually add to PATH: `C:\Program Files\Terraform\`

**If you get provider errors:**
- Make sure you're in `terraform/sentry/` directory
- Run `terraform init` again

---

**Ready? Restart your terminal and run the commands above!** 🎯

