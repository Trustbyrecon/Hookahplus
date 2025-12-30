# Installing Terraform on Windows

Since you're on Windows, here are the installation options:

## Option 1: Using Chocolatey (Recommended - Easiest)

If you have Chocolatey package manager:

```bash
choco install terraform
```

If you don't have Chocolatey, install it first:
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

## Option 2: Using Scoop

If you have Scoop package manager:

```bash
scoop install terraform
```

## Option 3: Manual Installation

1. **Download Terraform:**
   - Go to: https://www.terraform.io/downloads
   - Download the Windows 64-bit zip file

2. **Extract and Install:**
   - Extract the zip file
   - Move `terraform.exe` to a folder in your PATH (e.g., `C:\Program Files\Terraform\`)
   - Or add the folder to your PATH environment variable

3. **Verify Installation:**
   ```bash
   terraform version
   ```

## Option 4: Using Winget (Windows 10/11)

```bash
winget install HashiCorp.Terraform
```

## Quick Setup After Installation

Once Terraform is installed:

```bash
cd terraform/sentry
terraform init
terraform plan
terraform apply
```

---

**Note:** The `brew` command is for macOS/Linux. On Windows, use one of the options above.

