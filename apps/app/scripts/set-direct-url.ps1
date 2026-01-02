# PowerShell script to set DIRECT_URL in Vercel
# Usage: .\scripts\set-direct-url.ps1 [PASSWORD]

param(
    [Parameter(Mandatory=$true)]
    [string]$Password
)

$PROJECT_REF = "hsypmyqtlxjwpnkkacmo"
$REGION = "us-east-2"
$DIRECT_URL = "postgresql://postgres.${PROJECT_REF}:${Password}@aws-0-${REGION}.pooler.supabase.com:5432/postgres?sslmode=require"

Write-Host "Setting DIRECT_URL for all environments..." -ForegroundColor Cyan
Write-Host ""

# Set for Production
Write-Host "Setting for Production..." -ForegroundColor Yellow
echo $DIRECT_URL | vercel env add DIRECT_URL production

# Set for Preview
Write-Host "Setting for Preview..." -ForegroundColor Yellow
echo $DIRECT_URL | vercel env add DIRECT_URL preview

# Set for Development
Write-Host "Setting for Development..." -ForegroundColor Yellow
echo $DIRECT_URL | vercel env add DIRECT_URL development

Write-Host ""
Write-Host "✅ DIRECT_URL set successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Verify with: vercel env ls" -ForegroundColor Cyan

