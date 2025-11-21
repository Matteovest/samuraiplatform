# 🔧 Configurazione Account Telegram

## ⚠️ IMPORTANTE: Userbot, Non Bot BotFather!

Questo è un **Userbot** che si collega al tuo account Telegram personale, NON un bot creato con BotFather.

**Differenza:**
- ❌ **Bot BotFather**: Account separato, NON può leggere i tuoi messaggi privati
- ✅ **Userbot**: Si collega al tuo account, vede quello che vedi tu

**Perché Userbot?**
- ✅ Legge messaggi da canali privati ai quali sei iscritto
- ✅ Vede le immagini che ricevi
- ✅ Funziona senza permessi speciali
- ✅ Perfetto per il tuo caso d'uso!

**📚 Vedi `bot/BOT_VS_USERBOT.md` per dettagli completi**

---

## 📋 Guida Rapida - Collegare il Bot al Tuo Account

### 1️⃣ Installare le Dipendenze

Prima di tutto, installa tutte le dipendenze necessarie:

```bash
npm install
```

### 2️⃣ Ottenere le Credenziali Telegram API

#### ⚠️ Se Vedi "Troppi Tentativi"

**Se ricevi l'errore "Too many attempts":**
- ⏰ **Aspetta 24 ore** - Il blocco è temporaneo
- 🔄 **Prova dispositivo/rete diversa** - A volte il blocco è per IP
- 📱 **Vedi `bot/FIX_TROPPI_TENTATIVI.md`** per soluzioni dettagliate

#### Opzione A: Dal Browser del Telefono (Consigliato)

1. **Apri il browser del tuo telefono** (Chrome, Safari, Firefox, ecc.)
2. Vai su **https://my.telegram.org/apps**
3. **Accedi con il tuo numero di telefono Telegram**:
   - Inserisci il numero con prefisso internazionale (es. `+39...` per l'Italia)
   - ⚠️ **Inserisci il numero corretto al primo tentativo** per evitare blocchi
   - Riceverai un codice su Telegram, inseriscilo nel browser (scade dopo 5 minuti)
   - Se hai 2FA attiva, inserisci anche la password
4. **Crea una nuova applicazione**:
   - **App title**: Nome a scelta (es. "Trading Bot")
   - **Short name**: Nome breve (es. "tradingbot")
   - **Platform**: Web
   - **Description**: Opzionale (puoi lasciarla vuota)
5. **Copia API ID e API Hash**:
   - Dovresti vedere due campi: "api_id" e "api_hash"
   - Copia entrambi (sono numeri/codici lunghi)
   - ⚠️ **Salvali subito** - Non li vedrai più dopo!

#### Opzione B: Usa l'App Telegram Desktop

1. Apri **Telegram Desktop** (se installato)
2. Vai su **Impostazioni** → **Telegram API**
3. Verrà aperto il browser con la pagina delle API
4. Segui i passaggi sopra

#### ⚠️ Problemi ad Accedere?

- **"Too many attempts"**: Aspetta qualche minuto e riprova
- **Codice non arriva**: Controlla che il numero sia corretto
- **Non riesco ad accedere**: Prova da un altro browser o dispositivo

### 3️⃣ Configurare il File .env

Crea un file `bot/.env` (copia da `bot/env.example`):

```env
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
TELEGRAM_STRING_SESSION=
TELEGRAM_CHANNELS=
TRADINGVIEW_HEADLESS=false
```

Sostituisci `12345678` e `abcdef...` con i tuoi valori reali.

### 4️⃣ Primo Avvio - Connessione al Tuo Account

**Nota**: Questo passaggio si fa dal computer dove hai il bot, ma userai il telefono per ricevere i codici.

Avvia il bot per la prima volta:

```bash
npm run bot
```

Al primo avvio ti verrà chiesto:
1. 📱 **Numero di telefono**: 
   - Inserisci il numero con prefisso internazionale (es. `+39...` per l'Italia)
   - ⚠️ Usa lo stesso numero dell'account Telegram che vuoi collegare

2. ✉️ **Codice di verifica**: 
   - Controlla l'app Telegram sul tuo telefono
   - Riceverai un messaggio con il codice di verifica
   - Inserisci il codice nel terminale del computer

3. 🔐 **Password 2FA** (se presente): 
   - Se hai l'autenticazione a due fattori attiva, inserisci la password
   - Questa è la password che hai impostato nelle impostazioni di Telegram

**Dopo il primo avvio:**
- Verrà generata una **String Session** (un codice lungo)
- ⚠️ **IMPORTANTE**: Copia questa String Session che viene mostrata nel terminale
- Aggiungila al file `bot/.env`:

```env
TELEGRAM_STRING_SESSION=1BVtsOHwBu7Q-...
```

**💡 Suggerimento**: Dopo il primo avvio, non dovrai più inserire numero e codice - il bot userà la String Session salvata.

### 5️⃣ Configurare i Canali da Monitorare

Ci sono **due modi** per configurare i canali:

#### Metodo 1: Script Interattivo (Consigliato)

Usa lo script di setup:

```bash
npm run bot:setup
```

Questo script ti mostrerà:
- 📂 Lista di tutte le chat e canali disponibili
- 🔧 Opzione per configurare i canali da monitorare
- ✅ Salvataggio automatico nel file `.env`

#### Metodo 2: Manuale

Apri `bot/.env` e aggiungi i canali da monitorare:

```env
TELEGRAM_CHANNELS=@channel1,@channel2,nome_canale
```

Puoi usare:
- **Username del canale**: `@channelname`
- **ID numerico**: `1234567890`
- **Nome del canale**: `nome_canale`

**Esempi:**
```env
# Monitora un singolo canale
TELEGRAM_CHANNELS=@trading_signals

# Monitora più canali
TELEGRAM_CHANNELS=@trading_signals,@forex_signals,altro_canale

# Monitora tutti i messaggi (lascia vuoto)
TELEGRAM_CHANNELS=
```

### 6️⃣ Avviare il Bot

Una volta configurato tutto:

```bash
npm run bot
```

Il bot:
- ✅ Si connetterà al tuo account Telegram
- ✅ Mostrerà quali canali sta monitorando
- ✅ Inizierà ad ascoltare i messaggi
- ✅ Analizzerà le immagini allegate
- ✅ Estrarrà i livelli di prezzo dalle immagini TradingView

## 📊 Cosa Fa il Bot

Quando riceve un messaggio:

1. **Controlla se c'è un'immagine allegata** (screenshot TradingView)
2. **Scarica l'immagine** dal messaggio Telegram
3. **Analizza l'immagine** con OCR per estrarre:
   - Prezzi dalla barra laterale
   - Simbolo di trading
   - Tipo di ordine (LONG/SHORT)
4. **Estrae Entry, Take Profit, Stop Loss** dai prezzi
5. **Se c'è un link TradingView**, disegna sul grafico

## 🎯 Esempio di Messaggio

Il bot funziona con messaggi come questo:

**Messaggio Telegram:**
```
📈 LONG EUR/USD
https://www.tradingview.com/chart/?symbol=EURUSD
[Immagine allegata con screenshot TradingView]
```

**Cosa fa il bot:**
1. ✅ Riconosce LONG dal testo
2. ✅ Scarica l'immagine allegata
3. ✅ Analizza l'immagine e estrae Entry, TP, SL dalla barra laterale
4. ✅ Apre il link TradingView
5. ✅ Disegna le linee sul grafico

## ⚠️ Troubleshooting

### Errore: "TELEGRAM_API_ID non configurato"
- Verifica che il file `bot/.env` esista
- Controlla che le credenziali siano corrette
- Assicurati che non ci siano spazi vuoti o virgolette

### Errore durante l'accesso Telegram
- **Numero errato**: Usa il formato internazionale (es. `+39...`)
- **Codice scaduto**: I codici scadono dopo 5 minuti, riprova
- **Password 2FA errata**: Verifica che sia corretta

### Il bot non legge i messaggi
- **Canale non nella lista**: Usa `npm run bot:setup` per vedere i canali disponibili
- **String Session scaduta**: Elimina `TELEGRAM_STRING_SESSION` dal `.env` e riavvia
- **Canale privato**: Assicurati di essere membro del canale

### Nessun dato estratto dall'immagine
- **OCR non funziona**: Verifica che l'immagine sia chiara
- **Barra prezzi non visibile**: L'immagine deve mostrare la barra laterale dei prezzi
- **Prezzi non leggibili**: Assicurati che i prezzi siano visibili nell'immagine

## 📚 Comandi Disponibili

```bash
# Avvia il bot
npm run bot

# Avvia in modalità sviluppo (auto-reload)
npm run bot:dev

# Configura i canali da monitorare
npm run bot:setup
```

## 🔐 Sicurezza

**⚠️ IMPORTANTE**:
- ❌ **NON condividere** mai la String Session pubblicamente
- ❌ **NON committare** il file `.env` su Git
- ✅ Il file `.env` è già nel `.gitignore`
- ✅ Mantieni la String Session privata

## 🆘 Supporto

Per problemi:
1. Controlla i log del bot per errori specifici
2. Verifica che tutte le configurazioni siano corrette
3. Consulta `bot/GUIDA_ITALIANA.md` per dettagli completi

