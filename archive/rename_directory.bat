@echo off
echo ============================================
echo Renaming Directory to OmegaTerminal
echo ============================================
echo.
echo INSTRUCTIONS:
echo 1. Close ALL terminals/command prompts in this directory
echo 2. Close VS Code or any editors with this folder open
echo 3. Close any file explorer windows in this folder
echo 4. Run this script again
echo.
pause
echo.
echo Attempting to rename...
cd ..
rename "omegaterminalupdated" "OmegaTerminal"
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo SUCCESS! Directory renamed to OmegaTerminal
    echo ============================================
    echo.
    echo New path:
    echo C:\Users\jmrit\Terminal\OmegaTerminal
    echo.
    echo Next steps:
    echo 1. Open new terminal in new location
    echo 2. cd C:\Users\jmrit\Terminal\OmegaTerminal
    echo 3. npm run dev
    echo.
) else (
    echo.
    echo ERROR: Directory is still in use
    echo Close all programs and try again
    echo.
)
pause

