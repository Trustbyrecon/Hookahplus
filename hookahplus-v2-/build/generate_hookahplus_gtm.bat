@echo off
echo Creating hookahplus-gtm-site-full...
mkdir hookahplus-gtm-site-full
cd hookahplus-gtm-site-full

echo ^<html^>^<head^>^<title^>Hookah+ Full Launch^</title^>^</head^>^<body^>Welcome to Hookah+ GTM Site^</body^>^</html^> > index.html

echo [build] > netlify.toml
echo   publish = "." >> netlify.toml
echo   command = "echo Build Ready" >> netlify.toml

echo { > package.json
echo   "name": "hookahplus-gtm", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "scripts": { "build": "echo Deploying HookahPlus..." } >> package.json
echo } >> package.json

echo Folder setup complete.
pause
