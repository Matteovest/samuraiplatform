# 🔍 Debug: Pagine Backtest e Journal Non Funzionano

## Cosa Verificare

### 1. Cosa succede quando clicchi sui link?

- **Opzione A:** La pagina si carica ma è vuota/bianca
- **Opzione B:** Vedi un errore 404 (pagina non trovata)
- **Opzione C:** La pagina si carica ma non è interattiva
- **Opzione D:** Il link non fa nulla

### 2. Controlla la Console del Browser

1. Apri il sito su Vercel
2. Premi **F12** (o tasto destro → "Ispeziona")
3. Vai su **Console**
4. Clicca su "Backtest" o "Journal" nella navbar
5. **Cosa vedi?**
   - Errori in rosso?
   - Messaggi di warning?
   - Niente?

### 3. Controlla la Network Tab

1. Apri **F12** → **Network**
2. Clicca su "Backtest" o "Journal"
3. Cerca richieste a `/backtest` o `/journal`
4. **Cosa vedi?**
   - Status 200 (OK)?
   - Status 404 (Not Found)?
   - Status 500 (Error)?

### 4. Verifica l'URL

Quando clicchi su "Backtest", l'URL dovrebbe cambiare in:
- `https://tuo-sito.vercel.app/backtest`

Se l'URL non cambia, il problema è nei link della navbar.

## Possibili Problemi e Soluzioni

### Problema 1: Pagina 404

**Sintomo:** Vedi "404 - Page Not Found"

**Soluzione:**
- Le pagine potrebbero non essere state buildate correttamente
- Verifica i log di build su Vercel
- Riavvia il deploy

### Problema 2: Pagina Bianca/Vuota

**Sintomo:** La pagina si carica ma è completamente bianca

**Soluzione:**
- Controlla errori JavaScript nella console
- Potrebbe essere un problema con React hydration
- Verifica che tutti i componenti abbiano 'use client'

### Problema 3: Link Non Funzionano

**Sintomo:** Clicchi ma non succede nulla

**Soluzione:**
- Verifica che i link nella Navbar siano corretti
- Controlla che Next.js Link funzioni correttamente

### Problema 4: JavaScript Non Si Carica

**Sintomo:** La pagina si vede ma non è interattiva

**Soluzione:**
- Controlla Network tab per vedere se i file `.js` si caricano
- Verifica che non ci siano errori CORS
- Controlla che Vercel stia servendo correttamente i file statici

## Test Rapido

Apri direttamente questi URL nel browser:

1. `https://tuo-sito.vercel.app/backtest`
2. `https://tuo-sito.vercel.app/journal`

Se funzionano direttamente ma non dai link, il problema è nella Navbar.

## Informazioni da Fornire

Per aiutarti meglio, dimmi:

1. **Cosa vedi** quando clicchi su Backtest/Journal?
2. **Cosa dice la Console** (F12 → Console)?
3. **Cosa dice Network** (F12 → Network)?
4. **L'URL cambia** quando clicchi?

Con queste informazioni posso risolvere il problema!

