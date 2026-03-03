# Fix Database Connection Script (PowerShell)
# This script helps fix the database connection issue

Write-Host "🔧 Fixing Database Connection..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if .env.local exists
Write-Host "📋 Step 1: Checking .env.local..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local not found!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ .env.local found" -ForegroundColor Green

# Step 2: Check DATABASE_URL
Write-Host "📋 Step 2: Checking DATABASE_URL..." -ForegroundColor Yellow
$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "DATABASE_URL") {
    Write-Host "✅ DATABASE_URL found" -ForegroundColor Green
    $dbUrl = ($envContent -split "`n" | Select-String "DATABASE_URL" | Select-Object -First 1)
    Write-Host "   $dbUrl" -ForegroundColor Gray
} else {
    Write-Host "❌ DATABASE_URL not found in .env.local" -ForegroundColor Red
    exit 1
}

# Step 3: Regenerate Prisma Client
Write-Host ""
Write-Host "📋 Step 3: Regenerating Prisma Client..." -ForegroundColor Yellow
Write-Host "   (This may take a moment...)" -ForegroundColor Gray

$prismaResult = & npx prisma generate 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma client regenerated successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to regenerate Prisma client" -ForegroundColor Red
    Write-Host "💡 Make sure:" -ForegroundColor Yellow
    Write-Host "   - Dev server is stopped (Ctrl+C)" -ForegroundColor Gray
    Write-Host "   - All terminals are closed" -ForegroundColor Gray
    Write-Host "   - VS Code/Cursor is closed" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Then try running this script again." -ForegroundColor Gray
    exit 1
}

# Step 4: Test connection (optional)
Write-Host ""
Write-Host "📋 Step 4: Testing database connection..." -ForegroundColor Yellow
Write-Host "   (This will verify the connection works)" -ForegroundColor Gray

$testResult = & npx prisma db pull --schema=prisma/schema.prisma 2>&1 | Select-Object -First 10
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database connection successful!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Connection test failed. Check the error above." -ForegroundColor Yellow
    Write-Host $testResult -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "🚀 You can now run: npm run dev" -ForegroundColor Cyan

