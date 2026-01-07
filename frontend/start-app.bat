@echo off
title Association Creative - Startup
color 0A

echo.
echo ========================================
echo   Association Creative Management
echo   Demarrage de l'application
echo ========================================
echo.

REM Verification de Node.js
echo [1/5] Verification de Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installe!
    echo Telechargez-le depuis: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js est installe

REM Verification de MongoDB
echo [2/5] Verification de MongoDB...
mongod --version >nul 2>&1
if errorlevel 1 (
    echo [ATTENTION] MongoDB n'est pas trouve!
    echo Assurez-vous qu'il est installe et demarre
    echo.
)

REM Verification des fichiers .env
echo [3/5] Verification de la configuration...
if not exist ".env" (
    echo [INFO] Copie de .env.example vers .env
    copy .env.example .env >nul 2>&1
)
if not exist "backend\.env" (
    echo [INFO] Copie de backend\.env.example vers backend\.env
    copy backend\.env.example backend\.env >nul 2>&1
)

REM Verification des node_modules
echo [4/5] Verification des dependances...
if not exist "node_modules\" (
    echo [INFO] Installation des dependances frontend...
    call npm install
)
if not exist "backend\node_modules\" (
    echo [INFO] Installation des dependances backend...
    cd backend
    call npm install
    cd ..
)

echo [5/5] Demarrage de l'application...
echo.
echo ========================================
echo   L'application va demarrer
echo ========================================
echo.
echo [INFO] Frontend: http://localhost:3000
echo [INFO] Backend:  http://localhost:5000
echo.
echo Appuyez sur Ctrl+C pour arreter
echo ========================================
echo.

REM Demarrer le backend dans une nouvelle fenetre
start "Backend API - Association Creative" cmd /k "cd backend && npm run dev"

REM Attendre 3 secondes
timeout /t 3 /nobreak >nul

REM Demarrer le frontend dans la fenetre actuelle
echo [OK] Backend demarre...
echo [OK] Demarrage du frontend...
echo.
npm start

pause
