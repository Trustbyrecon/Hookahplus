@echo off
echo === Hookah+ Full Launch Sanity Check ===

REM Step 1: Navigate to the project directory
cd /d "%~dp0"
echo Current directory: %cd%
pause

REM Step 2: Remove duplicate lockfiles (if they exist)
if exist "package-lock.json" (
    echo Removing root package-lock.json
    del /f /q "package-lock.json"
)
if exist "hookahplus_net_full_launch\package-lock.json" (
    echo Removing nested package-lock.json
    del /f /q "hookahplus_net_full_launch\package-lock.json"
)
pause

REM Step 3: Check for pages or app directory
if not exist "pages" (
    echo ⚠️  Warning: 'pages' directory not found.
)
if not exist "app" (
    echo ⚠️  Warning: 'app' directory not found.
)
pause

REM Step 4: Run the dev server
echo Starting Next.js dev server...
npm run dev

REM Final pause to keep window open if server fails
echo === Script completed ===
pause
