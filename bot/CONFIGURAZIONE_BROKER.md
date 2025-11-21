# 🔗 Configurazione Broker TradingView

## 📋 Panoramica

Il bot può aprire automaticamente ordini (Buy Limit / Sell Limit) su TradingView broker collegati, come FP Markets, OANDA, IC Markets, ecc.

## ⚙️ Configurazione

### 1. Aggiungi Broker nel File .env

```env
# Broker da usare (es: fpmarkets, oanda, icmarkets, ecc.)
TRADINGVIEW_BROKER=fpmarkets

# Tipo account (demo o live)
TRADINGVIEW_ACCOUNT_TYPE=demo

# Esecuzione automatica ordini
AUTO_EXECUTE_ORDERS=false

# Volume di default (in lot)
DEFAULT_VOLUME=0.01

# Volume minimo/massimo (opzionale)
MIN_VOLUME=0.01
MAX_VOLUME=1.0

# Verifica spread (ignora per entry/exit ma monitora)
CHECK_SPREAD=false
```

### 2. Broker Supportati

Il bot supporta tutti i broker che si integrano con TradingView:

- ✅ **FP Markets** (demo/live)
- ✅ **OANDA** (demo/live)
- ✅ **IC Markets** (demo/live)
- ✅ **Trading 212** (demo/live)
- ✅ **Plus500** (demo/live)
- ✅ E altri broker TradingView compatibili

### 3. Prerequisiti

**Per usare la funzione broker:**

1. ✅ Devi essere **loggato su TradingView**
2. ✅ Devi avere un **account collegato al broker** specificato
3. ✅ Il broker deve supportare **TradingView broker integration**
4. ✅ Per account demo: crea un account demo sul broker e collegalo a TradingView
5. ✅ Per account live: collega il tuo account live a TradingView

## 🚀 Come Funziona

### Modalità Automatica

Quando `AUTO_EXECUTE_ORDERS=true`:

1. Il bot rileva un ordine dal messaggio Telegram
2. Valida l'ordine (Entry, TP, SL)
3. Crea un ordine pending (Buy Limit o Sell Limit)
4. Apre automaticamente l'ordine sul broker via TradingView
5. Monitora la posizione fino a chiusura (TP/SL)

### Tipo Ordini

- **LONG/BUY** → **Buy Limit** (entry sotto prezzo corrente)
- **SHORT/SELL** → **Sell Limit** (entry sopra prezzo corrente)

**Nota**: Gli ordini sono **pending**, quindi aspettano che il prezzo raggiunga il livello Entry prima di aprire la posizione.

## 📊 Gestione Spread

**⚠️ IMPORTANTE**: Come richiesto, lo **spread viene ignorato** per Entry e Exit.

- ✅ Entry e TP/SL sono impostati **esattamente** come specificato
- ✅ Lo spread è **molto basso** come indicato
- ✅ Non viene aggiunto/sottratto spread ai livelli

**Se `CHECK_SPREAD=true`**:
- Lo spread viene **monitorato** ma **non influisce** su entry/exit
- Utile per logging e statistiche

## 💰 Gestione Volume

**Volume di default**: `DEFAULT_VOLUME=0.01` (1 micro lot)

**Personalizzazione:**
```env
DEFAULT_VOLUME=0.1      # 1 mini lot
DEFAULT_VOLUME=1.0      # 1 lot standard
MIN_VOLUME=0.01         # Volume minimo
MAX_VOLUME=1.0          # Volume massimo
```

**Nota**: Il volume può essere specificato per ordine nel futuro, per ora usa il default.

## 🔒 Sicurezza

**Modalità Demo (Consigliato per Test):**
```env
TRADINGVIEW_ACCOUNT_TYPE=demo
AUTO_EXECUTE_ORDERS=true
```

**Modalità Live (Con Cautela):**
```env
TRADINGVIEW_ACCOUNT_TYPE=live
AUTO_EXECUTE_ORDERS=true  # Solo se sei sicuro!
```

**Modalità Solo Analisi (Più Sicuro):**
```env
AUTO_EXECUTE_ORDERS=false  # Solo analizza e genera Pine Script
```

## 📝 Esempio Configurazione Completa

```env
# Telegram
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef...
TELEGRAM_CHANNELS=@trading_signals

# TradingView Broker
TRADINGVIEW_BROKER=fpmarkets
TRADINGVIEW_ACCOUNT_TYPE=demo
AUTO_EXECUTE_ORDERS=true
DEFAULT_VOLUME=0.01
CHECK_SPREAD=false
```

## ⚠️ Limitazioni Attuali

1. **Autenticazione Broker**: Richiede che tu sia già loggato su TradingView e collegato al broker manualmente
2. **Browser Automation**: Usa Puppeteer per automatizzare il broker panel (può richiedere aggiornamenti se TradingView cambia UI)
3. **Monitoraggio Posizioni**: Il monitoraggio TP/SL è basico (può essere migliorato)

## 🔄 Prossimi Miglioramenti

- [ ] Autenticazione automatica broker
- [ ] Supporto ordini manuali (non pending)
- [ ] Monitoraggio avanzato posizioni
- [ ] Notifiche quando TP/SL raggiunti
- [ ] Statistiche performance ordini
- [ ] Gestione posizioni multiple

## 📚 Note Importanti

- ⚠️ **Testa sempre in DEMO prima di usare LIVE**
- ⚠️ **Verifica che gli ordini siano aperti correttamente**
- ⚠️ **Controlla manualmente le prime operazioni**
- ⚠️ **Lo spread è ignorato come richiesto**
- ⚠️ **Entry e Exit sono esattamente come specificati**

## 🆘 Troubleshooting

**Errore: "Broker non connesso"**
- Assicurati di essere loggato su TradingView
- Verifica che il broker sia collegato al tuo account TradingView
- Prova a ricaricare la pagina TradingView

**Errore: "Ordine non eseguito"**
- Verifica che `AUTO_EXECUTE_ORDERS=true`
- Controlla che il broker panel sia visibile
- Verifica i log per errori specifici

**Ordini non vengono aperti:**
- Verifica che il browser non sia in headless mode (potrebbe essere necessario vedere il browser)
- Controlla che il broker panel sia aperto su TradingView
- Verifica che i livelli Entry siano validi (non troppo lontani dal prezzo corrente per limit orders)

