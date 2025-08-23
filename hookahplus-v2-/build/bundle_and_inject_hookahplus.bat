@echo off
setlocal

REM --- Set working directory
set "SRC_DIR=hookahplus-gtm-site-full"
set "ZIP_NAME=hookahplus_full_deploy_package.zip"
set "MODULE_DIR=assets/modules"

echo Preparing build from "%SRC_DIR%"...

IF NOT EXIST "%SRC_DIR%" (
    echo ERROR: Source folder does not exist.
    pause
    exit /b
)

REM --- Optional module injection
IF EXIST "%MODULE_DIR%" (
    echo Injecting custom modules...
    xcopy "%MODULE_DIR%\*" "%SRC_DIR%\assets" /s /e /y >nul
    echo Module injection complete.
)

REM --- Remove old ZIP if it exists
IF EXIST "%ZIP_NAME%" (
    del "%ZIP_NAME%"
)

echo Zipping full package into "%ZIP_NAME%"...
powershell -command "Compress-Archive -Path '%SRC_DIR%\*' -DestinationPath '%ZIP_NAME%'"

echo ✅ Packaging complete: %ZIP_NAME%
pause
