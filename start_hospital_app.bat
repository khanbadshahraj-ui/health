@echo off
echo ====================================================
echo Starting AuraCare Hospital Management System
echo ====================================================
cd /d "%~dp0"
echo Checking database synchronization...
call npx prisma db push --skip-generate
echo Starting Next.js Web Server on http://localhost:3000 ...
call npm run dev
