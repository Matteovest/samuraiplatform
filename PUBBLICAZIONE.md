# 🚀 Guida alla Pubblicazione - Samurai Platform

## Opzione 1: Vercel (Consigliato - Gratuito)

Vercel è il servizio ufficiale di Next.js, molto semplice e gratuito.

### Passo 1: Prepara il progetto

1. **Assicurati che il progetto funzioni localmente:**
   ```powershell
   npm run build
   ```
   Se vedi "Build successful", sei pronto!

### Passo 2: Crea account su Vercel

1. Vai su: https://vercel.com
2. Clicca su **"Sign Up"**
3. Registrati con GitHub, GitLab, Bitbucket o email

### Passo 3: Pubblica il progetto

**Metodo A: Tramite GitHub (Consigliato)**

1. **Crea un repository GitHub:**
   - Vai su: https://github.com/new
   - Nome repository: `samurai-platform` (o quello che preferisci)
   - Scegli **Public** o **Private**
   - Clicca **"Create repository"**

2. **Carica il codice su GitHub:**
   ```powershell
   # Nella cartella del progetto
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TUO_USERNAME/samurai-platform.git
   git push -u origin main
   ```

3. **Collega a Vercel:**
   - Vai su: https://vercel.com/new
   - Clicca **"Import Git Repository"**
   - Seleziona il tuo repository
   - Vercel rileverà automaticamente Next.js
   - Clicca **"Deploy"**

4. **Attendi il deploy** (2-3 minuti)
   - Vercel ti darà un URL tipo: `samurai-platform.vercel.app`

**Metodo B: Tramite Vercel CLI (Senza GitHub)**

1. **Installa Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Pubblica:**
   ```powershell
   cd "C:\Users\Matteo\.cursor"
   vercel
   ```

3. **Segui le istruzioni:**
   - Login con il tuo account Vercel
   - Conferma le impostazioni
   - Il sito sarà pubblicato!

### Passo 4: Dominio personalizzato (Opzionale)

1. Vai sul dashboard Vercel
2. Seleziona il tuo progetto
3. Vai su **Settings** → **Domains**
4. Aggiungi il tuo dominio (es. `samuraiplatform.com`)
5. Segui le istruzioni per configurare il DNS

---

## Opzione 2: Netlify (Alternativa gratuita)

### Passo 1: Prepara il progetto

Crea un file `netlify.toml` nella root del progetto:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Passo 2: Pubblica

1. Vai su: https://app.netlify.com
2. Registrati/Accedi
3. Clicca **"Add new site"** → **"Import an existing project"**
4. Collega GitHub o carica manualmente
5. Configura:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Clicca **"Deploy site"**

---

## Opzione 3: GitHub Pages (Gratuito ma più complesso)

Per Next.js su GitHub Pages serve una configurazione speciale.

### Passo 1: Installa gh-pages

```powershell
npm install --save-dev gh-pages
```

### Passo 2: Aggiorna package.json

Aggiungi questi script:

```json
{
  "scripts": {
    "export": "next build && next export",
    "deploy": "npm run export && gh-pages -d out"
  }
}
```

### Passo 3: Configura next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

### Passo 4: Pubblica

```powershell
npm run deploy
```

---

## Opzione 4: Hosting tradizionale (VPS/Server)

### Passo 1: Build del progetto

```powershell
npm run build
```

### Passo 2: Avvia in produzione

```powershell
npm start
```

Il server sarà disponibile su `http://localhost:3000`

### Passo 3: Configura reverse proxy (Nginx)

Esempio configurazione Nginx:

```nginx
server {
    listen 80;
    server_name tuodominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🎯 Raccomandazione

**Per iniziare velocemente:** Usa **Vercel** (Opzione 1 - Metodo B con CLI)
- Gratuito
- Setup in 5 minuti
- SSL automatico
- Deploy automatico ad ogni push

**Per controllo completo:** Usa **VPS/Server** (Opzione 4)
- Più configurazione
- Controllo totale
- Costi mensili

---

## ✅ Checklist Pre-Pubblicazione

- [ ] Il progetto compila senza errori (`npm run build`)
- [ ] Tutti i link funzionano
- [ ] Le immagini si caricano correttamente
- [ ] Il sito è responsive (mobile-friendly)
- [ ] Hai rimosso dati sensibili (se presenti)
- [ ] Hai configurato le variabili d'ambiente (se necessarie)

---

## 🔧 Risoluzione Problemi

### Errore durante il build

```powershell
# Pulisci la cache
rm -rf .next
npm run build
```

### Errore "Module not found"

```powershell
# Reinstalla le dipendenze
rm -rf node_modules
npm install
```

### Il sito non si aggiorna

- Vercel: Controlla i log nel dashboard
- GitHub Pages: Attendi 5-10 minuti per il deploy
- VPS: Riavvia il server (`pm2 restart` o `systemctl restart`)

---

## 📝 Note Importanti

1. **Variabili d'ambiente:** Se usi variabili d'ambiente, configurale nel dashboard del servizio di hosting
2. **Database:** Se aggiungi un database, usa servizi come Supabase, MongoDB Atlas, o PlanetScale
3. **File statici:** I file in `/public` sono serviti automaticamente
4. **SSL:** Vercel e Netlify forniscono SSL automatico

---

## 🆘 Supporto

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Netlify Docs: https://docs.netlify.com

