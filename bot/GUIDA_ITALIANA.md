# 🤖 Bot Telegram per TradingView - Guida Completa

## 📋 Panoramica

Questo bot legge automaticamente i messaggi Telegram che contengono segnali di trading, riconosce ordini LONG/SHORT e disegna automaticamente le linee di Entry, Take Profit e Stop Loss sul grafico TradingView.

## 🚀 Installazione Rapida

### 1. Installare le Dipendenze

```bash
npm install
```

### 2. Configurare le Credenziali Telegram

1. Vai su https://my.telegram.org/apps
2. Accedi con il tuo numero di telefono Telegram
3. Crea una nuova applicazione:
   - **App title**: Il nome che vuoi (es. "Trading Bot")
   - **Short name**: Un nome breve (es. "tradingbot")
   - **Platform**: Web
   - **Description**: Opzionale
4. Copia **API ID** e **API Hash**

### 3. Configurare il File .env

Crea un file `bot/.env` (copia da `bot/env.example`):

```env
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
TELEGRAM_STRING_SESSION=
TELEGRAM_CHANNELS=@trading_signals,altro_canale
TRADINGVIEW_HEADLESS=false
```

**Nota**: Lascia `TELEGRAM_STRING_SESSION` vuoto per il primo avvio.

### 4. Primo Avvio

```bash
npm run bot
```

Al primo avvio ti verrà chiesto:
1. 📱 **Numero di telefono**: Inserisci con prefisso internazionale (es. +39...)
2. ✉️ **Codice di verifica**: Inserisci il codice ricevuto su Telegram
3. 🔐 **Password 2FA** (se presente): Inserisci la password di autenticazione a due fattori

Dopo il primo avvio, verrà generata una **String Session** che verrà salvata automaticamente nel file `.env`.

## 📝 Come Funziona

### Riconoscimento Ordini

Il bot riconosce automaticamente ordini nei seguenti formati:

#### ✅ Formato 1: Standard
```
LONG EUR/USD
Entry: 1.0850
TP: 1.0900
SL: 1.0800
```

#### ✅ Formato 2: Con Emoji
```
📈 BUY BTCUSD
Entry @ 45000
Take Profit: 48000
Stop Loss: 42000
```

#### ✅ Formato 3: Con Link TradingView
```
SHORT EUR/USD
https://www.tradingview.com/chart/?symbol=EURUSD
Entry: 1.0850
TP: 1.0800
SL: 1.0900
```

#### ✅ Formato 4: Italiano
```
VENDI BTC/USD
Ingresso: 45000
Profitto: 48000
Fermata: 42000
```

### Parole Chiave Riconosciute

**LONG/BUY:**
- `long`, `buy`, `compra`, `acquista`, `entry long`, `go long`
- Emoji: 📈, ⬆️, 🔼, 🚀

**SHORT/SELL:**
- `short`, `sell`, `vendi`, `entry short`, `go short`
- Emoji: 📉, ⬇️, 🔽

**Entry:**
- `entry`, `ingresso`, `entrata`, `@`

**Take Profit:**
- `tp`, `take profit`, `profitto`, `target`, `obiettivo`

**Stop Loss:**
- `sl`, `stop loss`, `stop`, `fermata`

## 🎯 Configurazione Avanzata

### Monitorare Canali Specifici

Nel file `.env`:

```env
TELEGRAM_CHANNELS=@trading_signals,@forex_signals,altro_canale
```

Puoi usare:
- Username del canale (es. `@channelname`)
- ID numerico del canale
- Nome del canale

**Nota**: Lascia vuoto per monitorare TUTTI i messaggi ricevuti.

### Modalità Headless

Per eseguire il browser in background (utile per server):

```env
TRADINGVIEW_HEADLESS=true
```

### Monitoraggio di Tutti i Messaggi

Per monitorare tutti i messaggi (non solo canali specifici):

```env
TELEGRAM_CHANNELS=
```

## 🎨 Funzionalità TradingView

### Come Funziona il Disegno

1. Il bot legge il messaggio Telegram
2. Riconosce se c'è un link TradingView
3. Apre il link nel browser (automatizzato con Puppeteer)
4. Attende che il grafico sia caricato
5. Seleziona lo strumento "Linea orizzontale"
6. Disegna le linee per:
   - **Entry** (blu)
   - **Take Profit** (verde, sopra Entry per LONG, sotto per SHORT)
   - **Stop Loss** (rosso, sotto Entry per LONG, sopra per SHORT)

### Limitazioni

**⚠️ Importante**: TradingView non fornisce un'API pubblica ufficiale per disegnare programmaticamente. Il bot usa **browser automation** (Puppeteer) che:

- ✅ Funziona nella maggior parte dei casi
- ⚠️ Può essere fragile se TradingView cambia la sua interfaccia
- ⚠️ Richiede che il browser sia visibile (headless=false per ora)
- ⚠️ Potrebbe richiedere aggiornamenti se TradingView modifica il layout

**Alternativa**: Se il disegno automatico non funziona, il bot genera comunque uno **script Pine Script** che puoi copiare e incollare manualmente su TradingView.

## 🔧 Troubleshooting

### ❌ Errore: "TELEGRAM_API_ID non configurato"

**Soluzione**:
1. Verifica che il file `bot/.env` esista
2. Controlla che `TELEGRAM_API_ID` e `TELEGRAM_API_HASH` siano configurati correttamente
3. Assicurati che non ci siano spazi vuoti o virgolette nelle credenziali

### ❌ Errore durante l'accesso Telegram

**Problemi comuni**:
- Numero di telefono errato: Usa il formato internazionale (es. `+39...`)
- Codice di verifica scaduto: I codici scadono dopo 5 minuti
- Password 2FA errata: Verifica che sia corretta

**Soluzione**: Riavvia il bot e inserisci di nuovo le credenziali.

### ❌ Il bot non riconosce gli ordini

**Possibili cause**:
1. Il formato del messaggio non corrisponde ai pattern riconosciuti
2. Le parole chiave non sono in inglese o italiano

**Soluzione**:
- Usa i formati mostrati negli esempi sopra
- Verifica che il messaggio contenga almeno una parola chiave LONG/SHORT
- Controlla i log del bot per vedere cosa viene estratto

### ❌ Il disegno su TradingView non funziona

**Possibili cause**:
1. Il browser non è visibile (headless=true)
2. Il link TradingView non è valido
3. TradingView ha cambiato la sua interfaccia

**Soluzione**:
1. Imposta `TRADINGVIEW_HEADLESS=false` nel file `.env`
2. Verifica che il link TradingView sia valido
3. Controlla i log del bot per errori specifici
4. Se continua a non funzionare, usa lo script Pine Script generato manualmente

### ❌ Errore: "Cannot find module 'telegram'"

**Soluzione**:
```bash
npm install
```

### ❌ Il bot non legge i messaggi

**Possibili cause**:
1. La String Session è scaduta o invalida
2. Il canale non è nella lista dei monitorati
3. Il bot non ha accesso al canale

**Soluzione**:
1. Elimina `TELEGRAM_STRING_SESSION` dal file `.env` e riavvia
2. Verifica che `TELEGRAM_CHANNELS` sia configurato correttamente
3. Assicurati che il tuo account Telegram abbia accesso al canale

## 📊 Esempi di Messaggi

### Esempio 1: Ordine LONG Completo
```
LONG EUR/USD
https://www.tradingview.com/chart/?symbol=EURUSD
Entry: 1.0850
TP: 1.0900
SL: 1.0800
```

**Cosa fa il bot**:
- ✅ Riconosce ordine LONG
- ✅ Estrae simbolo: EUR/USD
- ✅ Estrae Entry: 1.0850
- ✅ Estrae TP: 1.0900
- ✅ Estrae SL: 1.0800
- ✅ Apre il link TradingView
- ✅ Disegna le linee sul grafico

### Esempio 2: Ordine SHORT Con Emoji
```
📉 SHORT BTC/USD
Entry @ 45000
Take Profit: 42000
Stop Loss: 48000
```

**Cosa fa il bot**:
- ✅ Riconosce ordine SHORT (da emoji 📉 e parola SHORT)
- ✅ Estrae simbolo: BTC/USD
- ✅ Estrae Entry: 45000
- ✅ Estrae TP: 42000
- ✅ Estrae SL: 48000
- ⚠️ Nessun link TradingView: non disegna (ma stampa le info)

### Esempio 3: Messaggio Informativo
```
Aggiornamento: Ordine EUR/USD chiuso in profitto
```

**Cosa fa il bot**:
- ℹ️ Riconosce messaggio informativo (aggiornamento/chiusura)
- 📝 Stampa le informazioni in console

## 🔐 Sicurezza

**⚠️ IMPORTANTE**: La **String Session** è sensibile e permette l'accesso al tuo account Telegram:

- ❌ **NON condividere** mai la String Session pubblicamente
- ❌ **NON committare** il file `.env` su Git
- ✅ Aggiungi `bot/.env` al file `.gitignore`
- ✅ Mantieni la String Session privata

## 📚 Script NPM Disponibili

```bash
# Avvia il bot in modalità normale
npm run bot

# Avvia il bot in modalità sviluppo (con auto-reload)
npm run bot:dev
```

## 🆘 Supporto

Per problemi o domande:
1. Controlla i log del bot per errori specifici
2. Verifica che tutte le configurazioni siano corrette
3. Consulta questa guida per soluzioni comuni

## 📝 Note Finali

- Il bot funziona 24/7 una volta avviato
- Premere `Ctrl+C` per fermare il bot
- I log mostrano tutte le operazioni in tempo reale
- Il bot è progettato per essere robusto e gestire errori gracefully

**Buon trading! 📈📉**

