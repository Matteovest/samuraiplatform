# 📊 Guida Configurazione FRED API per Dati Macroeconomici

## ✅ Cosa è stato implementato

Ho integrato i **dati macroeconomici reali** dalla FRED (Federal Reserve Economic Data) nella sezione DeepView.

## 📈 Dati Disponibili

Per ogni valuta, vengono mostrati:
- **Tasso di Interesse**: Tasso di riferimento della banca centrale
- **Inflazione (CPI)**: Indice dei prezzi al consumo
- **Disoccupazione**: Tasso di disoccupazione
- **Crescita PIL (GDP)**: Crescita del Prodotto Interno Lordo
- **Produzione Industriale**: Variazione della produzione industriale

## 🔑 Come Ottenere la FRED API Key

1. Vai su: https://fred.stlouisfed.org/docs/api/api_key.html
2. Clicca su **"Request API Key"**
3. Compila il form (gratuito, richiede solo email)
4. Riceverai la chiave via email

## ⚙️ Configurazione

### Locale (.env.local)
Aggiungi al file `.env.local`:
```
FRED_API_KEY=la_tua_chiave_qui
```

### Produzione (Vercel)
1. Vai su: https://vercel.com/dashboard
2. Seleziona il progetto `samuraiplatform`
3. **Settings** → **Environment Variables**
4. Aggiungi:
   - **Name:** `FRED_API_KEY`
   - **Value:** `la_tua_chiave_qui`
   - **Environment:** Production, Preview, Development
5. Clicca **Save**

## 🔄 Come Funziona

1. La pagina DeepView carica automaticamente i dati macro per la valuta base (es. EUR per EURUSD)
2. I dati vengono mostrati in una sezione dedicata
3. L'interpretazione COT include riferimenti ai dati macro reali
4. Se l'API key non è configurata, vengono usati dati simulati realistici

## 📊 Valute Supportate

- **EUR** (Euro)
- **GBP** (Sterlina)
- **USD** (Dollaro)
- **JPY** (Yen)
- **AUD** (Dollaro Australiano)
- **CAD** (Dollaro Canadese)
- **NZD** (Dollaro Neozelandese)

## 🔗 Link Utili

- [FRED API Documentation](https://fred.stlouisfed.org/docs/api/)
- [FRED API Key Request](https://fred.stlouisfed.org/docs/api/api_key.html)
- [FRED Data Browser](https://fred.stlouisfed.org/)

## ⚠️ Note

- La FRED API è **gratuita** e senza limiti per uso personale
- I dati vengono cachati per 24 ore (i dati macro si aggiornano mensilmente/trimestralmente)
- Alcuni codici serie potrebbero non essere disponibili per tutte le valute (fallback a dati simulati)

