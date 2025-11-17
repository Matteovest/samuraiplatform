# ⚡ Pubblicazione Rapida - 5 Minuti

## Metodo più veloce: Vercel CLI

### 1. Installa Vercel CLI
```powershell
npm install -g vercel
```

### 2. Vai nella cartella del progetto
```powershell
cd "C:\Users\Matteo\.cursor"
```

### 3. Pubblica
```powershell
vercel
```

### 4. Segui le istruzioni
- Premi INVIO per login
- Apri il browser per autenticarti
- Premi INVIO per confermare le impostazioni
- Attendi il deploy (2-3 minuti)

### 5. Ottieni il link
Vercel ti darà un URL tipo:
- `https://samurai-platform-xxxxx.vercel.app`

**Fatto! Il tuo sito è online! 🎉**

---

## Prossimi passi (opzionali)

### Dominio personalizzato
1. Vai su: https://vercel.com/dashboard
2. Seleziona il progetto
3. Settings → Domains
4. Aggiungi il tuo dominio

### Deploy automatico con GitHub
1. Crea repository su GitHub
2. Collega a Vercel
3. Ogni push = deploy automatico!

---

## Problemi?

**Errore "vercel not found":**
- Riavvia il terminale dopo `npm install -g vercel`

**Errore durante il build:**
- Esegui prima: `npm run build` per verificare errori

**Vuoi aggiornare il sito:**
- Esegui di nuovo: `vercel`

