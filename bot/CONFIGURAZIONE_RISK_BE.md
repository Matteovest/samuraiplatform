# 📊 Configurazione Risk Management e Break Even

## 💰 Risk Management - 0.4% per Operazione

### Configurazione

**File `.env`:**
```env
# Balance account (in valuta base, es. USD)
ACCOUNT_BALANCE=10000

# Risk per operazione (in percentuale)
RISK_PERCENT=0.4

# Pips sopra entry per Break Even (per coprire spread)
BREAKEVEN_PIPS=2

# Intervallo monitoraggio posizioni (in millisecondi)
MONITORING_INTERVAL=60000  # 1 minuto
```

### Come Funziona

**Calcolo Automatico Volume:**
1. Il bot calcola la distanza tra Entry e Stop Loss (in pips)
2. Calcola l'importo da rischiare (0.4% del balance account)
3. Calcola il valore di un pip per il simbolo
4. Determina il lot size necessario per rischiare esattamente 0.4%

**Esempio:**
- Balance: $10,000
- Risk: 0.4% = $40
- Entry: 1.0850
- SL: 1.0800
- Distanza: 50 pips
- Pip Value: $10 per lot (EUR/USD)
- Volume: $40 / (50 pips × $10) = 0.08 lot

**Validazione Rischio:**
- ✅ Il bot valida che il rischio sia accettabile (max 1%)
- ⚠️ Avvisa se il rischio è troppo alto
- ❌ Blocca ordini con rischio > 1%

## 🔧 Gestione Break Even

### Riconoscimento Messaggi BE

**Pattern riconosciuti:**
- "Operazione spostata a BE"
- "Trade spostato a Break Even"
- "Sposta stop a BE"
- "BE attivo"
- Ecc.

### Funzionamento

**Quando riceve messaggio BE:**
1. ✅ Riconosce il messaggio come richiesta BE
2. ✅ Trova l'ordine di riferimento (per ID o simbolo/tipo)
3. ✅ Calcola prezzo Break Even: **Entry + spread** (per LONG) o **Entry - spread** (per SHORT)
4. ✅ Sposta automaticamente lo Stop Loss al prezzo BE
5. ✅ Aggiorna l'ordine nello storage

**Calcolo BE:**
- **LONG**: BE = Entry + spread (es. Entry + 2 pip per coprire spread)
- **SHORT**: BE = Entry - spread (es. Entry - 2 pip per coprire spread)

**Esempio:**
- Entry: 1.0850
- Spread: 2 pip (0.0002)
- BE per LONG: 1.0852 (Entry + 2 pip)
- BE per SHORT: 1.0848 (Entry - 2 pip)

### Configurazione Spread BE

```env
# Pips sopra/sotto entry per Break Even
BREAKEVEN_PIPS=2  # Default: 2 pip
```

**Nota**: Questo copre lo spread e garantisce che la posizione sia almeno in Break Even dopo i costi.

## 📊 Monitoraggio Automatico Posizioni

### Funzionamento

**Monitoraggio Continuo:**
- ✅ Controlla tutte le posizioni aperte ogni minuto (configurabile)
- ✅ Verifica se il prezzo ha raggiunto Entry (per spostare a BE)
- ✅ Sposta automaticamente a BE quando raggiunge Entry
- ✅ Monitora TP/SL raggiunti

**Avvio Automatico:**
- Si avvia automaticamente se `AUTO_EXECUTE_ORDERS=true`
- Controlla posizioni ogni `MONITORING_INTERVAL` ms

### Configurazione

```env
# Intervallo monitoraggio (in millisecondi)
MONITORING_INTERVAL=60000  # 1 minuto (default)
MONITORING_INTERVAL=30000  # 30 secondi (più frequente)
MONITORING_INTERVAL=120000 # 2 minuti (meno frequente)
```

## 📈 Sistema Statistiche e Monitoraggio

### Storage Locale

**Salvataggio Automatico:**
- ✅ Tutti i trade vengono salvati in `temp/orders/orders.json`
- ✅ Statistiche calcolate automaticamente
- ✅ Report statistiche in `temp/stats/statistics.json`

**Statistiche Tracciate:**
- Totale trade
- Win rate
- Profit/Loss totale
- Profit Factor
- Max Drawdown
- Average Risk/Reward
- Trade per simbolo/tipo/timeframe

### Integrazione Notion (Opzionale)

**Configurazione:**
```env
# Notion API Key
NOTION_API_KEY=secret_xxxxxxxxxxxxx

# Notion Database ID
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Abilita Notion
NOTION_ENABLED=true
```

**Come Ottenere Notion Credentials:**

1. **Crea Integrazione Notion:**
   - Vai su https://www.notion.so/my-integrations
   - Clicca "New integration"
   - Dai un nome (es. "Trading Bot")
   - Copia **Internal Integration Token** (API Key)

2. **Crea Database Notion:**
   - Crea un nuovo database in Notion
   - Aggiungi queste proprietà:
     - **Date** (title)
     - **Total Trades** (number)
     - **Win Rate** (number, %)
     - **Net Profit** (number, $)
     - **Profit Factor** (number)
     - **Max Drawdown** (number, %)
     - **Best Trade** (number, $)
     - **Worst Trade** (number, $)
     - **Average R/R** (number)

3. **Condividi Database:**
   - Apri il database
   - Clicca "..." → "Connections" → "Add connections"
   - Seleziona la tua integrazione

4. **Ottieni Database ID:**
   - Apri il database nel browser
   - L'URL è: `https://www.notion.so/workspace/DATABASE_ID?v=...`
   - Copia il `DATABASE_ID` (prima del `?`)

**Esempio URL:**
```
https://www.notion.so/mynotion/DATABASE_ID1234567890abcdef?v=...
```
Database ID: `DATABASE_ID1234567890abcdef`

## 📊 Report Statistiche

### Generazione Report

Il bot genera automaticamente statistiche che includono:

**Performance Generale:**
- Totale trade
- Trade vincenti/perdenti
- Win Rate %
- Profit Factor

**Profit/Loss:**
- Profitto totale
- Perdita totale
- Net Profit
- Media Win/Loss

**Risk Metrics:**
- Max Drawdown
- Best/Worst Trade
- Average Risk/Reward

**Distribuzione:**
- Trade per simbolo
- Trade per tipo (LONG/SHORT)
- Trade per timeframe

### Visualizzazione

**File Locali:**
- `temp/stats/statistics.json` - Statistiche complete
- `temp/orders/orders.json` - Storico ordini

**Notion (se configurato):**
- Database Notion con tutte le statistiche
- Aggiornamento automatico ogni trade
- Report giornaliero automatico

## 🔍 Monitoraggio Automatico Trade

### Cosa Monitora

**Posizioni Aperte:**
- Prezzo corrente
- Profit/Loss in tempo reale
- Distanza da Entry (per spostare a BE)
- Distanza da TP/SL

**Break Even:**
- Rileva quando prezzo raggiunge Entry
- Sposta automaticamente SL a BE
- Notifica quando BE è attivo

**TP/SL:**
- Monitora quando TP/SL vengono raggiunti
- Log quando posizioni vengono chiuse
- Aggiorna statistiche automaticamente

### Intervallo Monitoraggio

**Default:** 60 secondi (1 minuto)

**Personalizzazione:**
```env
MONITORING_INTERVAL=30000  # 30 secondi (più frequente)
MONITORING_INTERVAL=60000  # 1 minuto (default)
MONITORING_INTERVAL=120000 # 2 minuti (meno frequente)
```

**Note:**
- Più frequente = più accurato ma più risorse
- Meno frequente = meno risorse ma possibili ritardi

## ✅ Esempio Configurazione Completa

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

# Risk Management
ACCOUNT_BALANCE=10000
RISK_PERCENT=0.4
BREAKEVEN_PIPS=2

# Monitoraggio
MONITORING_INTERVAL=60000

# Notion (Opzionale)
NOTION_API_KEY=secret_xxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxx
NOTION_ENABLED=true
```

## 🎯 Workflow Completo

1. **Riceve messaggio Telegram** con ordine
2. **Rileva Entry, TP, SL** (da immagine o testo)
3. **Calcola volume** basato su 0.4% risk
4. **Valida ordine** (Entry, TP, SL coerenti)
5. **Apre ordine** sul broker (se `AUTO_EXECUTE_ORDERS=true`)
6. **Monitora posizione** automaticamente
7. **Sposta a BE** quando prezzo raggiunge Entry
8. **Traccia statistiche** (locale + Notion se configurato)
9. **Aggiorna statistiche** quando posizione si chiude

## 📝 Note Importanti

- ⚠️ **Balance Account**: Aggiorna regolarmente se cambi balance
- ⚠️ **Spread BE**: Aggiusta `BREAKEVEN_PIPS` in base allo spread del broker
- ⚠️ **Notion**: Opzionale ma consigliato per monitoraggio completo
- ⚠️ **Monitoraggio**: Più frequente = più preciso ma più risorse

## 🆘 Troubleshooting

**Volume troppo alto/basso:**
- Verifica `ACCOUNT_BALANCE` nel `.env`
- Controlla `RISK_PERCENT` (0.4% è molto conservativo)
- Verifica distanza Entry-SL (più grande = volume più basso)

**BE non si attiva:**
- Verifica che `MONITORING_INTERVAL` non sia troppo lungo
- Controlla che il broker sia connesso
- Verifica che la posizione sia ancora aperta

**Statistiche non aggiornate:**
- Controlla che gli ordini vengano salvati nello storage
- Verifica permessi di scrittura su `temp/stats/`
- Se Notion: verifica API Key e Database ID

