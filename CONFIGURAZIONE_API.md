# 🔑 Configurazione API Key Alpha Vantage

## ✅ API Key Configurata Localmente

Ho creato il file `.env.local` con la tua API key.

## 🚀 Per Usare i Dati Reali

1. **Riavvia il server di sviluppo:**
   ```bash
   npm run dev
   ```

2. **Vai su:** http://localhost:3000/backtest

3. **Clicca "Carica dati reali"** - ora dovrebbe funzionare!

## 🌐 Per Produzione (Vercel)

Devi aggiungere la stessa API key su Vercel:

1. Vai su: https://vercel.com/dashboard
2. Seleziona il progetto `samuraiplatform`
3. Vai su **Settings** → **Environment Variables**
4. Aggiungi:
   - **Name:** `ALPHA_VANTAGE_API_KEY`
   - **Value:** `JCL0RC3Z0OF1ID4J`
   - **Environment:** Production, Preview, Development (seleziona tutti)
5. Clicca **Save**
6. Vercel farà un nuovo deploy automaticamente

## ⚠️ Importante

- Il file `.env.local` è già nel `.gitignore` - non verrà committato su GitHub
- La chiave è sicura e non sarà esposta pubblicamente
- Limiti Alpha Vantage: 5 chiamate/minuto, 500/giorno

## 🧪 Test

Dopo aver riavviato il server, vai su `/backtest` e dovresti vedere:
- ✅ "Dati Reali: Caricati X candele storiche da Alpha Vantage"
- Invece di ⚠️ "Modalità Simulazione"

