
@echo off
echo Starting Hookah+ Netlify Fallback Deploy...

REM Navigate to the project directory
cd "C:\Users\Dwayne Clark\Downloads\hookahplus_net_full_launch"

REM Trigger Netlify deploy with fallback route
netlify deploy --prod --dir=build

REM Show deploy status
netlify status

REM Show recent deploy logs
netlify logs:deploy --since=5m

echo Deploy sequence complete. You may now test your session route live.
pause
