
@echo off
cd /d "C:\Users\Dwayne Clark\Downloads\hookahplus_net_full_launch"

REM Remove old origin if exists
git remote remove origin

REM Add correct remote for hookahplus-netlify repo
git remote add origin https://github.com/clarkdwayne/hookahplus-netlify.git

REM Stage key project files
git add netlify.toml _redirects pages/dashboard/session/[sessionId].js

REM Commit with Trust Lock message
git commit -m "Activate Reflex Drift Watcher, Trust Lock Tier 1, and update session path"

REM Push to GitHub
git push -u origin main

pause
