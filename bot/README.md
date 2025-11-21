# Bot Telegram per TradingView

Bot Telegram che legge i messaggi dal tuo account e disegna automaticamente ordini di trading su TradingView.

## 🚀 Funzionalità

- ✅ Legge messaggi in tempo reale dal tuo account Telegram
- ✅ Riconosce automaticamente ordini LONG/SHORT nei messaggi
- ✅ Estrae Entry, Take Profit e Stop Loss
- ✅ Disegna automaticamente sul grafico TradingView quando trova link
- ✅ Supporta monitoraggio di canali specifici o tutti i messaggi

## 📋 Prerequisiti

1. **Node.js** (versione 18 o superiore)
2. **Credenziali Telegram API**:
   - Vai su https://my.telegram.org/apps
   - Crea una nuova applicazione
   - Copia `API ID` e `API Hash`

## 🔧 Installazione

1. **Installa le dipendenze:**
   ```bash
   npm install
   ```

2. **Configura le variabili d'ambiente:**
   ```bash
   cp bot/.env.example bot/.env
   ```
   
   Modifica `bot/.env` e inserisci le tue credenziali Telegram.

## 🎯 Utilizzo

### Primo avvio

Al primo avvio, il bot ti chiederà:
1. Il tuo numero di telefono Telegram
2. Il codice di verifica ricevuto
3. La password 2FA (se presente)

Dopo il primo avvio, verrà generata una **String Session** che verrà salvata nel file `.env`.

### Avviare il bot

```bash
# Modalità normale
npm run bot

# Modalità sviluppo (con auto-reload)
npm run bot:dev
```

## 📝 Formato Messaggi Riconosciuti

Il bot riconosce automaticamente ordini nei seguenti formati:

### Ordine LONG
```
LONG EUR/USD
Entry: 1.0850
TP: 1.0900
SL: 1.0800
```

### Ordine SHORT
```
SHORT BTC/USD
Entry @ 45000
Take Profit: 44000
Stop Loss: 46000
```

### Con emoji
```
📈 BUY EURUSD
Entry: 1.0850
TP: 1.0900
SL: 1.0800
```

### Con link TradingView
```
LONG EUR/USD
https://www.tradingview.com/chart/?symbol=EURUSD
Entry: 1.0850
TP: 1.0900
SL: 1.0800
```

## ⚙️ Configurazione Avanzata

### Monitorare canali specifici

Nel file `.env`, aggiungi:
```env
TELEGRAM_CHANNELS=@channel1,@channel2,channel_name
```

### Modalità headless

Per eseguire il browser in background:
```env
TRADINGVIEW_HEADLESS=true
```

## 🎨 Come Funziona il Disegno su TradingView

Il bot usa **Puppeteer** per automatizzare il browser e:
1. Apre il link TradingView dal messaggio
2. Attende che il grafico sia caricato
3. Seleziona gli strumenti di disegno appropriati
4. Disegna le linee per Entry, Take Profit e Stop Loss

**Nota:** Il disegno automatico richiede che il browser sia visibile. Se hai problemi, il bot stamperà comunque tutte le informazioni estratte.

## 🔍 Debugging

Il bot stampa informazioni dettagliate in console:
- 📨 Ogni nuovo messaggio ricevuto
- ✅ Ordini riconosciuti
- 🔗 Link TradingView trovati
- 🎨 Operazioni di disegno

## ⚠️ Limitazioni

1. **TradingView API**: TradingView non fornisce un'API pubblica ufficiale per disegnare programmaticamente. Il bot usa automation browser che può essere fragile se TradingView cambia la sua interfaccia.

2. **Rate Limiting**: Telegram ha limiti sul numero di richieste. Il bot è progettato per rispettare questi limiti.

3. **Sicurezza**: La String Session è sensibile. Non condividerla mai pubblicamente.

## 📚 Struttura del Progetto

```
bot/
├── index.ts              # File principale del bot
├── parser.ts             # Parser per riconoscere ordini nei messaggi
├── tradingview-extractor.ts  # Estrae info dai link TradingView
├── tradingview-drawer.ts # Disegna ordini su TradingView
├── .env.example          # Template configurazione
└── README.md             # Questa guida
```

## 🐛 Troubleshooting

### Errore: "TELEGRAM_API_ID non configurato"
- Verifica che il file `.env` esista nella cartella `bot/`
- Assicurati che le credenziali siano corrette

### Errore durante l'accesso Telegram
- Verifica che il numero di telefono sia corretto (con prefisso internazionale)
- Controlla che il codice di verifica non sia scaduto

### Il bot non riconosce gli ordini
- Verifica che il formato del messaggio corrisponda agli esempi
- Controlla i log per vedere cosa viene estratto dal messaggio

### Il disegno su TradingView non funziona
- Assicurati che il browser sia visibile (headless=false)
- Verifica che il link TradingView sia valido
- Controlla i log per errori specifici

## 📞 Supporto

Per problemi o domande, consulta i log del bot o apri un issue.

## ⚖️ Licenza

Questo progetto è fornito "così com'è" per uso personale.

