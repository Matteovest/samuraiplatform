# Script PowerShell per avviare Samurai Platform
# Esegui questo script dopo aver installato Node.js

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Samurai Platform - Avvio Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se Node.js è installato
Write-Host "Verifica Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installato: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERRORE: Node.js non è installato!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installa Node.js da: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Poi riavvia questo script." -ForegroundColor Yellow
    Read-Host "Premi INVIO per uscire"
    exit 1
}

# Verifica se npm è installato
Write-Host "Verifica npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm installato: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERRORE: npm non trovato!" -ForegroundColor Red
    Read-Host "Premi INVIO per uscire"
    exit 1
}

Write-Host ""

# Verifica se node_modules esiste
if (-not (Test-Path "node_modules")) {
    Write-Host "Installazione dipendenze..." -ForegroundColor Yellow
    Write-Host "Questo potrebbe richiedere alcuni minuti..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ ERRORE durante l'installazione delle dipendenze!" -ForegroundColor Red
        Read-Host "Premi INVIO per uscire"
        exit 1
    }
    Write-Host "✓ Dipendenze installate con successo!" -ForegroundColor Green
    Write-Host ""
}

# Avvia il server
Write-Host "Avvio server Next.js..." -ForegroundColor Yellow
Write-Host "Il server sarà disponibile su: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Premi CTRL+C per fermare il server" -ForegroundColor Yellow
Write-Host ""

npm run dev

