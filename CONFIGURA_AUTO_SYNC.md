# 🔄 Configurazione Sincronizzazione Automatica con GitHub

## 📋 Panoramica

Questo sistema permette di sincronizzare automaticamente il codice da Cursor a GitHub. Quando salvi un file in Cursor, viene automaticamente fatto commit e push su GitHub.

---

## ⚙️ Requisiti

1. **Git installato** sul sistema
   - Scarica da: https://git-scm.com/download/win
   - Oppure: `winget install --id Git.Git -e --source winget`

2. **Account GitHub**
   - Crea account su: https://github.com (se non ce l'hai)

3. **Repository GitHub**
   - Crea un repository su GitHub (vedi guida pubblicazione)

---

## 🚀 Setup Automatico (Consigliato)

### Passo 1: Esegui lo Script di Setup

1. Apri PowerShell nella cartella del progetto:
   ```
   cd C:\Users\Matteo\.cursor
   ```

2. Esegui lo script di configurazione:
   ```
   .\setup-auto-sync-github.ps1
   ```

3. Segui le istruzioni a schermo (inserisci nome e email per Git)

---

## 📝 Setup Manuale

### Passo 1: Installa Git

Se Git non è installato:

**Opzione A - Download Manuale:**
1. Vai su: https://git-scm.com/download/win
2. Scarica e installa Git for Windows
3. Durante l'installazione, lascia tutte le opzioni predefinite
4. Riavvia il terminale/Cursor dopo l'installazione

**Opzione B - Winget:**
```powershell
winget install --id Git.Git -e --source winget
```

### Passo 2: Configura Git

Apri PowerShell e configura Git con il tuo nome e email:

```powershell
git config --global user.name "Il Tuo Nome"
git config --global user.email "tua.email@example.com"
```

### Passo 3: Inizializza Repository Git

Nella cartella del progetto:

```powershell
cd C:\Users\Matteo\.cursor
git init
```

### Passo 4: Collega Repository GitHub

Sostituisci `TUOUSERNANE` e `NOME-REPO` con i tuoi dati:

```powershell
git remote add origin https://github.com/TUOUSERNANE/NOME-REPO.git
```

**Esempio:**
```powershell
git remote add origin https://github.com/matteo/enoteca-angolo-del-vino.git
```

### Passo 5: Prima Sincronizzazione

```powershell
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

---

## 🔄 Metodi di Sincronizzazione Automatica

### Metodo 1: File Watcher (Automatico in Tempo Reale)

Il file watcher monitora i file e fa commit automatico quando vengono salvati.

**Avvia il File Watcher:**
```powershell
.\file-watcher.ps1
```

**Come Funziona:**
- Lo script rimane in esecuzione
- Quando salvi un file in Cursor, lo script lo rileva
- Aspetta 5 secondi (per raggruppare modifiche multiple)
- Esegue automaticamente `git add`, `commit` e `push`

**Per Fermare:**
- Premi `CTRL+C` nel terminale dove è in esecuzione

**Per Eseguire in Background:**
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-File", ".\file-watcher.ps1"
```

---

### Metodo 2: Commit Manuale On-Demand

Se preferisci controllare quando fare commit, puoi eseguire manualmente:

```powershell
.\auto-commit.ps1
```

Oppure con un messaggio personalizzato:

```powershell
.\auto-commit.ps1 -CommitMessage "Aggiornamento prodotti e prezzi"
```

---

### Metodo 3: Git Hook (Avanzato)

Puoi configurare un Git hook per eseguire push automatico dopo ogni commit locale.

**Crea il file `.git\hooks\post-commit`:**

```powershell
# Crea la cartella hooks se non esiste
New-Item -ItemType Directory -Force -Path .git\hooks

# Crea lo script post-commit
@'
#!/bin/sh
git push origin main
'@ | Out-File -FilePath .git\hooks\post-commit -Encoding ASCII -NoNewline

# Rendi eseguibile (su Windows PowerShell)
icacls .git\hooks\post-commit /grant Everyone:RX
```

---

## ⚙️ Configurazione Cursor (Opzionale)

### Configurazione Tasks in Cursor

Crea un file `.vscode\tasks.json`:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Auto Commit to GitHub",
            "type": "shell",
            "command": "powershell",
            "args": ["-File", "${workspaceFolder}/auto-commit.ps1"],
            "problemMatcher": [],
            "runOptions": {
                "runOn": "fileSaved"
            }
        }
    ]
}
```

**Nota:** Cursor potrebbe non supportare direttamente `runOn: fileSaved`. In questo caso, usa il file watcher.

---

## 🔧 Personalizzazione

### Modificare il Throttle (Tempo di Attesa)

Nel file `file-watcher.ps1`, modifica la variabile:

```powershell
param(
    [int]$ThrottleSeconds = 5  # Cambia questo valore (in secondi)
)
```

- **Valore più basso** (es. 2 secondi): commit più frequenti, più controlli
- **Valore più alto** (es. 30 secondi): raggruppa più modifiche insieme

### Modificare il Messaggio di Commit

Nel file `auto-commit.ps1`, modifica:

```powershell
$CommitMessage = "Auto commit from Cursor - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
```

---

## ❓ Risoluzione Problemi

### Problema: "git non è riconosciuto"

**Soluzione:**
1. Installa Git: https://git-scm.com/download/win
2. Riavvia Cursor/terminal
3. Verifica: `git --version`

### Problema: "Repository remoto non configurato"

**Soluzione:**
```powershell
git remote add origin https://github.com/TUOUSERNANE/NOME-REPO.git
```

Per verificare:
```powershell
git remote -v
```

### Problema: "Autenticazione fallita"

**Soluzione:**
GitHub richiede autenticazione. Opzioni:

**Opzione A - Personal Access Token:**
1. GitHub → Settings → Developer settings → Personal access tokens
2. Genera nuovo token con permessi "repo"
3. Usa il token come password quando richiesto

**Opzione B - GitHub CLI:**
```powershell
winget install --id GitHub.cli
gh auth login
```

**Opzione C - Credential Manager:**
Git for Windows include Git Credential Manager che gestisce l'autenticazione automaticamente.

### Problema: "Conflitti con repository remoto"

**Soluzione:**
```powershell
# Prima di fare push, fai pull
git pull origin main --rebase

# Poi esegui di nuovo il commit
.\auto-commit.ps1
```

### Problema: "File watcher non rileva modifiche"

**Possibili cause:**
- Lo script è stato chiuso → Riavvia `.\file-watcher.ps1`
- File salvati in un'altra cartella → Verifica il percorso
- Permessi insufficienti → Esegui PowerShell come amministratore

---

## 🔐 Sicurezza

**⚠️ Attenzione:**
- Il commit automatico non verifica cosa stai committando
- Evita di committare file sensibili (password, chiavi API, ecc.)
- Usa `.gitignore` per escludere file che non vuoi committare

**File consigliati da aggiungere a `.gitignore`:**
- File temporanei
- File di configurazione locale
- File con dati sensibili

---

## 📊 Workflow Consigliato

### Per Sviluppo Giornaliero:

1. **Avvia il file watcher all'inizio della giornata:**
   ```powershell
   .\file-watcher.ps1
   ```

2. **Lascia il file watcher in esecuzione** (minimizza la finestra)

3. **Lavora normalmente in Cursor** - ogni salvataggio viene automaticamente committato e pushato

4. **Verifica su GitHub** che le modifiche siano state caricate

### Per Modifiche Importanti:

1. **Ferma il file watcher** (CTRL+C)

2. **Fai le modifiche e testa localmente**

3. **Esegui commit manuale con messaggio descrittivo:**
   ```powershell
   .\auto-commit.ps1 -CommitMessage "Aggiunta sezione bollicine e aggiornamento prezzi"
   ```

4. **Riavvia il file watcher se necessario**

---

## 🎯 Quick Start

**Setup completo in 3 passi:**

1. **Esegui setup:**
   ```powershell
   .\setup-auto-sync-github.ps1
   ```

2. **Collega GitHub** (se non già fatto):
   ```powershell
   git remote add origin https://github.com/TUOUSERNANE/NOME-REPO.git
   ```

3. **Avvia file watcher:**
   ```powershell
   .\file-watcher.ps1
   ```

**Fatto! Ora ogni modifica viene automaticamente sincronizzata su GitHub!** 🚀

---

## 💡 Suggerimenti

- **Testa prima manualmente:** Prima di attivare il file watcher, prova `.\auto-commit.ps1` manualmente
- **Controlla i log:** Il file watcher mostra messaggi quando rileva modifiche
- **Commit manuali per modifiche importanti:** Usa commit manuali con messaggi descrittivi per modifiche significative
- **Backup:** Git stesso è un backup, ma considera anche backup esterni

---

## 📞 Supporto

Se incontri problemi, controlla:
1. Git è installato e configurato
2. Il repository remoto è configurato correttamente
3. Hai i permessi per push sul repository
4. La connessione internet è attiva

