@echo off
title OmniVoice Game Server :8000
cd /d "%~dp0"
echo.
echo  [OmniVoice] Starting game server on port 8000...
echo  [OmniVoice] First run will download the model (may take a few minutes).
echo  [OmniVoice] Wait for: Model ready  then launch the game.
echo.
venv\Scripts\python.exe game_server.py --model k2-fsa/OmniVoice --port 8000 --device cuda
echo.
echo  [OmniVoice] Server stopped.
pause
