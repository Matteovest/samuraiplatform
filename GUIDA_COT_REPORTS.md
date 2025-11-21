# 📊 Guida Integrazione COT Reports

## ✅ Cosa è stato implementato

Ho integrato i **COT Reports reali** dalla CFTC (Commodity Futures Trading Commission) nella sezione DeepView.

## 🔄 Come Funziona

1. **Mappatura Simboli**: I simboli forex vengono mappati ai futures CFTC:
   - `EURUSD` → `6E` (Euro FX)
   - `GBPUSD` → `6B` (British Pound)
   - `USDJPY` → `6J` (Japanese Yen)
   - `AUDUSD` → `6A` (Australian Dollar)
   - `USDCAD` → `6C` (Canadian Dollar)
   - `NZDUSD` → `6N` (New Zealand Dollar)

2. **Download Dati**: Il sistema prova a scaricare i file COT dalla CFTC ogni settimana (pubblicati ogni venerdì alle 15:30 ET).

3. **Fallback**: Se il download fallisce, usa dati realistici basati su pattern storici.

## 📡 Fonti Dati COT

### Opzione 1: Download Diretto CFTC (Attuale)
- **URL**: `https://www.cftc.gov/files/dea/history/deacotYYYYMMDD.txt`
- **Gratuito**: ✅ Sì
- **Limiti**: Nessuno
- **Aggiornamento**: Settimanale (ogni venerdì)

### Opzione 2: API di Terze Parti (Per Produzione)
Se vuoi dati più affidabili e aggiornati in tempo reale, considera:

1. **COT Base API** (a pagamento)
   - URL: https://cotbase.com/
   - Vantaggi: API RESTful, dati storici, supporto

2. **Trading Economics API** (piano gratuito limitato)
   - URL: https://tradingeconomics.com/api
   - Vantaggi: Dati macroeconomici + COT

3. **Alpha Vantage** (non supporta COT direttamente)
   - Solo dati forex, non COT

## 🔧 Implementazione Attuale

### Endpoint API
```
GET /api/market-data?type=cot&symbol=EURUSD
```

### Risposta
```json
{
  "success": true,
  "symbol": "EURUSD",
  "cftcSymbol": "6E",
  "cotData": {
    "commercial": -45000,
    "nonCommercial": 32000,
    "nonReportable": 13000,
    "lastUpdate": "17 novembre 2024",
    "reportDate": "20241115",
    "source": "CFTC COT Reports (real data)"
  }
}
```

## ⚠️ Limitazioni Attuali

1. **Parsing CSV**: Il parsing dei file CFTC è semplificato. Per produzione, considera:
   - Usare una libreria CSV più robusta
   - Implementare un worker/cron job per scaricare e processare i file
   - Cache dei dati per evitare troppe richieste

2. **Ambiente Serverless**: Vercel/Netlify hanno limiti su:
   - Download di file ZIP grandi
   - Timeout delle richieste (10s su Vercel Hobby)
   
   **Soluzione**: Usa un servizio API di terze parti o un worker separato.

3. **Rate Limiting**: La CFTC non ha rate limits ufficiali, ma è buona pratica:
   - Cache i dati per 24 ore (i report sono settimanali)
   - Non fare troppe richieste simultanee

## 🚀 Miglioramenti Futuri

1. **Worker/Cron Job**: Implementa un worker che:
   - Scarica i COT ogni venerdì
   - Li processa e salva in un database
   - Serve i dati dalla cache

2. **API di Terze Parti**: Integra un servizio API dedicato per:
   - Dati più affidabili
   - Supporto storico completo
   - Aggiornamenti in tempo reale

3. **Visualizzazioni**: Aggiungi:
   - Grafici storici delle posizioni COT
   - Indicatori derivati (COT Index, etc.)
   - Confronto tra asset

## 📝 Note

- I dati COT sono pubblicati ogni **venerdì alle 15:30 ET**
- I report coprono le posizioni del **martedì precedente**
- I valori sono in **contratti** (net positions)
- **Commercial**: Istituzioni (hedgers)
- **Non-Commercial**: Speculatori (large traders)
- **Non-Reportable**: Piccoli trader

## 🔗 Link Utili

- [CFTC COT Reports](https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm)
- [COT Base](https://cotbase.com/)
- [Trading Economics](https://tradingeconomics.com/)

