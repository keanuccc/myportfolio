@echo off
echo ========================================
echo   Git Push to GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Adding changes...
git add -A

echo [2/3] Committing...
set /p commit_msg="Enter commit message (or press Enter for auto): "
if "%commit_msg%"=="" set commit_msg=auto: update files
git commit -m "%commit_msg%"

echo [3/3] Pushing to GitHub...
git push

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   ✓ Push successful!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   ✗ Push failed. Please try again.
    echo ========================================
)

pause
