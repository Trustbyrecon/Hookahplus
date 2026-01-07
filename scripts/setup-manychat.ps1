# ManyChat Setup Automation Script (PowerShell)

Write-Host "ManyChat Setup Automation" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Generate Secrets
Write-Host "Step 1: Generating secure secrets..." -ForegroundColor Blue

# Generate Webhook Secret (32 random bytes as hex)
$webhookSecretBytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($webhookSecretBytes)
$WEBHOOK_SECRET = -join ($webhookSecretBytes | ForEach-Object { "{0:x2}" -f $_ })

# Generate Webhook API Key
$webhookApiKeyBytes = New-Object byte[] 32
$rng.GetBytes($webhookApiKeyBytes)
$WEBHOOK_API_KEY = -join ($webhookApiKeyBytes | ForEach-Object { "{0:x2}" -f $_ })

# Set Verify Token (default)
$VERIFY_TOKEN = "hookahplus_manychat_verify"

Write-Host "[OK] Generated MANYCHAT_WEBHOOK_SECRET" -ForegroundColor Green
Write-Host "[OK] Generated WEBHOOK_API_KEY" -ForegroundColor Green
Write-Host "[OK] Using MANYCHAT_VERIFY_TOKEN: $VERIFY_TOKEN" -ForegroundColor Green

Write-Host ""
Write-Host "Generated Values:" -ForegroundColor Yellow
Write-Host "MANYCHAT_WEBHOOK_SECRET=$WEBHOOK_SECRET"
Write-Host "MANYCHAT_VERIFY_TOKEN=$VERIFY_TOKEN"
Write-Host "WEBHOOK_API_KEY=$WEBHOOK_API_KEY"
Write-Host ""

# Step 2: Check if .env.local exists
$ENV_FILE = "apps\app\.env.local"
$envContent = ""

if (Test-Path $ENV_FILE) {
    Write-Host "Step 2: Checking existing .env.local..." -ForegroundColor Blue
    $envContent = Get-Content $ENV_FILE -Raw
} else {
    Write-Host "Step 2: Creating .env.local..." -ForegroundColor Blue
    $envDir = "apps\app"
    if (-not (Test-Path $envDir)) {
        New-Item -ItemType Directory -Path $envDir -Force | Out-Null
    }
}

# Check and update MANYCHAT_WEBHOOK_SECRET
if ($envContent -match "MANYCHAT_WEBHOOK_SECRET=") {
    Write-Host "[WARN] MANYCHAT_WEBHOOK_SECRET already exists in .env.local" -ForegroundColor Yellow
    $response = Read-Host "Do you want to update it? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        $envContent = $envContent -replace "MANYCHAT_WEBHOOK_SECRET=.*", "MANYCHAT_WEBHOOK_SECRET=$WEBHOOK_SECRET"
        Write-Host "[OK] Updated MANYCHAT_WEBHOOK_SECRET" -ForegroundColor Green
    }
} else {
    if ($envContent.Length -gt 0 -and -not $envContent.EndsWith("`n")) {
        $envContent += "`n"
    }
    if (-not ($envContent -match "# ManyChat Integration")) {
        $envContent += "`n# ManyChat Integration`n"
    }
    $envContent += "MANYCHAT_WEBHOOK_SECRET=$WEBHOOK_SECRET`n"
    Write-Host "[OK] Added MANYCHAT_WEBHOOK_SECRET to .env.local" -ForegroundColor Green
}

# Check and update MANYCHAT_VERIFY_TOKEN
if (-not ($envContent -match "MANYCHAT_VERIFY_TOKEN=")) {
    $envContent += "MANYCHAT_VERIFY_TOKEN=$VERIFY_TOKEN`n"
    Write-Host "[OK] Added MANYCHAT_VERIFY_TOKEN to .env.local" -ForegroundColor Green
}

# Check and update WEBHOOK_API_KEY
if ($envContent -match "WEBHOOK_API_KEY=") {
    Write-Host "[WARN] WEBHOOK_API_KEY already exists in .env.local" -ForegroundColor Yellow
    $response = Read-Host "Do you want to update it? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        $envContent = $envContent -replace "WEBHOOK_API_KEY=.*", "WEBHOOK_API_KEY=$WEBHOOK_API_KEY"
        Write-Host "[OK] Updated WEBHOOK_API_KEY" -ForegroundColor Green
    }
} else {
    $envContent += "WEBHOOK_API_KEY=$WEBHOOK_API_KEY`n"
    Write-Host "[OK] Added WEBHOOK_API_KEY to .env.local" -ForegroundColor Green
}

# If file didn't exist, add Calendly placeholder
if (-not (Test-Path $ENV_FILE)) {
    $envContent += "`n# Calendly Integration (update with your actual URL)`n"
    $envContent += "NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-username/your-event-type`n"
}

# Write the file
Set-Content -Path $ENV_FILE -Value $envContent

Write-Host ""
Write-Host "Step 3: Verifying API endpoints exist..." -ForegroundColor Blue

# Check if webhook endpoint exists
if (Test-Path "apps\app\app\api\webhooks\manychat\route.ts") {
    Write-Host "[OK] Webhook endpoint exists: /api/webhooks/manychat" -ForegroundColor Green
} else {
    Write-Host "[WARN] Webhook endpoint not found" -ForegroundColor Yellow
}

# Check if demo link API exists
if (Test-Path "apps\app\app\api\manychat\generate-demo-link\route.ts") {
    Write-Host "[OK] Demo link API exists: /api/manychat/generate-demo-link" -ForegroundColor Green
} else {
    Write-Host "[WARN] Demo link API not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[OK] Automated setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps (Manual):" -ForegroundColor Yellow
Write-Host "1. Update NEXT_PUBLIC_CALENDLY_URL in .env.local with your actual Calendly URL"
Write-Host "2. Add these same environment variables to Vercel (production)"
Write-Host "3. In ManyChat Dashboard:"
Write-Host "   - Go to Settings -> Integrations -> Webhooks"
Write-Host "   - Add webhook with URL: https://app.hookahplus.net/api/webhooks/manychat"
Write-Host "   - Verify Token: $VERIFY_TOKEN"
Write-Host "   - Secret: $WEBHOOK_SECRET"
Write-Host "   - Subscribe to: message, comment, story_reply, flow_started"
Write-Host "4. Set up Instagram triggers in ManyChat (see guide)"
Write-Host "5. Create the qualification flow in ManyChat (see guide)"
Write-Host ""
















