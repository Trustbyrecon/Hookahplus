@echo off
setlocal

echo Running Hookah+ Sanity Check...
echo Current directory: %cd%
echo.

:: Check for package-lock.json
if exist "package-lock.json" (
    echo Found package-lock.json
) else (
    echo Warning: package-lock.json not found.
)

:: Check for key directories
if exist "pages" (
    echo Found pages directory
) else (
    echo Warning: pages directory not found.
)

if exist "app" (
    echo Found app directory
) else (
    echo Warning: app directory not found.
)

if exist "src\pages" (
    echo Found src/pages directory
) else (
    echo Warning: src/pages directory not found.
)

if exist "src\app" (
    echo Found src/app directory
) else (
    echo Warning: src/app directory not found.
)

:: Check for Next.js version
echo Checking Next.js version...
call npm list next > next_version_check.txt 2>&1
findstr /C:"next@" next_version_check.txt

:: Write to file
(
    echo Directory: %cd%
    echo ---------------------
    type next_version_check.txt
) > sanity_output.txt

echo.
echo Sanity check complete. Output saved to sanity_output.txt
pause
