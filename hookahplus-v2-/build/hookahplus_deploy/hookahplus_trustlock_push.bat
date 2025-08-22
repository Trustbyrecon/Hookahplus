
@echo off
echo HookahPlus Trust Lock Deployment Script [OZ MODE]
echo.

REM Create target directory
set TARGET=hookahplus_deploy
mkdir %TARGET%

REM Unzip contents
powershell -Command "Expand-Archive -Force hookahplus_trustlock_push.zip %TARGET%"

REM Move files into place
cd %TARGET%
echo Files deployed to %cd%
echo.

REM Completion Message
echo ✅ OZ Deploy Complete. HookahPlus Trust Lock is now staged.
pause
