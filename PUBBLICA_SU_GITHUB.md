# 🚀 Pubblica Samurai Platform su GitHub + Vercel

## Passo 1: Crea Repository su GitHub

1. Vai su: https://github.com/new
2. **Repository name:** `samurai-platform` (o il nome che preferisci)
3. **Description:** "Piattaforma di backtesting e analisi per trader"
4. Scegli **Public** o **Private**
5. **NON** selezionare "Add a README file" (abbiamo già i file)
6. Clicca **"Create repository"**

## Passo 2: Carica il Codice su GitHub

Apri PowerShell nella cartella del progetto e esegui questi comandi:

```powershell
# Assicurati di essere nella cartella corretta
cd "C:\Users\Matteo\.cursor"

# Aggiungi tutti i file
git add .

# Crea il primo commit
git commit -m "Initial commit - Samurai Platform"

# Rinomina il branch in main (se necessario)
git branch -M main

# Collega al repository GitHub (SOSTITUISCI TUO_USERNAME)
git remote add origin https://github.com/TUO_USERNAME/samurai-platform.git

# Carica il codice
git push -u origin main
```

**Nota:** Sostituisci `TUO_USERNAME` con il tuo username GitHub.

Se ti chiede login:
- Username: il tuo username GitHub
- Password: usa un **Personal Access Token** (non la password normale)
  - Vai su: https://github.com/settings/tokens
  - Clicca "Generate new token (classic)"
  - Seleziona scope: `repo`
  - Copia il token e usalo come password

## Passo 3: Collega a Vercel

1. Vai su: https://vercel.com
2. Clicca **"Sign Up"** (se non hai account)
3. Scegli **"Continue with GitHub"**
4. Autorizza Vercel ad accedere a GitHub
5. Clicca **"Add New Project"**
6. Seleziona il repository `samurai-platform`
7. Vercel rileverà automaticamente Next.js
8. Clicca **"Deploy"**

## Passo 4: Attendi il Deploy

- Il deploy richiede 2-3 minuti
- Vercel ti mostrerà il progresso in tempo reale
- Al termine avrai un URL tipo: `https://samurai-platform.vercel.app`

## ✅ Fatto!

Il tuo sito è online! 🎉

### Deploy Automatici

Ogni volta che fai push su GitHub, Vercel aggiornerà automaticamente il sito:

```powershell
git add .
git commit -m "Aggiornamento"
git push
```

Il sito si aggiornerà automaticamente in 2-3 minuti!

---

## 🔧 Comandi Utili

### Aggiornare il sito dopo modifiche:
```powershell
git add .
git commit -m "Descrizione delle modifiche"
git push
```

### Verificare lo stato:
```powershell
git status
```

### Vedere i commit:
```powershell
git log
```

---

## 🆘 Problemi Comuni

### Errore "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/TUO_USERNAME/samurai-platform.git
```

### Errore durante push
- Verifica di avere i permessi sul repository
- Controlla che il repository esista su GitHub
- Usa un Personal Access Token invece della password

### Il sito non si aggiorna su Vercel
- Controlla i log nel dashboard Vercel
- Verifica che il push su GitHub sia andato a buon fine
- Attendi 2-3 minuti per il deploy automatico

