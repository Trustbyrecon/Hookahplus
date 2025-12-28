# Newsletter Subscription Checker (PowerShell)
# Queries the CTA tracking API to see newsletter signups

param(
    [int]$Days = 30
)

# Get API URL from environment or use default
$apiUrl = if ($env:NEXT_PUBLIC_APP_URL) { $env:NEXT_PUBLIC_APP_URL } else { "http://localhost:3002" }

Write-Host "📧 Newsletter Subscription Checker" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "API URL: $apiUrl"
Write-Host "Time Period: Last $Days days"
Write-Host ""

# Query newsletter signups
Write-Host "Fetching newsletter signups..." -ForegroundColor Yellow
Write-Host ""

try {
    $url = "$apiUrl/api/cta/track?type=newsletter_signup&days=$Days"
    $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "📊 Summary" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host ""
    Write-Host "Total Signups: " -NoNewline
    Write-Host $response.stats.total -ForegroundColor Green
    Write-Host ""
    
    if ($response.stats.total -gt 0) {
        Write-Host "By Source:"
        $response.stats.bySource.PSObject.Properties | ForEach-Object {
            Write-Host "  $($_.Name): $($_.Value)"
        }
        Write-Host ""
        
        Write-Host "By Day (last 7 days):"
        $response.stats.byDay.PSObject.Properties | 
            Sort-Object Name -Descending | 
            Select-Object -First 7 | 
            ForEach-Object {
                Write-Host "  $($_.Name): $($_.Value)"
            }
        Write-Host ""
        
        Write-Host "Recent Signups (last 5):"
        $response.events | Select-Object -First 5 | ForEach-Object {
            $payload = $_.payload | ConvertFrom-Json
            $email = if ($payload.data.email) { $payload.data.email } else { "no email" }
            Write-Host "  $($_.createdAt) - $email"
        }
    } else {
        Write-Host "No newsletter signups found in the last $Days days" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error: Could not connect to API" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:"
    Write-Host "  1. App build server not running (start with: cd apps/app; npm run dev)"
    Write-Host "  2. Wrong API URL (set NEXT_PUBLIC_APP_URL environment variable)"
    Write-Host "  3. API endpoint not accessible"
    Write-Host ""
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

