@echo off
echo Creating missing app folders...

REM Create folders if they do not exist
if not exist "hooks" mkdir hooks
if not exist "utils" mkdir utils
if not exist "scripts" mkdir scripts
if not exist "api" mkdir api
if not exist "env" mkdir env

REM Add .gitkeep files to retain folder structure in Git
echo. > hooks\.gitkeep
echo. > utils\.gitkeep
echo. > scripts\.gitkeep
echo. > api\.gitkeep
echo. > env\.gitkeep

echo Folder structure setup complete.
pause
