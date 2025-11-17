# Guida Installazione e Avvio Samurai Platform

## ⚠️ ERRORE: ERR_CONNECTION_REFUSED

Questo errore indica che il server Next.js non è in esecuzione. Per risolvere:

## 📥 Passo 1: Installa Node.js

Node.js non è installato sul tuo sistema. Devi installarlo:

### Opzione A: Download da sito ufficiale (Consigliato)
1. Vai su: https://nodejs.org/
2. Scarica la versione **LTS** (Long Term Support) - consigliata
3. Esegui il file di installazione
4. Durante l'installazione, assicurati di selezionare "Add to PATH"
5. Riavvia il terminale/PowerShell dopo l'installazione

### Opzione B: Usando Chocolatey (se installato)
```powershell
choco install nodejs-lts
```

### Opzione C: Usando Winget (Windows 10/11)
```powershell
winget install OpenJS.NodeJS.LTS
```

## ✅ Passo 2: Verifica Installazione

Dopo l'installazione, riavvia il terminale e verifica:

```powershell
node --version
npm --version
```

Dovresti vedere le versioni installate (es. v20.x.x e 10.x.x)

## 📦 Passo 3: Installa Dipendenze

Apri PowerShell nella cartella del progetto e esegui:

```powershell
cd "C:\Users\Matteo\.cursor"
npm install
```

Questo installerà tutte le dipendenze necessarie (Next.js, React, Tailwind, ecc.)

## 🚀 Passo 4: Avvia il Server

```powershell
npm run dev
```

Dovresti vedere un output simile a:
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
- Ready in 2.3s
```

## 🌐 Passo 5: Apri nel Browser

Apri il browser e vai su:
**http://localhost:3000**

## 🔧 Risoluzione Problemi

### Se npm install fallisce:
- Assicurati di avere una connessione internet
- Prova: `npm install --legacy-peer-deps`

### Se la porta 3000 è occupata:
- Next.js userà automaticamente la porta 3001, 3002, ecc.
- Controlla il messaggio nel terminale per la porta corretta

### Se vedi errori di permessi:
- Esegui PowerShell come Amministratore
- Oppure: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## 📝 Comandi Utili

```powershell
# Sviluppo
npm run dev

# Build per produzione
npm run build

# Avvia build di produzione
npm start

# Verifica errori
npm run lint
```

## 🆘 Supporto

Se continui ad avere problemi:
1. Verifica che Node.js sia nel PATH: `$env:PATH`
2. Riavvia completamente il terminale
3. Verifica che la porta non sia bloccata dal firewall

