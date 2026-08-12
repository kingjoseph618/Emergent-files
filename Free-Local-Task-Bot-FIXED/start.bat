@echo off
title Free Local Bot Emulator
cd /d "%~dp0"
where ollama >nul 2>nul
if errorlevel 1 (
  echo Ollama is not installed.
  echo Download it free from: https://ollama.com/download/windows
  pause
  exit /b 1
)

ollama list | findstr /i "llama3.2:3b" >nul
if errorlevel 1 (
  echo Downloading the free local model. This happens only once.
  ollama pull llama3.2:3b
  if errorlevel 1 pause & exit /b 1
)

set "PYTHON_CMD=python"
python --version >nul 2>nul
if errorlevel 1 (
  set "PYTHON_CMD=C:\Users\BG\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
)
if not exist "%PYTHON_CMD%" if "%PYTHON_CMD%" NEQ "python" (
  echo Python is required. Download it free from: https://www.python.org/downloads/windows/
  pause
  exit /b 1
)

echo Starting your bot...
start "Local Task Bot Server" /min "%PYTHON_CMD%" server.py

for /l %%I in (1,1,30) do (
  powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:8844/api/health' -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }"
  if not errorlevel 1 goto ready
  timeout /t 1 /nobreak >nul
)

echo The bot did not start. Keep this window open and read the message above.
pause
exit /b 1

:ready
echo Your bot is ready.
start "" http://127.0.0.1:8844/
exit /b 0
