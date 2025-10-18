@echo off
echo ============================================
echo   CONVEX CONNECTION DIAGNOSTICS
echo ============================================
echo.

echo Checking Convex configuration...
echo.

echo 1. Environment Variable:
echo    NEXT_PUBLIC_CONVEX_URL=%NEXT_PUBLIC_CONVEX_URL%
echo.

echo 2. Checking if Convex dev server is running...
netstat -ano | findstr "3210" > nul
if %errorlevel% == 0 (
    echo    ✅ Port 3210 is in use (Convex likely running)
) else (
    echo    ❌ Port 3210 is not in use (Convex NOT running)
    echo    👉 Run: npm run dev:convex
)
echo.

echo 3. Checking if Next.js is running...
netstat -ano | findstr "3000" > nul
if %errorlevel% == 0 (
    echo    ✅ Port 3000 is in use (Next.js running)
) else (
    netstat -ano | findstr "3001" > nul
    if %errorlevel% == 0 (
        echo    ✅ Port 3001 is in use (Next.js running)
    ) else (
        echo    ❌ No Next.js server detected
        echo    👉 Run: npm run dev
    )
)
echo.

echo 4. Testing Convex connection...
echo    Attempting to connect to http://localhost:3210
curl -s http://localhost:3210 > nul 2>&1
if %errorlevel% == 0 (
    echo    ✅ Convex server responding
) else (
    echo    ❌ Cannot connect to Convex server
    echo    👉 Make sure "npm run dev:convex" is running
)
echo.

echo ============================================
echo   RECOMMENDATIONS:
echo ============================================
echo.
echo If you see any ❌ above:
echo 1. Start Convex: npm run dev:convex
echo 2. Start Next.js: npm run dev
echo 3. Refresh browser: Ctrl + Shift + R
echo.
echo If everything is ✅:
echo - Open browser: http://localhost:3000/dashboard
echo - Check console (F12) for logs
echo - Should see "plans: []" not "plans: undefined"
echo.
echo ============================================
pause
