@echo off
cd /d "%~dp0"
taskkill /f /im electron.exe >nul 2>&1
timeout /t 1 /nobreak >nul
"C:\Program Files\nodejs\node.exe" "node_modules\electron-vite\bin\electron-vite.js" build
if errorlevel 1 ( pause & exit /b 1 )
start "" "node_modules\electron\dist\electron.exe" .
