# 🚀 Guida Rapida - Avvia Samurai Platform

## ⚠️ IMPORTANTE: Riavvia il Terminale

Dopo aver installato Node.js, **DEVI RIAVVIARE** il terminale/PowerShell per aggiornare il PATH.

### Passo 1: Riavvia PowerShell/Terminale
1. **Chiudi completamente** la finestra PowerShell/Terminale corrente
2. **Apri una nuova finestra** PowerShell/Terminale
3. Vai nella cartella del progetto:
   ```powershell
   cd "C:\Users\Matteo\.cursor"
   ```

### Passo 2: Verifica Installazione
```powershell
node --version
npm --version
```

Dovresti vedere qualcosa come:
```
v20.11.0
10.2.4
```

### Passo 3: Installa Dipendenze (solo la prima volta)
```powershell
npm install
```

Questo installerà tutte le dipendenze necessarie. Potrebbe richiedere 2-5 minuti.

### Passo 4: Avvia il Server
```powershell
npm run dev
```

Dovresti vedere:
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
- Ready in 2.3s
```

### Passo 5: Apri nel Browser
Apri il browser e vai su:
**http://localhost:3000**

## 🎯 Metodo Alternativo: Script Automatico

Dopo aver riavviato il terminale, puoi anche usare:

**Windows:**
- Doppio click su `avvia-totaltrade.bat`

**PowerShell:**
```powershell
.\avvia-totaltrade.ps1
```

## ❌ Se ancora non funziona

1. **Verifica che Node.js sia installato:**
   - Apri "Pannello di controllo" → "Programmi"
   - Cerca "Node.js" nella lista

2. **Riavvia il computer** (a volte necessario per aggiornare il PATH)

3. **Verifica il PATH manualmente:**
   - Premi `Win + R`
   - Digita: `sysdm.cpl`
   - Vai su "Avanzate" → "Variabili d'ambiente"
   - Controlla che nella variabile "Path" ci sia: `C:\Program Files\nodejs\`

4. **Reinstalla Node.js** se necessario:
   - Scarica da: https://nodejs.org/
   - Durante l'installazione, assicurati di selezionare "Add to PATH"

## ✅ Quando funziona

Quando vedi il messaggio "Ready" nel terminale, la piattaforma è attiva e puoi accedere a:
- **Homepage**: http://localhost:3000
- **Backtest**: http://localhost:3000/backtest
- **Journal**: http://localhost:3000/journal
- **DeepView**: http://localhost:3000/deepview
- **Pricing**: http://localhost:3000/pricing

