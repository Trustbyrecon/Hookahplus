@echo off
echo Cleaning Netlify cache and build artifacts...

REM Remove Netlify build artifacts
if exist ".netlify" (
    echo Removing .netlify directory...
    rmdir /s /q ".netlify"
)

REM Remove Next.js build artifacts
if exist "hookahplus-v2-\.next" (
    echo Removing .next directory...
    rmdir /s /q "hookahplus-v2-\.next"
)

if exist "hookahplus-v2-\out" (
    echo Removing out directory...
    rmdir /s /q "hookahplus-v2-\out"
)

REM Remove any plugin-related files
if exist "netlify.toml" (
    echo Keeping netlify.toml configuration...
)

echo Cleanup complete!
echo.
echo Next steps:
echo 1. Commit and push these changes
echo 2. Trigger a new Netlify deployment
echo 3. The build should now work without plugin dependency issues
pause
