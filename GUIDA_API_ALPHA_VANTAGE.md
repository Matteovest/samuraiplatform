# 🔑 Guida: Integrare Alpha Vantage API

## Passo 1: Ottieni API Key Gratuita

1. Vai su: https://www.alphavantage.co/support/#api-key
2. Compila il form:
   - Email: la tua email
   - First Name: il tuo nome
   - Last Name: il tuo cognome
   - Organization: (opzionale)
3. Clicca "GET FREE API KEY"
4. Riceverai una email con la tua API key (es: `ABC123XYZ456`)

## Passo 2: Aggiungi API Key al Progetto

### Opzione A: Variabile Ambiente Locale (per sviluppo)

1. Crea file `.env.local` nella root del progetto:
```env
ALPHA_VANTAGE_API_KEY=la_tua_api_key_qui
```

2. Riavvia il server di sviluppo:
```bash
npm run dev
```

### Opzione B: Variabile Ambiente Vercel (per produzione)

1. Vai su Vercel Dashboard → Il tuo progetto → Settings → Environment Variables
2. Aggiungi:
   - Name: `ALPHA_VANTAGE_API_KEY`
   - Value: `la_tua_api_key_qui`
3. Clicca "Save"
4. Vercel farà un nuovo deploy automaticamente

## Passo 3: Limiti Alpha Vantage

- **Gratuita**: 5 chiamate/minuto, 500 chiamate/giorno
- **Premium**: A pagamento, limiti più alti

## Passo 4: Endpoint Disponibili

- `FX_INTRADAY`: Dati intraday (1min, 5min, 15min, 30min, 60min)
- `FX_DAILY`: Dati giornalieri
- `FX_WEEKLY`: Dati settimanali
- `FX_MONTHLY`: Dati mensili

## Esempio Chiamata

```
https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=EUR&to_symbol=USD&apikey=LA_TUA_KEY
```

## Nota

Alpha Vantage ha rate limits. Per evitare problemi:
- Cache i dati localmente
- Non fare troppe chiamate in sequenza
- Considera di usare dati storici salvati invece di chiamare sempre l'API

