# 🚀 Pubblica su Netlify - Guida Rapida

Netlify è altrettanto veloce e offre deploy drag-and-drop!

## ⚡ Metodo 1: Drag & Drop (PIÙ RAPIDO - 2 minuti)

### Passo 1: Prepara il progetto

```powershell
cd "C:\Users\Matteo\.cursor"
npm run build
```

Questo crea la cartella `.next` con il sito pronto.

### Passo 2: Pubblica su Netlify

1. Vai su: https://app.netlify.com
2. **Registrati/Accedi** (puoi usare GitHub)
3. Nella dashboard, trova la sezione **"Sites"**
4. **Trascina e rilascia** la cartella `.next` nella zona "Deploy manually"
5. **Attendi 1-2 minuti**
6. **Fatto!** Il sito è online con URL tipo: `https://random-name-12345.netlify.app`

**Vantaggi:**
- ✅ Nessun Git necessario
- ✅ Super veloce (2 minuti)
- ✅ Funziona subito

**Svantaggi:**
- ❌ Deploy manuale ogni volta
- ❌ Devi rifare il build ogni volta

---

## 🔄 Metodo 2: GitHub + Netlify (Deploy Automatico)

### Passo 1: Carica su GitHub

```powershell
cd "C:\Users\Matteo\.cursor"
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TUO_USERNAME/samurai-platform.git
git push -u origin main
```

### Passo 2: Collega Netlify

1. Vai su: https://app.netlify.com
2. Clicca **"Add new site"** → **"Import an existing project"**
3. Scegli **"Deploy with GitHub"**
4. Autorizza Netlify ad accedere a GitHub
5. Seleziona il repository `samurai-platform`
6. Configura:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
7. Clicca **"Deploy site"**

### Passo 3: Configura Next.js

Netlify potrebbe richiedere un file di configurazione. Crea `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Poi fai push:
```powershell
git add netlify.toml
git commit -m "Add Netlify config"
git push
```

---

## 📊 Confronto: Netlify vs Vercel

| Caratteristica | Netlify | Vercel |
|---------------|---------|--------|
| **Velocità setup** | ⚡⚡⚡ (Drag & drop) | ⚡⚡ (Richiede Git) |
| **Deploy automatico** | ✅ | ✅ |
| **Next.js ottimizzato** | ✅ | ✅✅ (Migliore) |
| **SSL gratuito** | ✅ | ✅ |
| **Dominio gratuito** | ✅ | ✅ |
| **Bandwidth gratuito** | 100GB | 100GB |
| **Build time** | 300 min/mese | 6000 min/mese |

---

## 🎯 Quale scegliere?

### Scegli **Netlify** se:
- ✅ Vuoi deploy immediato senza Git
- ✅ Preferisci drag & drop
- ✅ Hai bisogno di funzionalità come Forms, Functions

### Scegli **Vercel** se:
- ✅ Usi Next.js (ottimizzato meglio)
- ✅ Vuoi più build time gratuito
- ✅ Preferisci integrazione GitHub più fluida

---

## ⚡ Metodo Più Veloce: Netlify Drag & Drop

**Tempo totale: 2 minuti**

1. `npm run build` (30 secondi)
2. Trascina `.next` su Netlify (1 minuto)
3. Fatto! 🎉

---

## 🔧 Configurazione Avanzata (Opzionale)

### Dominio personalizzato

1. Vai su: **Site settings** → **Domain management**
2. Clicca **"Add custom domain"**
3. Inserisci il tuo dominio
4. Segui le istruzioni per configurare il DNS

### Variabili d'ambiente

1. Vai su: **Site settings** → **Environment variables**
2. Aggiungi le variabili necessarie
3. Riavvia il deploy

---

## 🆘 Problemi Comuni

### Errore "Build failed"

```powershell
# Pulisci e ricostruisci
rm -rf .next node_modules
npm install
npm run build
```

### Il sito non si aggiorna

- Controlla i log nel dashboard Netlify
- Verifica che il build sia completato
- Attendi 1-2 minuti per la propagazione

### Errore 404 su pagine

- Verifica che `netlify.toml` sia configurato correttamente
- Assicurati che il plugin Next.js sia installato

---

## ✅ Checklist

- [ ] Progetto compila (`npm run build`)
- [ ] File `netlify.toml` creato (se usi Git)
- [ ] Repository GitHub creato (se usi deploy automatico)
- [ ] Account Netlify creato
- [ ] Deploy completato con successo

---

## 🎉 Fatto!

Il tuo sito è online su Netlify!

**URL:** `https://tuo-sito.netlify.app`

Ogni push su GitHub aggiornerà automaticamente il sito (se hai configurato il deploy automatico).

