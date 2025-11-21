# 🔑 Guida Completa: Come Ottenere API ID e API Hash

## 📋 Passo 1: Accedi a Telegram API

1. **Apri il browser** e vai su: https://my.telegram.org/apps
2. **Accedi** con il tuo numero di telefono Telegram
   - Inserisci il numero (es: `+391234567890`)
   - Riceverai un codice su Telegram
   - Inserisci il codice ricevuto

✅ **Se riesci ad accedere, vedrai una pagina con le tue applicazioni esistenti o un pulsante "Create new application"**

---

## 📋 Passo 2: Crea Nuova Applicazione

### Opzione A: Non hai ancora applicazioni

Se vedi un messaggio che dice:
```
You haven't created any apps yet.
```

1. **Clicca sul pulsante** "Create new application" o "Create Application"
2. Compila il form che appare:

**Campi da compilare:**

- **App title**: Dai un nome alla tua app (es: "Trading Bot", "My Bot", ecc.)
  ```
  Trading Bot
  ```

- **Short name**: Un nome breve (senza spazi, solo lettere e numeri)
  ```
  tradingbot
  ```
  oppure
  ```
  mybot123
  ```

- **Platform**: Seleziona "Desktop"
  ```
  Desktop
  ```

- **Description** (opzionale): Descrizione dell'app
  ```
  Telegram trading bot
  ```

- **URL** (opzionale): Puoi lasciare vuoto o mettere un sito
  ```
  (lascia vuoto o metti un sito web)
  ```

3. **Clicca su "Create"** o "Create application"

---

### Opzione B: Hai già applicazioni

Se vedi una lista di applicazioni esistenti:

1. Puoi **usare una applicazione esistente** (se ne hai una)
   - Clicca sull'applicazione
   - Vedrai API ID e API Hash

2. Oppure **crea una nuova applicazione**:
   - Cerca il pulsante "Create new application" o "+ New Application"
   - Segui i passi dell'Opzione A

---

## 📋 Passo 3: Ottieni API ID e API Hash

Dopo aver creato l'applicazione, vedrai una pagina con:

### 📱 **API ID** (numero)
```
12345678
```

### 🔐 **API Hash** (stringa lunga)
```
abcdef1234567890abcdef1234567890
```

**⚠️ IMPORTANTE:**
- **API ID** è un numero (solo cifre, es: `12345678`)
- **API Hash** è una stringa lunga (lettere e numeri, es: `abcdef1234567890abcdef1234567890`)
- **COPIA ENTRAMBI** immediatamente
- **NON condividerle** con nessuno

---

## 📋 Passo 4: Aggiungi Credenziali al File `.env`

1. **Apri il file** `bot/.env`
2. **Trova queste righe:**
   ```env
   TELEGRAM_API_ID=your_api_id_here
   TELEGRAM_API_HASH=your_api_hash_here
   ```

3. **Sostituisci** con le tue credenziali reali:
   ```env
   TELEGRAM_API_ID=12345678
   TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
   ```

**⚠️ ATTENZIONE:**
- ❌ NON mettere spazi intorno al `=`
- ❌ NON mettere virgolette
- ❌ NON aggiungere testo extra
- ✅ Solo il numero per API ID
- ✅ Solo la stringa per API Hash

**Esempio CORRETTO:**
```env
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
```

**Esempio SBAGLIATO:**
```env
TELEGRAM_API_ID="12345678"        # ❌ Virgolette
TELEGRAM_API_HASH= abcdef...      # ❌ Spazio dopo =
TELEGRAM_API_ID = 12345678        # ❌ Spazi intorno a =
```

---

## 🐛 Problemi Comuni e Soluzioni

### ❌ Problema: "Create new application" non funziona

**Possibili cause:**
1. Hai già creato il massimo di applicazioni
2. Problemi di browser
3. Cookies/cache corrotti

**Soluzioni:**
1. **Elimina una applicazione esistente** (se ne hai troppe)
2. **Prova browser diverso** (Chrome, Firefox, Edge)
3. **Pulisci cache e cookies** del browser
4. **Prova modalità incognito/privata**
5. **Prova dispositivo diverso** (computer, tablet)

---

### ❌ Problema: "You can't create more applications"

**Causa:** Hai già creato il numero massimo di applicazioni.

**Soluzione:**
1. **Elimina un'applicazione esistente** che non usi
2. Clicca sull'applicazione → "Delete"
3. Poi crea una nuova applicazione

---

### ❌ Problema: "Invalid phone number"

**Causa:** Formato numero errato.

**Soluzione:**
- Usa formato internazionale: `+391234567890`
- Con il `+` e codice paese
- SENZA spazi o trattini

---

### ❌ Problema: "Code invalid" o "Code expired"

**Causa:** Codice scaduto o errato.

**Soluzione:**
1. Richiedi un nuovo codice
2. Inserisci rapidamente (scade dopo pochi minuti)
3. Non mettere spazi nel codice

---

### ❌ Problema: "Too many attempts"

**Causa:** Troppi tentativi di accesso.

**Soluzione:**
1. **Aspetta 24 ore** e riprova
2. **Prova browser diverso**
3. **Prova dispositivo diverso**
4. **Prova rete diversa** (WiFi, mobile data)
5. **Prova modalità incognito/privata**
6. **Usa VPN** (se disponibile)

Vedi `bot/FIX_TROPPI_TENTATIVI.md` per soluzioni dettagliate.

---

## ✅ Checklist Finale

Prima di procedere, verifica:

- [ ] Ho creato una nuova applicazione su https://my.telegram.org/apps
- [ ] Ho copiato **API ID** (numero)
- [ ] Ho copiato **API Hash** (stringa lunga)
- [ ] Ho aggiunto le credenziali al file `bot/.env`
- [ ] Ho verificato che non ci siano spazi o virgolette
- [ ] Ho salvato il file `.env`

---

## 📸 Screenshot Esempi

### Pagina iniziale (dopo login):
```
┌─────────────────────────────────────┐
│ Telegram API                        │
├─────────────────────────────────────┤
│ You haven't created any apps yet.   │
│                                     │
│ [Create new application]            │
└─────────────────────────────────────┘
```

### Form creazione applicazione:
```
┌─────────────────────────────────────┐
│ Create new application              │
├─────────────────────────────────────┤
│ App title: [Trading Bot         ]   │
│ Short name: [tradingbot         ]   │
│ Platform: [Desktop ▼]               │
│ Description: [Telegram bot...   ]   │
│ URL: [                    ]         │
│                                     │
│ [Create]                            │
└─────────────────────────────────────┘
```

### Pagina credenziali (dopo creazione):
```
┌─────────────────────────────────────┐
│ Your application                    │
├─────────────────────────────────────┤
│ App title: Trading Bot              │
│                                     │
│ API ID: 12345678                    │
│                                     │
│ API Hash: abcdef1234567890...       │
│                                     │
│ [Delete]                            │
└─────────────────────────────────────┘
```

---

## 🚀 Dopo Aver Ottenuto le Credenziali

1. ✅ **Aggiungi al file `.env`** come spiegato sopra
2. ✅ **Installa dipendenze**: `npm install`
3. ✅ **Avvia il bot**: `npm run bot`
4. ✅ **Completa il login** Telegram (prima volta)
5. ✅ **Salva la STRING SESSION** generata

Vedi `bot/GUIDA_CONFIGURAZIONE.md` per la guida completa!

---

## 💡 Suggerimenti

- **Conserva le credenziali** in un posto sicuro (password manager)
- **Non condividerle** mai con nessuno
- **Puoi creare più applicazioni** se necessario (max limitato)
- **Ogni applicazione** ha credenziali diverse
- **Le credenziali non scadono** (a meno che non elimini l'app)

**Buona fortuna! 🎉**

