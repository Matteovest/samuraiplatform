# 🥷 Samurai Platform

Una piattaforma completa di backtesting e analisi per trader professionisti.

## Funzionalità

- **#1 Backtester**: Testa le tue strategie senza rischiare un centesimo
- **Journal Automatico**: Importa e analizza i tuoi trade con statistiche dettagliate
- **DeepView**: Overview, sentiment, volatilità, stagionalità e COT report
- **Pricing**: Piani Free, Basic e Pro con funzionalità differenziate
- **Dashboard**: Interfaccia intuitiva per gestire tutte le funzionalità

## Tecnologie

- Next.js 14
- TypeScript
- Tailwind CSS
- React
- Framer Motion (per animazioni)

## ⚠️ Prerequisiti

**IMPORTANTE**: Devi avere Node.js installato sul tuo sistema.

- Scarica Node.js da: https://nodejs.org/ (versione LTS consigliata)
- Verifica l'installazione: `node --version` e `npm --version`

## 🚀 Installazione e Avvio

### Metodo 1: Script Automatico (Consigliato)

**Windows:**
- Doppio click su `avvia-samurai-platform.bat` (o `avvia-samurai-platform.ps1`)

**PowerShell:**
```powershell
.\avvia-samurai-platform.ps1
```

### Metodo 2: Manuale

```bash
# Installa le dipendenze (solo la prima volta)
npm install

# Avvia il server di sviluppo
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## ❌ Risoluzione ERR_CONNECTION_REFUSED

Se vedi l'errore `ERR_CONNECTION_REFUSED`:

1. **Verifica che Node.js sia installato**: `node --version`
2. **Installa le dipendenze**: `npm install`
3. **Avvia il server**: `npm run dev`
4. **Attendi il messaggio**: "Ready" nel terminale
5. **Apri il browser**: http://localhost:3000

Vedi `INSTALLAZIONE.md` per una guida dettagliata.

## Struttura del Progetto

```
├── app/                 # App Router di Next.js
│   ├── page.tsx        # Homepage
│   ├── backtest/       # Pagina Backtester
│   ├── journal/        # Pagina Journal
│   ├── deepview/       # Pagina DeepView
│   └── pricing/        # Pagina Pricing
├── components/         # Componenti React riutilizzabili
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Pricing.tsx
│   ├── Testimonials.tsx
│   ├── FAQ.tsx
│   └── CTA.tsx
└── public/            # File statici
```

## Build per Produzione

```bash
npm run build
npm start
```

## Note

Questa è una piattaforma frontend completa. Per funzionalità avanzate come:
- Integrazione TradingView
- Backend per salvataggio dati
- Autenticazione utenti
- Importazione trade automatica

sarà necessario implementare un backend e integrazioni con servizi esterni.
