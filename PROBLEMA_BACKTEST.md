# ⚠️ Problema: Backtest Simulato

## Situazione Attuale

### ❌ Dati Completamente Falsi
Il backtest attualmente:
- **Non usa dati storici reali**
- Genera trade **casualmente** con win rate hardcoded al **65%**
- I prezzi sono **completamente random**
- Non considera la strategia selezionata
- Non considera l'indicatore selezionato

### Codice Attuale (app/backtest/page.tsx)

```typescript
// Linea 99: Win rate FISSO al 65%
const isWin = Math.random() > 0.35 // 65% win rate (modificabile con Pine Script)

// Linea 103-105: Prezzi completamente RANDOM
const basePrice = selectedAsset === 'EURUSD' ? 1.08 : ...
const entryPrice = parseFloat((basePrice + (Math.random() - 0.5) * 0.01).toFixed(4))
```

### Perché Sembra Sempre Profittevole?

1. **Win Rate Fisso**: 65% win rate hardcoded
2. **Risk/Reward**: Con R:R 2:1 e 65% win rate, è matematicamente profittevole
3. **Nessuna Strategia Reale**: Non importa quale indicatore selezioni, il risultato è sempre lo stesso
4. **Dati Random**: I prezzi non seguono alcuna logica di mercato

## Soluzione: Dati Reali

### Opzione 1: Alpha Vantage (GRATUITA)
- Dati storici forex reali
- Limite: 5 chiamate/minuto, 500/giorno
- Richiede API key gratuita

### Opzione 2: Yahoo Finance (GRATUITA)
- Dati storici completi OHLCV
- Nessun limite ufficiale
- Libreria: `yahoo-finance2` per Node.js

### Opzione 3: File CSV/MT5
- Permettere upload di dati storici
- Parsing dati reali dal file
- Backtest su dati reali

### Opzione 4: Broker API
- MetaTrader 5 API
- OANDA API
- Dati real-time e storici

## Cosa Serve

1. **Dati Storici OHLCV** (Open, High, Low, Close, Volume)
2. **Parser Pine Script** per eseguire la strategia
3. **Engine di Backtest** che:
   - Applica la strategia ai dati reali
   - Calcola entry/exit basati su Pine Script
   - Usa risk management reale

## Stato Attuale

- ✅ Risk Management: Funziona correttamente (interesse composto)
- ✅ UI: Completa e funzionale
- ❌ Dati: Completamente simulati
- ❌ Strategia: Non applicata
- ❌ Indicatori: Non considerati

## Prossimi Passi

1. Integrare API per dati storici reali
2. Implementare parser Pine Script (o almeno logica base)
3. Applicare strategia ai dati reali
4. Calcolare statistiche reali

