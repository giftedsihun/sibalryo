@echo off
chcp 65001 >nul
title 너의 목소리로
cd /d "%~dp0"

echo.
echo  [1/3] AI 음성 서버 시작 중...
taskkill /f /im python.exe /fi "WINDOWTITLE eq OmniVoice" >nul 2>&1

REM 이미 8000 포트가 열려있는지 확인
netstat -ano | findstr "127.0.0.1:8000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% == 0 (
    echo  AI 서버가 이미 실행 중입니다.
) else (
    start "OmniVoice" /min "..\omnivoice\venv\Scripts\python.exe" "..\omnivoice\game_server.py" --model k2-fsa/OmniVoice --port 8000
    echo  AI 서버를 백그라운드에서 시작했습니다.
)

echo.
echo  [2/3] 빌드 중...
"C:\Program Files\nodejs\node.exe" "node_modules\electron-vite\bin\electron-vite.js" build
if errorlevel 1 (
    echo  [오류] 빌드 실패! node_modules 폴더가 있는지 확인해주세요.
    pause
    exit /b 1
)

echo.
echo  [3/3] 게임 시작!
echo  (AI 음성 기능은 처음 실행 시 30초~1분 후 사용 가능합니다)
start "" "node_modules\electron\dist\electron.exe" .
