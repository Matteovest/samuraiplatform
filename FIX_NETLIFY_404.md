# 🔧 Risoluzione: "Pagina non trovata" su Netlify

## Problema
Il sito è deployato ma mostra "404 - Page not found" o "Pagina non trovata".

## Soluzione

### Passo 1: Installa il plugin Next.js

Il plugin deve essere nelle dipendenze. Ho già aggiornato `package.json`, ora esegui:

```powershell
cd "C:\Users\Matteo\.cursor"
npm install
```

### Passo 2: Aggiorna il codice su GitHub

```powershell
git add .
git commit -m "Fix Netlify configuration"
git push
```

### Passo 3: Riavvia il deploy su Netlify

1. Vai sul dashboard Netlify
2. Seleziona il tuo sito
3. Vai su **"Deploys"**
4. Clicca sui **3 puntini** dell'ultimo deploy
5. Clicca **"Trigger deploy"** → **"Clear cache and deploy site"**

Oppure:

1. Vai su **"Site settings"** → **"Build & deploy"**
2. Clicca **"Trigger deploy"** → **"Clear cache and deploy site"**

### Passo 4: Verifica le impostazioni

Assicurati che su Netlify siano configurate:

- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Base directory:** (lascia vuoto)

## Alternativa: Usa Vercel (più semplice per Next.js)

Se continua a non funzionare, Vercel è ottimizzato meglio per Next.js:

1. Vai su: https://vercel.com
2. **Sign up** con GitHub
3. **Add New Project**
4. Seleziona il repository
5. Clicca **Deploy**

Vercel rileva automaticamente Next.js e configura tutto!

## Verifica

Dopo il nuovo deploy, il sito dovrebbe funzionare. Se ancora non funziona:

1. Controlla i **log di build** su Netlify
2. Verifica che non ci siano errori durante il build
3. Assicurati che il plugin sia installato correttamente

