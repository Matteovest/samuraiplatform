# Script PowerShell per Configurare la Sincronizzazione Automatica con GitHub
# Esegui questo script una sola volta per configurare tutto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configurazione Auto-Sync GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se Git è installato
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue

if (-not $gitInstalled) {
    Write-Host "❌ Git non è installato!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opzioni per installare Git:" -ForegroundColor Yellow
    Write-Host "1. Scarica Git da: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "2. Installa Git per Windows" -ForegroundColor Yellow
    Write-Host "3. Riavvia Cursor/terminal dopo l'installazione" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Oppure installa Git tramite winget (se disponibile):" -ForegroundColor Yellow
    Write-Host "winget install --id Git.Git -e --source winget" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit
}

Write-Host "✓ Git trovato" -ForegroundColor Green
Write-Host ""

# Verifica se siamo in un repository Git
$isGitRepo = Test-Path ".git"

if (-not $isGitRepo) {
    Write-Host "📁 Inizializzazione repository Git..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Repository Git inizializzato" -ForegroundColor Green
    Write-Host ""
}

# Crea file .gitignore se non esiste
if (-not (Test-Path ".gitignore")) {
    Write-Host "📝 Creazione file .gitignore..." -ForegroundColor Yellow
    @"
# Cursor IDE files
.cursor/
.vscode/

# System files
.DS_Store
Thumbs.db
*.log

# Temporary files
*.tmp
*~
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host "✓ File .gitignore creato" -ForegroundColor Green
    Write-Host ""
}

# Configurazione Git (se non già configurata)
Write-Host "⚙️ Configurazione Git..." -ForegroundColor Yellow
Write-Host ""
$gitUser = git config --global user.name
$gitEmail = git config --global user.email

if (-not $gitUser) {
    $userName = Read-Host "Inserisci il tuo nome per Git (es. Matteo)"
    git config --global user.name $userName
}

if (-not $gitEmail) {
    $userEmail = Read-Host "Inserisci la tua email per Git (es. matteo@example.com)"
    git config --global user.email $userEmail
}

Write-Host "✓ Git configurato" -ForegroundColor Green
Write-Host ""

# Crea script per auto-commit
Write-Host "📝 Creazione script auto-commit..." -ForegroundColor Yellow

$autoCommitScript = @'
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
        }
    } else {
        Write-Host "[Auto-Sync] ⚠️ Errore durante il commit:" -ForegroundColor Red
        Write-Host $commitOutput -ForegroundColor Red
    }
} catch {
    Write-Host "[Auto-Sync] ❌ Errore: $_" -ForegroundColor Red
}

'@

$autoCommitScript | Out-File -FilePath "auto-commit.ps1" -Encoding UTF8
Write-Host "✓ Script auto-commit creato" -ForegroundColor Green
Write-Host ""

# Crea script file watcher
Write-Host "📝 Creazione script file watcher..." -ForegroundColor Yellow

$watcherScript = @'
# File Watcher per Auto-Sync con GitHub
# Monitora i file e esegue commit automatico quando vengono salvati

param(
    [string]$Path = $PSScriptRoot,
    [int]$ThrottleSeconds = 5
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  File Watcher - Auto-Sync GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Monitoraggio cartella: $Path" -ForegroundColor White
Write-Host "⏱️  Throttle: $ThrottleSeconds secondi" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Premi CTRL+C per fermare il monitoraggio" -ForegroundColor Yellow
Write-Host ""

# File da ignorare
$ignorePatterns = @(".git", ".cursor", "*.log", "*.tmp")

# Timer per evitare troppi commit
$lastCommitTime = 0
$pendingChanges = $false

# Funzione per eseguire commit
function Invoke-AutoCommit {
    param([string]$Message)
    
    $scriptPath = Join-Path $Path "auto-commit.ps1"
    if (Test-Path $scriptPath) {
        & powershell -ExecutionPolicy Bypass -File $scriptPath -CommitMessage $Message
    }
}

# Crea FileSystemWatcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $Path
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Filtra solo i file importanti
$watcher.Filter = "*"
$watcher.NotifyFilter = [System.IO.NotifyFilters]::FileName, [System.IO.NotifyFilters]::LastWrite

# Handler per modifiche
$action = {
    $file = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    
    # Ignora file che non ci interessano
    $shouldIgnore = $false
    foreach ($pattern in $ignorePatterns) {
        if ($file -like "*$pattern*") {
            $shouldIgnore = $true
            break
        }
    }
    
    if ($shouldIgnore) { return }
    
    # Ignora se è un file temporaneo
    if ($file -like "*~" -or $file -like "*.tmp") { return }
    
    # Ignora file nella cartella .git
    if ($file -like "*\.git\*") { return }
    
    $script:pendingChanges = $true
    $now = Get-Date
    $elapsed = ($now - (Get-Date $script:lastCommitTime)).TotalSeconds
    
    if ($elapsed -gt $ThrottleSeconds) {
        $fileName = Split-Path $file -Leaf
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 📝 File modificato: $fileName" -ForegroundColor Cyan
        
        $commitMsg = "Auto commit: $fileName - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Invoke-AutoCommit -Message $commitMsg
        
        $script:lastCommitTime = Get-Date
        $script:pendingChanges = $false
    }
}

# Registra gli eventi
Register-ObjectEvent $watcher "Changed" -Action $action | Out-Null
Register-ObjectEvent $watcher "Created" -Action $action | Out-Null
Register-ObjectEvent $watcher "Deleted" -Action $action | Out-Null

Write-Host "✅ File watcher avviato. In ascolto per modifiche..." -ForegroundColor Green
Write-Host ""

# Mantieni lo script in esecuzione
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Esegui commit pendenti dopo il throttle
        if ($pendingChanges) {
            $now = Get-Date
            $elapsed = ($now - (Get-Date $lastCommitTime)).TotalSeconds
            
            if ($elapsed -gt $ThrottleSeconds) {
                Invoke-AutoCommit -Message "Auto commit: modifiche multiple - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
                $lastCommitTime = Get-Date
                $pendingChanges = $false
            }
        }
    }
} finally {
    $watcher.Dispose()
    Write-Host ""
    Write-Host "🛑 File watcher fermato" -ForegroundColor Yellow
}

'@

$watcherScript | Out-File -FilePath "file-watcher.ps1" -Encoding UTF8
Write-Host "✓ Script file watcher creato" -ForegroundColor Green
Write-Host ""

# Istruzioni finali
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configurazione Completata!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Script creati:" -ForegroundColor Green
Write-Host "   • auto-commit.ps1 - Esegue commit e push" -ForegroundColor White
Write-Host "   • file-watcher.ps1 - Monitora i file e auto-committa" -ForegroundColor White
Write-Host ""
Write-Host "📋 Prossimi Passi:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Collega il repository GitHub:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/TUOUSERNANE/NOME-REPO.git" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Per avviare il file watcher (monitoraggio automatico):" -ForegroundColor White
Write-Host "   .\file-watcher.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Oppure esegui manualmente il commit quando vuoi:" -ForegroundColor White
Write-Host "   .\auto-commit.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Nota: Il file watcher deve rimanere in esecuzione per funzionare." -ForegroundColor Yellow
Write-Host "   Puoi minimizzarlo ma non chiuderlo." -ForegroundColor Yellow
Write-Host ""
pause

