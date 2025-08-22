@echo off
setlocal enabledelayedexpansion

REM ✅ Set target directory relative to this script's location
set "targetDir=%~dp0hookahplus-gtm-site-full"
echo Injecting assets into: "%targetDir%"

REM ✅ Check if folder exists
if not exist "%targetDir%" (
    echo ❌ ERROR: Folder "%targetDir%" does not exist.
    pause
    exit /b
)

REM ✅ Simulate asset injection
echo ✅ Folder exists. Proceeding with asset injection...

REM Example: Add starter HTML if not present
if not exist "%targetDir%\index.html" (
    echo ^<html^>^<body^>Hookah+ Starter Site^</body^>^</html^> > "%targetDir%\index.html"
    echo 🟢 index.html created.
) else (
    echo ⚠️ index.html already exists.
)

echo ✅ Asset injection complete.
pause
