# Script per Auto-Commit e Push su GitHub
# Esegue automaticamente commit e push quando i file vengono modificati

param(
    [string]$CommitMessage = "Auto commit from Cursor - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

$ErrorActionPreference = "Continue"

Write-Host "[Auto-Sync] Rilevata modifica ai file..." -ForegroundColor Cyan

# Vai alla directory del repository
$repoPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoPath

try {
    # Aggiungi tutti i file modificati
    Write-Host "[Auto-Sync] Aggiunta file modificati..." -ForegroundColor Yellow
    git add -A 2>&1 | Out-Null
    
    # Controlla se ci sono modifiche da committare
    $status = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Host "[Auto-Sync] Nessuna modifica rilevata" -ForegroundColor Gray
        exit 0
    }
    
    # Esegui commit
    Write-Host "[Auto-Sync] Esecuzione commit..." -ForegroundColor Yellow
    $commitOutput = git commit -m $CommitMessage 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[Auto-Sync] ✓ Commit eseguito con successo" -ForegroundColor Green
        
        # Esegui push
        Write-Host "[Auto-Sync] Invio modifiche a GitHub..." -ForegroundColor Yellow
        $pushOutput = git push 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[Auto-Sync] ✓ Push completato con successo!" -ForegroundColor Green
        } else {
            Write-Host "[Auto-Sync] ⚠️ Errore durante il push:" -ForegroundColor Red
            Write-Host $pushOutput -ForegroundColor Red
            Write-Host ""
            Write-Host "Possibili cause:" -ForegroundColor Yellow
            Write-Host "- Repository remoto non configurato" -ForegroundColor Yellow
            Write-Host "- Problemi di autenticazione" -ForegroundColor Yellow
            Write-Host "- Conflitti con il repository remoto" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Per configurare il repository remoto:" -ForegroundColor Cyan
            Write-Host "git remote add origin https://github.com/TUOUSERNANE/NOME-REPO.git" -ForegroundColor White
        }
    } else {
        Write-Host "[Auto-Sync] ⚠️ Errore durante il commit:" -ForegroundColor Red
        Write-Host $commitOutput -ForegroundColor Red
    }
} catch {
    Write-Host "[Auto-Sync] ❌ Errore: $_" -ForegroundColor Red
}

