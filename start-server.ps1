# Script PowerShell per avviare un server HTTP locale
# Per servire il sito web dell'enoteca

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Server Locale Enoteca" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se Python è installato
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} else {
    Write-Host "❌ Python non trovato!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opzioni:" -ForegroundColor Yellow
    Write-Host "1. Installa Python da https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "2. Usa Node.js: npm install -g http-server" -ForegroundColor Yellow
    Write-Host "3. Usa PHP: php -S localhost:8000" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit
}

Write-Host "✓ Python trovato" -ForegroundColor Green
Write-Host ""

# Ottieni l'indirizzo IP locale
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"} | Select-Object -First 1).IPAddress

if (-not $localIP) {
    $localIP = "localhost"
}

Write-Host "Avviando il server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📍 Accesso al sito:" -ForegroundColor Cyan
Write-Host "   • Sul tuo computer: http://localhost:8000" -ForegroundColor White
if ($localIP -ne "localhost") {
    Write-Host "   • Nella tua rete: http://$localIP:8000" -ForegroundColor White
}
Write-Host ""
Write-Host "⚠ Premi CTRL+C per fermare il server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Apri il browser automaticamente
Start-Sleep -Seconds 1
Start-Process "http://localhost:8000"

# Avvia il server
& $pythonCmd -m http.server 8000

