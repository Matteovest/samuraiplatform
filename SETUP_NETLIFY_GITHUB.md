# 🚀 Setup Netlify + GitHub - Passo Passo

## Passo 1: Prepara il Progetto

Assicurati che il progetto compili:

```powershell
cd "C:\Users\Matteo\.cursor"
npm run build
```

Se vedi "Build successful", sei pronto! ✅

## Passo 2: Crea Repository su GitHub

1. Vai su: **https://github.com/new**
2. **Repository name:** `samurai-platform` (o il nome che preferisci)
3. **Description:** "Piattaforma di backtesting e analisi per trader"
4. Scegli **Public** o **Private**
5. **NON** selezionare "Add a README file"
6. Clicca **"Create repository"**

## Passo 3: Carica il Codice su GitHub

Apri PowerShell e esegui questi comandi:

```powershell
# Assicurati di essere nella cartella corretta
cd "C:\Users\Matteo\.cursor"

# Aggiungi tutti i file
git add .

# Crea il primo commit
git commit -m "Initial commit - Samurai Platform"

# Rinomina branch in main
git branch -M main

# Collega a GitHub (SOSTITUISCI TUO_USERNAME con il tuo username GitHub)
git remote add origin https://github.com/TUO_USERNAME/samurai-platform.git

# Carica il codice
git push -u origin main
```

**Nota Login:**
- Se ti chiede username/password:
  - Username: il tuo username GitHub
  - Password: usa un **Personal Access Token**
    - Vai su: https://github.com/settings/tokens
    - Clicca "Generate new token (classic)"
    - Seleziona scope: `repo`
    - Copia il token e usalo come password

## Passo 4: Collega Netlify a GitHub

1. Vai su: **https://app.netlify.com**
2. Clicca **"Sign up"** (se non hai account)
3. Scegli **"Sign up with GitHub"**
4. Autorizza Netlify ad accedere a GitHub
5. Nella dashboard, clicca **"Add new site"**
6. Seleziona **"Import an existing project"**
7. Clicca **"Deploy with GitHub"**
8. Autorizza Netlify (se richiesto)
9. Seleziona il repository **`samurai-platform`**

## Passo 5: Configura il Deploy

Netlify dovrebbe rilevare automaticamente Next.js, ma verifica:

- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Base directory:** (lascia vuoto)

Se non vedi queste impostazioni:
1. Clicca **"Show advanced"**
2. Inserisci manualmente:
   - Build command: `npm run build`
   - Publish directory: `.next`

## Passo 6: Deploy!

1. Clicca **"Deploy site"**
2. Attendi 2-3 minuti per il build
3. **Fatto!** 🎉 Il sito è online!

Il tuo URL sarà tipo: `https://samurai-platform-12345.netlify.app`

## ✅ Deploy Automatico Attivo!

Ora ogni volta che fai push su GitHub, Netlify aggiornerà automaticamente il sito:

```powershell
# Dopo ogni modifica
git add .
git commit -m "Descrizione modifiche"
git push
```

Il sito si aggiornerà automaticamente in 2-3 minuti!

## 🔧 Personalizza il Dominio

1. Vai sul dashboard Netlify
2. Seleziona il tuo sito
3. Vai su **"Site settings"** → **"Domain management"**
4. Clicca **"Add custom domain"**
5. Inserisci il tuo dominio
6. Segui le istruzioni per configurare il DNS

## 🆘 Problemi?

### Errore durante push
- Verifica che il repository esista su GitHub
- Usa un Personal Access Token invece della password
- Controlla di avere i permessi sul repository

### Build fallito su Netlify
- Controlla i log nel dashboard Netlify
- Verifica che `netlify.toml` sia presente
- Assicurati che il progetto compili localmente (`npm run build`)

### Il sito non si aggiorna
- Verifica che il push su GitHub sia andato a buon fine
- Controlla i log di deploy su Netlify
- Attendi 2-3 minuti per il deploy automatico

## 📋 Checklist

- [ ] Progetto compila (`npm run build`)
- [ ] Repository GitHub creato
- [ ] Codice caricato su GitHub
- [ ] Account Netlify creato
- [ ] Repository collegato a Netlify
- [ ] Deploy completato con successo
- [ ] Sito accessibile online

## 🎉 Fatto!

Il tuo sito è online e si aggiorna automaticamente ad ogni push!

