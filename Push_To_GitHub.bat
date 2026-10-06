@echo off
title Push AuraCare HMS to GitHub (khanbadshahraj-ui/health)
color 0A
cd /d "C:\Users\hp\.gemini\antigravity\scratch\clinic-hms"

echo ================================================================
echo       AURACARE HOSPITAL MANAGEMENT SYSTEM - GITHUB PUSH
echo ================================================================
echo Target Repository: https://github.com/khanbadshahraj-ui/health.git
echo Local Commits: Ready (All features, packages, executables, data)
echo.
echo Pushing commits to branch 'main'...
echo.

"C:\Users\hp\AppData\Local\GitHubDesktop\app-3.6.6\resources\app\git\cmd\git.exe" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================
    echo [SUCCESS] ALL HOSPITAL SYSTEM DATA PUSHED TO GITHUB!
    echo View at: https://github.com/khanbadshahraj-ui/health
    echo ================================================================
) else (
    echo.
    echo [NOTICE] If prompted by GitHub / Git Credential Manager, 
    echo please click 'Sign in with your browser' to authorize.
    echo.
    echo Or log in once using GitHub CLI:
    echo   "C:\Program Files\GitHub CLI\gh.exe" auth login
)

echo.
pause
