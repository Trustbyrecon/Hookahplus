@echo off
echo Initializing Hookahplus repo with submodules...
REM Add each repo as a submodule
git submodule add https://github.com/Trustbyrecon/hookahplus-pos pos
git submodule add https://github.com/Trustbyrecon/hookahplus-backend backend
git submodule add https://github.com/Trustbyrecon/hookahplus-netlify netlify
REM Optional: add docs if available
REM git submodule add https://github.com/Trustbyrecon/hookahplus-docs docs
echo ✅ Submodules added. Run "git submodule update --init --recursive" to finalize.@echo off
echo.
echo 🔄 [Hookah+] SAFE SUBMODULE MERGE INITIATED
echo ----------------------------------------------

:: Remove old folders if they exist
IF EXIST pos (
    echo ⚠️  Removing existing 'pos' folder...
    rmdir /S /Q pos
)
IF EXIST backend (
    echo ⚠️  Removing existing 'backend' folder...
    rmdir /S /Q backend
)
IF EXIST netlify (
    echo ⚠️  Removing existing 'netlify' folder...
    rmdir /S /Q netlify
)

echo ✅ Folders cleared. Adding submodules...

:: Add submodules
git submodule add https://github.com/Trustbyrecon/hookahplus-pos pos
git submodule add https://github.com/Trustbyrecon/hookahplus-backend backend
git submodule add https://github.com/Trustbyrecon/hookahplus-netlify netlify

echo ----------------------------------------------
echo ✅ Submodules added successfully.
echo ✅ .gitmodules should now be present.
echo 🔁 Run: git submodule update --init --recursive
echo 🔐 Then commit with:
echo     git add .gitmodules pos backend netlify
echo     git commit -m "🔗 Registered Hookah+ submodules"
echo     git push origin main
echo ----------------------------------------------
pause
