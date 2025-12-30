#!/bin/bash
# Helper script to find and use Terraform on Windows

# Try to find terraform.exe in common locations
TERRAFORM_PATH=""

# Check if terraform is in PATH
if command -v terraform &> /dev/null; then
    TERRAFORM_PATH="terraform"
elif [ -f "/c/Program Files/Terraform/terraform.exe" ]; then
    TERRAFORM_PATH="/c/Program Files/Terraform/terraform.exe"
elif [ -f "/c/ProgramData/chocolatey/bin/terraform.exe" ]; then
    TERRAFORM_PATH="/c/ProgramData/chocolatey/bin/terraform.exe"
else
    # Try to find via PowerShell
    TERRAFORM_PATH=$(powershell.exe -Command "Get-Command terraform -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source" 2>/dev/null | tr -d '\r')
    
    if [ -z "$TERRAFORM_PATH" ]; then
        # Convert Windows path to Git Bash path
        TERRAFORM_PATH=$(powershell.exe -Command "\$env:LOCALAPPDATA + '\Microsoft\WinGet\Packages\HashiCorp.Terraform_*\terraform.exe' | Resolve-Path -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path" 2>/dev/null | tr -d '\r' | sed 's|C:|/c|' | sed 's|\\|/|g')
    fi
fi

if [ -z "$TERRAFORM_PATH" ] || [ ! -f "$TERRAFORM_PATH" ]; then
    echo "❌ Terraform not found. Please install it first:"
    echo "   winget install HashiCorp.Terraform"
    exit 1
fi

# Execute terraform with all arguments
"$TERRAFORM_PATH" "$@"

