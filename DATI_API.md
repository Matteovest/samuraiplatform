# 📊 Fonti Dati per Samurai Platform

## Situazione Attuale

### ❌ Backtest
- **Dati**: Completamente simulati/random
- **Fonte**: Nessuna - genera trade casuali
- **Problema**: Non usa dati storici reali

### ❌ DeepView  
- **Dati**: Simulati/calcolati
- **Fonte**: Nessuna - calcola da valori random
- **Problema**: Non usa API reali per prezzi, COT, sentiment

## ✅ Soluzioni Proposte

### 1. Backtest - Dati Storici

#### Opzione A: Alpha Vantage (GRATUITA)
- **API**: `https://www.alphavantage.co/`
- **Limite**: 5 chiamate/minuto, 500/giorno
- **Dati**: Forex intraday, daily, weekly
- **Costo**: Gratis (con limiti)

**Setup**:
```bash
# Aggiungi API key in .env.local
ALPHA_VANTAGE_API_KEY=your_key_here
```

#### Opzione B: Yahoo Finance (GRATUITA)
- **API**: `yfinance` (Python) o `yahoo-finance2` (Node.js)
- **Limite**: Nessun limite ufficiale
- **Dati**: Storici completi OHLCV
- **Costo**: Gratis

#### Opzione C: Broker API (MIGLIORE)
- **MetaTrader 5 API**: Dati reali dal broker
- **OANDA API**: Dati storici e real-time
- **Interactive Brokers**: Dati professionali
- **Costo**: Dipende dal broker

### 2. DeepView - Dati Macroeconomici

#### Prezzi Forex
- **Alpha Vantage**: `FX_INTRADAY`, `FX_DAILY`
- **ExchangeRate-API**: Gratuita, 1500 chiamate/mese
- **Fixer.io**: Gratuita, 100 chiamate/mese

#### COT Reports (CFTC)
- **Fonte**: https://www.cftc.gov/MarketReports/
- **API**: Non ufficiale, richiede scraping
- **Alternative**: 
  - TradingView (widget)
  - TradingEconomics API (a pagamento)

#### Sentiment
- **TradingView Widget**: Integrazione diretta
- **FXStreet**: API sentiment (a pagamento)
- **Myfxbook**: Community sentiment (API limitata)

#### Dati Macroeconomici
- **FRED API** (Federal Reserve): GRATUITA
  - Tassi di interesse
  - Inflazione
  - GDP
  - Disoccupazione
- **TradingEconomics**: API completa (a pagamento)

## 🚀 Implementazione Consigliata

### Fase 1: Backtest con Dati Reali
1. Integrare Alpha Vantage per dati storici
2. Cache locale per evitare rate limits
3. Supporto per upload file CSV/MT5

### Fase 2: DeepView con API Reali
1. Alpha Vantage per prezzi forex
2. FRED API per dati macro
3. TradingView Widget per grafici
4. COT Reports via scraping o API dedicata

### Fase 3: Ottimizzazione
1. Database locale per cache
2. WebSocket per dati real-time
3. Background jobs per aggiornamenti

## 📝 Note

- **Alpha Vantage**: Richiede registrazione gratuita
- **Rate Limits**: Importante rispettare i limiti
- **Caching**: Essenziale per performance
- **Fallback**: Mantenere dati simulati come backup

## 🔑 Variabili Ambiente

Aggiungi in `.env.local`:
```env
ALPHA_VANTAGE_API_KEY=your_key_here
FRED_API_KEY=your_key_here
EXCHANGE_RATE_API_KEY=your_key_here
```

