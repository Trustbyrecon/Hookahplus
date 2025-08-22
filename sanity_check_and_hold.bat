@echo off
echo Running sanity check...
echo Current directory: %cd%
IF NOT EXIST package-lock.json echo No package-lock.json found.
IF NOT EXIST pages echo Warning: pages directory not found.
IF NOT EXIST pages\index.tsx echo Warning: index.tsx missing.
pause
