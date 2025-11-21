# 🚀 Quick Start - Bot Telegram TradingView

## Installazione in 3 Passaggi

### 1️⃣ Installa le dipendenze
```bash
npm install
```

### 2️⃣ Configura le credenziali
Crea `bot/.env` con:
```env
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
```

**Come ottenere le credenziali:**
- Vai su https://my.telegram.org/apps
- Crea una nuova applicazione
- Copia API ID e API Hash

### 3️⃣ Avvia il bot
```bash
npm run bot
```

Al primo avvio inserisci:
- Numero di telefono Telegram
- Codice di verifica
- Password 2FA (se presente)

## 📝 Esempio di Messaggio Riconosciuto

```
LONG EUR/USD
https://www.tradingview.com/chart/?symbol=EURUSD
Entry: 1.0850
TP: 1.0900
SL: 1.0800
```

Il bot:
- ✅ Riconosce ordine LONG
- ✅ Estrae Entry, TP, SL
- ✅ Apre TradingView
- ✅ Disegna le linee sul grafico

## 📚 Documentazione Completa

Vedi `bot/GUIDA_ITALIANA.md` per la guida completa.

## ⚙️ Configurazione Avanzata

Nel file `bot/.env`:
```env
# Monitora canali specifici
TELEGRAM_CHANNELS=@channel1,@channel2

# Browser in background (headless)
TRADINGVIEW_HEADLESS=false
```

## 🆘 Problemi?

1. Controlla che il file `.env` esista in `bot/`
2. Verifica che le credenziali Telegram siano corrette
3. Leggi `bot/GUIDA_ITALIANA.md` per troubleshooting

