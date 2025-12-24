# PowerShell script to remove secrets from git history
# Run this from the repository root

Write-Host "Removing secrets from git history..." -ForegroundColor Yellow

# Check if we're in the right directory
if (-not (Test-Path ".git")) {
    Write-Host "Error: Not in a git repository. Run this from the repo root." -ForegroundColor Red
    exit 1
}

# Backup current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan

# Create a backup branch
$backupBranch = "backup-before-secret-removal-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git branch $backupBranch
Write-Host "Created backup branch: $backupBranch" -ForegroundColor Green

# Secrets to replace
# ⚠️ IMPORTANT: Replace the placeholders below with your actual secret values before running
# This script is a template - you need to fill in the actual secrets you want to remove
$secrets = @{
    "YOUR_APPLICATION_ID_HERE" = "sandbox-sq0idb-XXXXXXXXXXXXXXXXXXXX"
    "YOUR_APPLICATION_SECRET_HERE" = "sandbox-sq0csb-XXXXXXXXXXXXXXXXXXXX"
    "YOUR_ENCRYPTION_KEY_HERE" = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}

# Use git filter-branch (built-in, no extra tools needed)
Write-Host "`nRewriting git history..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Yellow

$env:GIT_EDITOR = "true"  # Skip editor prompts

foreach ($secret in $secrets.Keys) {
    $replacement = $secrets[$secret]
    Write-Host "Replacing: $($secret.Substring(0, 20))..." -ForegroundColor Cyan
    
    # Use git filter-branch to replace in all commits
    git filter-branch --force --index-filter `
        "git ls-files -s | sed 's/`t/`t$secret`t$replacement`t/' | GIT_INDEX_FILE=`$GIT_INDEX_FILE.new git update-index --index-info && mv `$GIT_INDEX_FILE.new `$GIT_INDEX_FILE" `
        --prune-empty --tag-name-filter cat -- --all 2>&1 | Out-Null
    
    # Simpler approach: use sed replacement in all files
    git filter-branch -f --tree-filter "if [ -f SQUARE_OAUTH_SETUP.md ]; then sed -i 's/$secret/$replacement/g' SQUARE_OAUTH_SETUP.md; fi; if [ -f SQUARE_APP_ID_VERIFICATION.md ]; then sed -i 's/$secret/$replacement/g' SQUARE_APP_ID_VERIFICATION.md; fi" -- --all 2>&1 | Out-Null
}

Write-Host "`nHistory rewrite complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Review changes: git log --oneline" -ForegroundColor Cyan
Write-Host "2. Force push: git push origin $currentBranch --force" -ForegroundColor Cyan
Write-Host "3. If something goes wrong, restore: git reset --hard $backupBranch" -ForegroundColor Cyan
Write-Host "`n⚠️  WARNING: Force push rewrites history. Coordinate with your team!" -ForegroundColor Red

