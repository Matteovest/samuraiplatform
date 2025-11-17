@echo off
echo ========================================
echo   Samurai Platform - Avvio Server
echo ========================================
echo.

REM Verifica Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRORE: Node.js non e' installato!
    echo.
    echo Installa Node.js da: https://nodejs.org/
    echo Poi riavvia questo script.
    pause
    exit /b 1
)

REM Verifica se node_modules esiste
if not exist "node_modules" (
    echo Installazione dipendenze...
    echo Questo potrebbe richiedere alcuni minuti...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERRORE durante l'installazione delle dipendenze!
        pause
        exit /b 1
    )
    echo Dipendenze installate con successo!
    echo.
)

REM Avvia il server
echo Avvio server Next.js...
echo Il server sara' disponibile su: http://localhost:3000
echo Premi CTRL+C per fermare il server
echo.

call npm run dev

pause

