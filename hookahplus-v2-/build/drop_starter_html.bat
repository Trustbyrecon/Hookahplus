@echo off
SET TARGET_DIR=hookahplus-gtm-site-full

echo.
echo 🔧 Injecting starter HTML scaffold into %TARGET_DIR% ...
cd /d "%~dp0"

REM Check if index.html already exists
IF EXIST "%TARGET_DIR%\index.html" (
    echo ⚠️ index.html already exists in %TARGET_DIR%.
    echo Skipping overwrite. Rename or remove manually if you wish to replace it.
) ELSE (
    (
        echo ^<!DOCTYPE html^>
        echo ^<html lang="en"^>
        echo ^<head^>
        echo     ^<meta charset="UTF-8" /^>
        echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>
        echo     ^<title^>Hookah+ Launch^</title^>
        echo     ^<style^>
        echo         body { font-family: sans-serif; background-color: #111; color: #eee; text-align: center; padding-top: 5rem; }
        echo         h1 { color: #ff6699; }
        echo     ^</style^>
        echo ^</head^>
        echo ^<body^>
        echo     ^<h1^>🔥 Welcome to Hookah+ GTM Site 🔥^</h1^>
        echo     ^<p^>This is your starter page — ready for Netlify deploy.^</p^>
        echo ^</body^>
        echo ^</html^>
    ) > "%TARGET_DIR%\index.html"
    echo ✅ index.html created inside %TARGET_DIR%.
)

echo.
echo HTML injection complete.
pause
