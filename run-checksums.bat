@echo off
REM DGelectron Dependencies Checksum Generator - Quick Start
REM ========================================================

echo.
echo DGelectron Checksum Generator
echo =============================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.6+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/3] Generating checksums for current directory...
python generate_checksums.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to generate checksums
    pause
    exit /b 1
)

echo.
echo [2/3] Verifying generated checksums...
python generate_checksums.py --verify

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Verification failed
    pause
    exit /b 1
)

echo.
echo [3/3] Success! Checksums generated and verified.
echo.
echo Output file: checksums.json
echo.
echo Next steps:
echo   - Run 'python generate_checksums.py --update' to update checksums
echo   - Run 'python generate_checksums.py --verify' to verify files
echo   - See README-CHECKSUMS.md for more options
echo.

pause
