# 🚀 Carica Codice su GitHub - Passo Passo

Il repository https://github.com/Matteovest/samuraiplatform è vuoto. Carichiamo il codice!

## ✅ Passo 1: Collega il Repository

Apri PowerShell e esegui:

```powershell
cd "C:\Users\Matteo\.cursor"

# Collega al repository GitHub
git remote add origin https://github.com/Matteovest/samuraiplatform.git
```

Se dice "remote origin already exists", esegui prima:
```powershell
git remote remove origin
git remote add origin https://github.com/Matteovest/samuraiplatform.git
```

## ✅ Passo 2: Aggiungi e Committa i File

```powershell
# Aggiungi tutti i file
git add .

# Crea il commit
git commit -m "Initial commit - Samurai Platform"
```

## ✅ Passo 3: Rinomina Branch in Main

```powershell
git branch -M main
```

## ✅ Passo 4: Carica su GitHub

```powershell
git push -u origin main
```

**Se ti chiede login:**
- Username: `Matteovest`
- Password: usa un **Personal Access Token**
  - Vai su: https://github.com/settings/tokens
  - Clicca "Generate new token (classic)"
  - Seleziona scope: `repo`
  - Copia il token e usalo come password

## ✅ Passo 5: Verifica

Vai su: https://github.com/Matteovest/samuraiplatform

Dovresti vedere tutti i file del progetto!

## 🎯 Dopo il Push

Una volta caricato il codice, puoi:
1. Tornare su Netlify e selezionare il repository
2. Oppure usare Vercel (più semplice per Next.js)

