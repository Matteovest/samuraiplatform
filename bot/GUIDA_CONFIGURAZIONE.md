# 🚀 Guida Configurazione Bot - Passo dopo Passo

## ✅ Passo 1: Ottieni Credenziali API Telegram

1. Vai su https://my.telegram.org/apps
2. Accedi con il tuo numero Telegram
3. Crea una nuova applicazione
4. **Copia API ID** (numero, es: `12345678`)
5. **Copia API Hash** (stringa, es: `abcdef1234567890abcdef1234567890`)

✅ **Fatto!** Ora hai le credenziali.

---

## ✅ Passo 2: Crea File `.env`

### Opzione A: Copia da esempio (RACCOMANDATO)

```bash
# Da PowerShell o CMD nella cartella bot/
copy env.example .env
```

### Opzione B: Crea manualmente

1. Crea un nuovo file chiamato `.env` nella cartella `bot/`
2. Copia il contenuto da `env.example`

---

## ✅ Passo 3: Configura Credenziali API

Apri il file `bot/.env` e modifica queste righe:

```env
# Sostituisci con le tue credenziali reali
TELEGRAM_API_ID=12345678          # Il tuo API ID (numero)
TELEGRAM_API_HASH=abcdef1234...   # Il tuo API Hash (stringa)
```

**⚠️ IMPORTANTE:**
- Non mettere spazi intorno al `=`
- Non mettere virgolette
- L'API ID è solo numeri
- L'API Hash è una stringa lunga

**Esempio corretto:**
```env
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
```

---

## ✅ Passo 4: Configura Canali da Monitorare

Nel file `.env`, modifica:

```env
# Sostituisci con i tuoi canali
TELEGRAM_CHANNELS=@trading_signals,@forex_signals
```

**Oppure** lascia vuoto per monitorare tutti i messaggi:
```env
TELEGRAM_CHANNELS=
```

**💡 Suggerimento:** Puoi trovare i canali disponibili eseguendo:
```bash
npm run bot:setup
```

---

## ✅ Passo 5: Configura TradingView (Opzionale)

Se vuoi che il bot disegni automaticamente su TradingView:

```env
TRADINGVIEW_HEADLESS=false  # true = browser nascosto, false = visibile
```

---

## ✅ Passo 6: Configura Broker (Opzionale)

Se vuoi esecuzione automatica ordini:

```env
# Broker (es: fpmarkets, oanda, icmarkets)
TRADINGVIEW_BROKER=fpmarkets
TRADINGVIEW_ACCOUNT_TYPE=demo  # demo o live

# Esecuzione automatica (true = apri ordini, false = solo analisi)
AUTO_EXECUTE_ORDERS=false  # Imposta true solo se sei sicuro!
```

⚠️ **ATTENZIONE:** Non abilitare `AUTO_EXECUTE_ORDERS=true` finché non hai testato tutto!

---

## ✅ Passo 7: Configura Risk Management

```env
# Balance iniziale (in USD)
ACCOUNT_BALANCE=10000

# Risk per operazione (0.4 = 0.4%)
RISK_PERCENT=0.4

# Pips per Break Even (per coprire spread)
BREAKEVEN_PIPS=2
```

---

## ✅ Passo 8: Installa Dipendenze

```bash
# Nella cartella principale del progetto
npm install
```

---

## ✅ Passo 9: Avvia il Bot

### Primo avvio (genera sessione):

```bash
npm run bot
```

Il bot ti chiederà:
1. 📱 **Numero di telefono**: Inserisci il tuo numero (es: +391234567890)
2. ✉️ **Codice Telegram**: Inserisci il codice ricevuto su Telegram
3. 🔐 **Password 2FA** (se presente): Inserisci la password se hai 2FA attivo

### Dopo il primo avvio:

Il bot genererà una `STRING SESSION`. **COPIA questa sessione** e aggiungila al file `.env`:

```env
TELEGRAM_STRING_SESSION=1BVtsOHwBu7Q-...  # La sessione generata
```

Dopo questo, il bot si avvierà automaticamente senza chiedere credenziali!

---

## ✅ Passo 10: Verifica Funzionamento

Il bot dovrebbe:
1. ✅ Connettersi a Telegram
2. ✅ Mostrare "Bot attivo e in ascolto!"
3. ✅ Monitorare i canali configurati
4. ✅ Processare i messaggi ricevuti

---

## 🐛 Troubleshooting

### ❌ Errore: "TELEGRAM_API_ID non configurato"

**Problema:** Il file `.env` non esiste o le credenziali non sono configurate.

**Soluzione:**
1. Verifica che il file `bot/.env` esista
2. Verifica che `TELEGRAM_API_ID` e `TELEGRAM_API_HASH` siano configurati
3. Verifica che non ci siano spazi intorno al `=`

---

### ❌ Errore: "Invalid API ID/Hash"

**Problema:** Credenziali errate.

**Soluzione:**
1. Verifica di aver copiato correttamente API ID e API Hash
2. Non mettere virgolette o spazi
3. Ricrea le credenziali su https://my.telegram.org/apps

---

### ❌ Errore: "Phone number invalid"

**Problema:** Formato numero errato.

**Soluzione:**
- Usa formato internazionale: `+391234567890` (con `+` e codice paese)
- NON usare spazi o trattini

---

### ❌ Errore: "Code invalid"

**Problema:** Codice scaduto o errato.

**Soluzione:**
1. Richiedi un nuovo codice
2. Inserisci il codice rapidamente (scade dopo pochi minuti)
3. Non mettere spazi nel codice

---

## 📝 File `.env` Completo di Esempio

```env
# Telegram API Credentials
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890

# Telegram String Session (generata al primo avvio)
TELEGRAM_STRING_SESSION=

# Canali da monitorare
TELEGRAM_CHANNELS=@trading_signals

# TradingView Settings
TRADINGVIEW_HEADLESS=false

# Broker Configuration
TRADINGVIEW_BROKER=fpmarkets
TRADINGVIEW_ACCOUNT_TYPE=demo
AUTO_EXECUTE_ORDERS=false
DEFAULT_VOLUME=0.01

# Risk Management
ACCOUNT_BALANCE=10000
RISK_PERCENT=0.4
BREAKEVEN_PIPS=2
MONITORING_INTERVAL=60000

# Notion (Opzionale)
NOTION_ENABLED=false
```

---

## ✅ Checklist Finale

Prima di avviare il bot, verifica:

- [ ] File `.env` creato in `bot/`
- [ ] `TELEGRAM_API_ID` configurato (numero)
- [ ] `TELEGRAM_API_HASH` configurato (stringa)
- [ ] `TELEGRAM_CHANNELS` configurato (o vuoto)
- [ ] Dipendenze installate (`npm install`)
- [ ] Pronto per il primo avvio!

---

## 🚀 Prossimi Passi

1. Avvia il bot: `npm run bot`
2. Completa il login Telegram (prima volta)
3. Salva la STRING SESSION nel `.env`
4. Riavvia il bot: dovrebbe funzionare automaticamente!
5. Monitora i log per verificare che funzioni tutto

**Buona fortuna! 🎉**

