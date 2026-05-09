@echo off
chcp 65001 >nul
title 너의 목소리로
cd /d "%~dp0"

echo.
echo  [1/2] 빌드 중...
"C:\Program Files\nodejs\node.exe" "node_modules\electron-vite\bin\electron-vite.js" build
if errorlevel 1 (
    echo  [오류] 빌드 실패! node_modules 폴더가 있는지 확인해주세요.
    pause
    exit /b 1
)

echo.
echo  [2/2] 게임 시작!
start "" "node_modules\electron\dist\electron.exe" .
