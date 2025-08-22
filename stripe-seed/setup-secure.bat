@echo off
REM Secure Stripe Seed Setup Script for Windows
echo 🔐 Setting up secure Stripe environment...

REM Check if .env already exists
if exist ".env" (
    echo ⚠️  .env file already exists. Backing up...
    ren .env .env.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%
)

REM Create .env file
echo 📝 Creating .env file...
(
echo # Stripe Test Environment
echo # Add your actual test key below ^(NEVER commit this file!^)
echo STRIPE_SECRET_KEY=sk_test_your_test_key_here
) > .env

echo ✅ .env file created successfully!
echo.
echo 🔑 Next steps:
echo 1. Edit .env file and add your actual Stripe test key
echo 2. Run: npm install
echo 3. Run: node seed.js
echo.
echo ⚠️  IMPORTANT: Never commit the .env file!
echo    It's already in .gitignore for safety.
pause
