@echo off
REM Script batch per avviare un server HTTP locale
REM Per servire il sito web dell'enoteca

echo ========================================
echo   Server Locale Enoteca
echo ========================================
echo.

REM Verifica Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python non trovato!
    echo.
    echo Opzioni:
    echo 1. Installa Python da https://www.python.org/downloads/
    echo 2. Usa Node.js: npm install -g http-server
    echo 3. Usa PHP: php -S localhost:8000
    echo.
    pause
    exit /b
)

echo ✓ Python trovato
echo.
echo Avviando il server...
echo.
echo 📍 Accesso al sito:
echo    • Sul tuo computer: http://localhost:8000
echo    • Altri nella tua rete: usa il tuo indirizzo IP locale
echo.
echo ⚠ Premi CTRL+C per fermare il server
echo ========================================
echo.

REM Apri il browser
timeout /t 2 >nul
start http://localhost:8000

REM Avvia il server
python -m http.server 8000

