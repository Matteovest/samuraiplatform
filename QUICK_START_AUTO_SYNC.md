# ⚡ Quick Start - Sincronizzazione Automatica GitHub

## 🚀 Setup in 3 Passi

### 1. Installa Git (se non ce l'hai)

**Scarica da:** https://git-scm.com/download/win

**Oppure via terminale:**
```powershell
winget install --id Git.Git -e --source winget
```

### 2. Esegui lo Script di Setup

Apri PowerShell nella cartella del progetto e esegui:

```powershell
cd C:\Users\Matteo\.cursor
.\setup-auto-sync-github.ps1
```

Segui le istruzioni a schermo (inserisci nome e email per Git).

### 3. Collega il Tuo Repository GitHub

```powershell
git remote add origin https://github.com/TUOUSERNANE/NOME-REPO.git
```

**Sostituisci:**
- `TUOUSERNANE` con il tuo username GitHub
- `NOME-REPO` con il nome del repository

**Esempio:**
```powershell
git remote add origin https://github.com/matteo/enoteca-angolo-del-vino.git
```

---

## ▶️ Avvia la Sincronizzazione Automatica

### Opzione A: File Watcher (Monitoraggio Continuo)

Avvia il file watcher che monitora i file e fa commit automatico:

```powershell
.\file-watcher.ps1
```

**Cosa fa:**
- Rimane in esecuzione e monitora i file
- Quando salvi un file, aspetta 5 secondi
- Esegue automaticamente commit e push su GitHub
- Mostra messaggi quando rileva modifiche

**Per fermare:** Premi `CTRL+C`

### Opzione B: Commit Manuale

Esegui il commit quando vuoi tu:

```powershell
.\auto-commit.ps1
```

Oppure con messaggio personalizzato:

```powershell
.\auto-commit.ps1 -CommitMessage "Aggiornamento prodotti"
```

---

## ✅ Verifica che Funzioni

1. Modifica un file (es. `index.html`)
2. Salva il file in Cursor
3. Se il file watcher è attivo, vedrai un messaggio dopo pochi secondi
4. Controlla su GitHub che le modifiche siano state caricate

---

## 🎯 Workflow Giornaliero

### Al Mattino:
```powershell
# Avvia il file watcher
.\file-watcher.ps1
```

### Durante la Giornata:
- Lavora normalmente in Cursor
- Salva i file normalmente
- Il file watcher fa tutto automaticamente!

### Alla Sera:
- Premi `CTRL+C` per fermare il file watcher
- Oppure lascialo in esecuzione (non fa male)

---

## ⚙️ Configurazione Avanzata

### Cambiare il Tempo di Attesa

Nel file `file-watcher.ps1`, modifica:

```powershell
param(
    [int]$ThrottleSeconds = 5  # Cambia qui (es. 10 per 10 secondi)
)
```

---

## ❓ Problemi?

**"git non è riconosciuto"**
→ Installa Git: https://git-scm.com/download/win

**"Repository remoto non configurato"**
→ Esegui: `git remote add origin https://github.com/TUOUSERNANE/NOME-REPO.git`

**"Errore di autenticazione"**
→ GitHub richiede autenticazione. Usa un Personal Access Token o GitHub CLI.

---

## 📚 Documentazione Completa

Per dettagli completi, vedi: `CONFIGURA_AUTO_SYNC.md`

---

**Fatto! Ora ogni modifica viene automaticamente sincronizzata su GitHub!** 🎉

