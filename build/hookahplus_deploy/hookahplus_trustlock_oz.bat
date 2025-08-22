@echo off
setlocal

:: Set paths
set "ZIP_FILE=C:\Users\Dwayne Clark\Downloads\hookahplus_net_full_launch\hookahplus_trustlock_push.zip"
set "DEST_FOLDER=C:\Users\Dwayne Clark\Downloads\hookahplus_net_full_launch\hookahplus_deploy"

:: Check if ZIP exists
if not exist "%ZIP_FILE%" (
    echo ERROR: Zip file not found at:
    echo    %ZIP_FILE%
    echo Please move the file to the correct location and re-run this script.
    pause
    exit /b 1
)

:: Create destination folder if it doesn't exist
if not exist "%DEST_FOLDER%" (
    mkdir "%DEST_FOLDER%"
)

:: Extract ZIP
powershell -Command "Expand-Archive -Force '%ZIP_FILE%' '%DEST_FOLDER%'"

echo.
echo ✅ Extract complete.
echo Output located in:
echo    %DEST_FOLDER%
pause
endlocal
