# 📱 Configurazione dal Telefono

Questa guida spiega come configurare il bot quando devi usare principalmente il telefono.

## 🔑 Passo 1: Ottenere le Credenziali API

### Usa il Browser del Telefono

1. **Apri il browser del telefono** (Chrome, Safari, Firefox, ecc.)

2. **Vai a**: https://my.telegram.org/apps

3. **Accedi**:
   - Inserisci il tuo numero di telefono (con prefisso, es. `+39...`)
   - Riceverai un codice su Telegram → inseriscilo nel browser
   - Se hai 2FA, inserisci anche la password

4. **Crea una nuova applicazione**:
   - **App title**: `Trading Bot` (o qualsiasi nome)
   - **Short name**: `tradingbot` (o qualsiasi nome breve)
   - **Platform**: Seleziona `Web`
   - **Description**: Puoi lasciarla vuota

5. **Copia le credenziali**:
   - Vedrai due campi:
     - `api_id`: Un numero (es. `12345678`)
     - `api_hash`: Una stringa di lettere/numeri (es. `abcdef1234567890...`)
   - **Copia entrambi** e salvali sul telefono (note, messaggi a te stesso, ecc.)
   - ⚠️ **IMPORTANTE**: Tienile al sicuro!

## 📋 Passo 2: Configurare il File .env sul Computer

Sul computer dove hai il bot:

1. Apri la cartella `bot/`
2. Crea un file chiamato `.env`
3. Inserisci questo contenuto:

```env
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
TELEGRAM_STRING_SESSION=
TELEGRAM_CHANNELS=
TRADINGVIEW_HEADLESS=false
```

4. **Sostituisci** `12345678` e `abcdef...` con i valori che hai copiato dal telefono

## 🚀 Passo 3: Primo Avvio (dal Computer)

**Nota**: Il bot si avvia sul computer, ma userai il telefono per ricevere i codici.

1. Sul computer, avvia:
   ```bash
   npm run bot
   ```

2. Ti chiederà il numero di telefono:
   - Inserisci lo stesso numero dell'account Telegram
   - Inseriscilo con prefisso (es. `+39...`)

3. Controlla il telefono:
   - Riceverai un messaggio su Telegram con un codice
   - Copia il codice e incollalo nel terminale del computer

4. Se hai 2FA:
   - Ti chiederà la password
   - Inserisci la password di autenticazione a due fattori

5. **Copia la String Session**:
   - Dopo il login, vedrai un codice lungo (String Session)
   - Copialo e aggiungilo al file `bot/.env`:
   ```env
   TELEGRAM_STRING_SESSION=1BVtsOHwBu7Q-...
   ```

## 📡 Passo 4: Configurare i Canali (Opzionale)

### Opzione A: Dal Computer (Consigliato)

```bash
npm run bot:setup
```

Questo ti mostrerà tutti i canali e puoi selezionarli.

### Opzione B: Manuale

1. Apri `bot/.env` sul computer
2. Aggiungi i canali da monitorare:

```env
TELEGRAM_CHANNELS=@nome_canale_qui
```

**Per trovare il nome del canale:**
- Apri Telegram sul telefono
- Vai al canale
- Il nome è quello che vedi in alto (o l'username se inizia con @)

## ✅ Passo 5: Avviare il Bot

Sul computer:

```bash
npm run bot
```

Il bot ora:
- ✅ È connesso al tuo account Telegram
- ✅ Monitora i canali che hai configurato
- ✅ Riceve messaggi in tempo reale
- ✅ Analizza le immagini TradingView
- ✅ Estrae Entry, TP, SL automaticamente

## 🆘 Risoluzione Problemi

### Non riesco ad accedere a my.telegram.org/apps

**Soluzioni**:
1. Prova da un browser diverso sul telefono
2. Prova in modalità desktop (se il browser lo supporta)
3. Prova da un altro dispositivo (tablet, altro telefono)
4. Verifica che la connessione internet funzioni

### Il codice di verifica non arriva

**Soluzioni**:
1. Controlla che il numero sia corretto (con prefisso)
2. Assicurati di avere segnale/Internet
3. Controlla tutti i dispositivi dove hai Telegram aperto
4. Prova a riavviare l'app Telegram

### Errore durante l'accesso dal computer

**Possibili cause**:
1. **String Session scaduta**: Elimina `TELEGRAM_STRING_SESSION` dal `.env` e riavvia
2. **Numero errato**: Usa lo stesso numero dell'account Telegram
3. **Codice scaduto**: I codici scadono dopo 5 minuti, richiedine uno nuovo

## 💡 Suggerimenti

- **Salva le credenziali**: Tieni API ID e API Hash salvati da qualche parte sicura
- **String Session**: Una volta configurata, non dovrai più inserire codice/numero
- **Canali**: Puoi cambiare i canali monitorati in qualsiasi momento modificando `.env`
- **Backup**: Fai un backup del file `.env` (senza condividerlo!)

## 📞 Workflow Completo

1. **Telefono**: Ottieni API ID/Hash da my.telegram.org/apps
2. **Computer**: Aggiungi API ID/Hash al file `.env`
3. **Computer**: Avvia `npm run bot`
4. **Telefono**: Ricevi codice su Telegram
5. **Computer**: Inserisci codice nel terminale
6. **Computer**: Copia String Session nel `.env`
7. **Computer**: Configura canali (opzionale)
8. **Fatto!**: Il bot è pronto

Il bot rimane in esecuzione sul computer e riceve i messaggi dal tuo account Telegram in tempo reale!

