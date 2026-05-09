@echo off
echo Starting 너의 목소리로...

:: Set ANTHROPIC_API_KEY here if not set in .env
:: set ANTHROPIC_API_KEY=sk-ant-...

:: Start OmniVoice server (adjust path as needed)
:: start "" /B python "%~dp0omnivoice\server.py"

:: Start the game
"%~dp0너의 목소리로.exe"
