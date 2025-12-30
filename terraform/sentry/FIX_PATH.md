# ✅ Terraform Working - PATH Fix Options

**Good News:** Terraform is installed and working! We just need to make it accessible via `terraform` command.

---

## ✅ Current Status

Terraform v1.14.3 is installed and working via the helper script:
```bash
cd terraform/sentry
bash use-terraform.sh version  # ✅ Works!
```

---

## 🚀 Quick Solution: Use Helper Script

**For now, use the helper script instead of `terraform` directly:**

```bash
cd terraform/sentry

# Instead of: terraform init
bash use-terraform.sh init

# Instead of: terraform plan  
bash use-terraform.sh plan

# Instead of: terraform apply
bash use-terraform.sh apply
```

The helper script automatically finds Terraform wherever it's installed.

---

## 🔧 Permanent Fix: Add to PATH

### Option 1: Add to Git Bash PATH (Session Only)

Add this to your `~/.bashrc` or `~/.bash_profile`:

```bash
# Add Terraform to PATH
export PATH="$PATH:/c/Users/$USER/AppData/Local/Microsoft/WinGet/Packages/HashiCorp.Terraform_*/terraform.exe"
```

Or find the exact path:
```bash
powershell.exe -Command "Get-Command terraform | Select-Object -ExpandProperty Source"
```

### Option 2: Add to System PATH (Permanent)

1. **Find Terraform location:**
   ```bash
   powershell.exe -Command "Get-Command terraform | Select-Object -ExpandProperty Source"
   ```

2. **Add to Windows PATH:**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to "Advanced" tab → "Environment Variables"
   - Under "System variables", find "Path" → "Edit"
   - Click "New" → Add the Terraform directory (without `terraform.exe`)
   - Click OK on all dialogs
   - **Restart terminal**

### Option 3: Create Alias (Easiest)

Add to `~/.bashrc`:

```bash
alias terraform='bash ~/Projects/Hookahplus/terraform/sentry/use-terraform.sh'
```

Then reload:
```bash
source ~/.bashrc
```

Now `terraform` command will work!

---

## ✅ Recommended: Use Helper Script

**For immediate use, just use the helper script:**

```bash
cd terraform/sentry
bash use-terraform.sh init
bash use-terraform.sh plan
bash use-terraform.sh apply
```

This works right now without any PATH changes!

---

## 🎯 Next Steps

1. **Initialize Terraform:**
   ```bash
   cd terraform/sentry
   bash use-terraform.sh init
   ```

2. **Review changes:**
   ```bash
   bash use-terraform.sh plan
   ```

3. **Apply configuration:**
   ```bash
   bash use-terraform.sh apply
   ```

---

**The helper script works perfectly - you can proceed with initialization now!** 🚀

