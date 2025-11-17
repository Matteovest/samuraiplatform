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
$ignorePatterns = @(".git", ".cursor", "*.log", "*.tmp", "~$")

# Timer per evitare troppi commit
$lastCommitTime = Get-Date
$pendingChanges = $false

# Funzione per eseguire commit
function Invoke-AutoCommit {
    param([string]$Message)
    
    $scriptPath = Join-Path $Path "auto-commit.ps1"
    if (Test-Path $scriptPath) {
        & powershell -ExecutionPolicy Bypass -File $scriptPath -CommitMessage $Message
        return $true
    }
    return $false
}

# Crea FileSystemWatcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $Path
$watcher.IncludeSubdirectories = $false  # Non monitorare sottocartelle per evitare loop
$watcher.EnableRaisingEvents = $true

# Filtra solo i file importanti (HTML, CSS, JS, MD)
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
    
    # Ignora se è un file temporaneo o di sistema
    if ($shouldIgnore) { return }
    if ($file -like "*~" -or $file -like "*.tmp") { return }
    if ($file -like "*\.git\*") { return }
    if ($file -like "*\.cursor\*") { return }
    
    # Solo file rilevanti
    $ext = [System.IO.Path]::GetExtension($file)
    $relevantExts = @(".html", ".css", ".js", ".md", ".txt", ".jpg", ".jpeg", ".png")
    if ($relevantExts -notcontains $ext -and $ext -ne "") { return }
    
    $script:pendingChanges = $true
    $fileName = Split-Path $file -Leaf
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 📝 File modificato: $fileName" -ForegroundColor Cyan
}

# Registra gli eventi
$changedEvent = Register-ObjectEvent $watcher "Changed" -Action $action
$createdEvent = Register-ObjectEvent $watcher "Created" -Action $action
$deletedEvent = Register-ObjectEvent $watcher "Deleted" -Action $action

Write-Host "✅ File watcher avviato. In ascolto per modifiche..." -ForegroundColor Green
Write-Host ""

# Timer per eseguire commit periodici
$timer = [System.Timers.Timer]::new($ThrottleSeconds * 1000)
$timer.AutoReset = $true

$timer.Add_Elapsed({
    if ($pendingChanges) {
        $now = Get-Date
        $elapsed = ($now - $lastCommitTime).TotalSeconds
        
        if ($elapsed -ge $ThrottleSeconds) {
            $commitMsg = "Auto commit: modifiche rilevate - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            Invoke-AutoCommit -Message $commitMsg | Out-Null
            $script:lastCommitTime = Get-Date
            $script:pendingChanges = $false
        }
    }
})

$timer.Start()

# Mantieni lo script in esecuzione
try {
    Write-Host "File watcher attivo. Modifica e salva i file per vedere i commit automatici." -ForegroundColor Green
    Write-Host ""
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    $timer.Stop()
    $timer.Dispose()
    $watcher.Dispose()
    Unregister-Event -SourceIdentifier $changedEvent.Name
    Unregister-Event -SourceIdentifier $createdEvent.Name
    Unregister-Event -SourceIdentifier $deletedEvent.Name
    Write-Host ""
    Write-Host "🛑 File watcher fermato" -ForegroundColor Yellow
}

