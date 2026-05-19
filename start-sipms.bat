@echo off
setlocal EnableDelayedExpansion

echo ===================================================
echo SIPMS - Smart Internship Project Management System
echo ===================================================

echo [1/4] Checking MySQL Service...
sc query mysql >nul 2>&1
if %errorlevel% neq 0 (
    sc query mysql80 >nul 2>&1
    if !errorlevel! neq 0 (
        echo [ERROR] MySQL service is not running. Please start MySQL.
        pause
        exit /b 1
    ) else (
        echo [OK] MySQL (mysql80) service is running.
    )
) else (
    echo [OK] MySQL service is running.
)

echo [2/4] Verifying Database 'sipms_db'...
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS sipms_db;" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Could not automatically verify/create 'sipms_db'. Ensure MySQL credentials are root/root or update this script.
) else (
    echo [OK] Database sipms_db verified.
)

echo [3/4] Starting Spring Boot Backend (Port 8080)...
cd backend
start "SIPMS Backend" cmd /c "mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=prod"
cd ..
echo [OK] Backend launched in a new window.

echo [4/4] Starting React Vite Frontend (Port 5173)...
cd frontend
if not exist "node_modules\" (
    echo [INFO] Installing frontend dependencies...
    call npm install
)
start "SIPMS Frontend" cmd /c "npm run dev"
cd ..
echo [OK] Frontend launched in a new window.

echo ===================================================
echo SIPMS is starting! 
echo Waiting 10 seconds for services to initialize...
echo ===================================================
timeout /t 10 /nobreak >nul

echo Opening browser...
start http://localhost:5173
echo Launch sequence complete.
