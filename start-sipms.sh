#!/bin/bash

echo "==================================================="
echo "SIPMS - Smart Internship Project Management System"
echo "==================================================="

echo "[1/4] Checking MySQL Service..."
if ! systemctl is-active --quiet mysql && ! systemctl is-active --quiet mysqld; then
    echo "[ERROR] MySQL service is not running. Please start MySQL (e.g., sudo systemctl start mysql)."
    exit 1
fi
echo "[OK] MySQL service is running."

echo "[2/4] Verifying Database 'sipms_db'..."
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS sipms_db;" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "[WARNING] Could not automatically verify/create 'sipms_db'. Ensure MySQL credentials are root/root or update this script."
else
    echo "[OK] Database sipms_db verified."
fi

echo "[3/4] Starting Spring Boot Backend (Port 8080)..."
cd backend || exit
chmod +x mvnw
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod > backend.log 2>&1 &
BACKEND_PID=$!
echo "[OK] Backend started in background (PID: $BACKEND_PID)."
cd ..

echo "[4/4] Starting React Vite Frontend (Port 5173)..."
cd frontend || exit
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing frontend dependencies..."
    npm install
fi
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "[OK] Frontend started in background (PID: $FRONTEND_PID)."
cd ..

echo "==================================================="
echo "SIPMS is starting!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Waiting 10 seconds for services to initialize..."
echo "==================================================="
sleep 10

echo "Opening browser..."
if which xdg-open > /dev/null
then
  xdg-open http://localhost:5173
elif which gnome-open > /dev/null
then
  gnome-open http://localhost:5173
elif which open > /dev/null
then
  open http://localhost:5173
fi

echo "Launch sequence complete."
