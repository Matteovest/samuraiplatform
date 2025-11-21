# 🚀 Istruzioni Rapide - Bot Telegram TradingView

## ⚡ Setup in 3 Passaggi

### 1️⃣ Installa le Dipendenze
```bash
npm install
```

### 2️⃣ Configura le Credenziali

Crea `bot/.env`:
```env
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
```

**Come ottenerle (dal telefono):**
1. **Apri il browser del telefono** (Chrome, Safari, ecc.)
2. Vai su **https://my.telegram.org/apps**
3. **Accedi** con il tuo numero Telegram (riceverai un codice su Telegram)
4. **Crea una nuova applicazione**:
   - App title: `Trading Bot`
   - Short name: `tradingbot`
   - Platform: **Web**
5. **Copia API ID e API Hash** (salvali in una nota sul telefono)

**📱 Guida completa per telefono**: Vedi `bot/ISTRUZIONI_TELEFONO.md`

### 3️⃣ Collega il Bot al Tuo Account

```bash
npm run bot
```

**Al primo avvio inserisci:**
- Numero di telefono Telegram (+39...)
- Codice di verifica (ricevuto su Telegram)
- Password 2FA (se presente)

**Copia la String Session** che viene mostrata e aggiungila a `bot/.env`:
```env
TELEGRAM_STRING_SESSION=1BVtsOHwBu7Q-...
```

## 📡 Configurare i Canali da Monitorare

### Opzione A: Script Interattivo (Consigliato)
```bash
npm run bot:setup
```

Questo script ti mostrerà tutti i canali disponibili e ti permetterà di selezionarli.

### Opzione B: Manuale

Apri `bot/.env` e aggiungi:
```env
TELEGRAM_CHANNELS=@channel1,@channel2,nome_canale
```

**Esempi:**
```env
# Monitora un canale
TELEGRAM_CHANNELS=@trading_signals

# Monitora più canali
TELEGRAM_CHANNELS=@trading_signals,@forex_signals

# Monitora tutti i messaggi (lascia vuoto)
TELEGRAM_CHANNELS=
```

## ✅ Avviare il Bot

```bash
npm run bot
```

Il bot ora:
- ✅ È connesso al tuo account Telegram
- ✅ Monitora i canali configurati
- ✅ Analizza le immagini allegate ai messaggi
- ✅ Estrae Entry, TP, SL dalla barra prezzi laterale
- ✅ Disegna sul grafico TradingView se c'è un link

## 📊 Come Funziona

**Messaggio Telegram ricevuto:**
```
LONG EUR/USD
https://www.tradingview.com/chart/?symbol=EURUSD
[Immagine screenshot TradingView]
```

**Cosa fa il bot:**
1. ✅ Rileva l'immagine allegata
2. ✅ Scarica l'immagine dal messaggio
3. ✅ Analizza l'immagine con OCR
4. ✅ Estrae i prezzi dalla barra laterale (Entry, TP, SL)
5. ✅ Riconosce LONG/SHORT dal testo o dall'immagine
6. ✅ Apre il link TradingView
7. ✅ Disegna le linee sul grafico

## 🆘 Problemi Comuni

**Errore: "TELEGRAM_API_ID non configurato"**
→ Controlla che `bot/.env` esista e contenga le credenziali

**Errore durante l'accesso**
→ Verifica che il numero di telefono sia nel formato internazionale (+39...)

**Il bot non legge i messaggi**
→ Usa `npm run bot:setup` per vedere i canali disponibili e configurarli

**Nessun dato estratto dall'immagine**
→ Assicurati che l'immagine mostri chiaramente la barra dei prezzi laterale

## 📚 Documentazione Completa

- `bot/CONFIGURAZIONE_ACCOUNT.md` - Guida completa configurazione account
- `bot/GUIDA_ITALIANA.md` - Guida completa in italiano
- `bot/README.md` - Documentazione in inglese

## 🔐 Sicurezza

⚠️ **IMPORTANTE**: Non condividere mai il file `.env` o la String Session pubblicamente!

