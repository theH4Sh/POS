@echo off
echo ==========================================
echo   Pharmacy POS - Production Build Script
echo ==========================================
echo.

echo [1/3] Building UI (Renderer)...
node node_modules\vite\bin\vite.js build --base ./
if %errorlevel% neq 0 (
    echo Error building UI!
    pause
    exit /b %errorlevel%
)
echo.

echo [2/3] Rebuilding Native Modules (SQLite)...
node node_modules\electron-rebuild\lib\src\cli.js -f -w better-sqlite3
if %errorlevel% neq 0 (
    echo Error rebuilding native modules!
    pause
    exit /b %errorlevel%
)
echo.

echo [3/3] Creating Installer package...
node node_modules\electron-builder\out\cli\cli.js --win nsis
if %errorlevel% neq 0 (
    echo Error creating installer!
    pause
    exit /b %errorlevel%
)
echo.

echo ==========================================
echo   BUILD COMPLETE! Check the 'release' folder.
echo ==========================================
pause
