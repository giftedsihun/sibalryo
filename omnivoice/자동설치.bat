@echo off
cd /d "%~dp0"
echo.
echo =========================================
echo  OmniVoice Setup (Creating Virtual Env)
echo =========================================
echo.

if not exist "venv" (
    echo [1/3] Creating Python virtual environment...
    python -m venv venv
) else (
    echo [1/3] Virtual environment already exists.
)

echo.
echo [2/3] Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo [3/3] Installing required packages...
pip install -e .

echo.
echo =========================================
echo  Setup Completed!
echo  You can now run game server
echo =========================================
pause
