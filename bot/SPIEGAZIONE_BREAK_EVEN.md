# 🔧 Spiegazione Break Even - Come Funziona

## 📋 Panoramica

Il sistema Break Even ha **DUE modalità**:

1. **Manuale**: Quando ricevi un messaggio Telegram "operazione spostata a BE"
2. **Automatica**: Quando il prezzo raggiunge Entry durante il monitoraggio

## 🔧 Modalità 1: Break Even Manuale (da Messaggio Telegram)

### Quando Accade

Quando il canale pubblica un messaggio come:
```
Operazione spostata a BE
```

### Cosa Fa il Bot

1. ✅ **Riconosce** il messaggio come richiesta BE
2. ✅ **Trova** l'ordine di riferimento (per ID o simbolo/tipo)
3. ✅ **Calcola** prezzo Break Even:
   - **LONG**: BE = Entry + spread (es. Entry + 2 pip)
   - **SHORT**: BE = Entry - spread (es. Entry - 2 pip)
4. ✅ **Sposta** Stop Loss al prezzo BE sul broker
5. ✅ **Aggiorna** ordine nello storage

### Esempio

**Ordine originale:**
- Entry: 1.0850
- SL: 1.0800 (50 pip sotto)
- Tipo: LONG

**Messaggio ricevuto:**
```
Operazione spostata a BE
```

**Bot sposta:**
- Nuovo SL: 1.0852 (Entry + 2 pip per coprire spread)
- Ora la posizione è protetta: non perderà mai, al massimo chiude a BE

## 🤖 Modalità 2: Break Even Automatico (Monitoraggio)

### Quando Accade

Durante il monitoraggio automatico (ogni minuto), quando:
- **LONG**: Il prezzo sale e **supera Entry** (posizione è in profitto)
- **SHORT**: Il prezzo scende e **supera Entry** (posizione è in profitto)

### Cosa Fa il Bot

1. ✅ **Controlla** tutte le posizioni aperte
2. ✅ **Verifica** se il prezzo ha raggiunto/superato Entry
3. ✅ **Se sì**, sposta automaticamente SL a BE
4. ✅ **Protegge** la posizione da perdite future

### Esempio

**Ordine originale:**
- Entry: 1.0850
- SL: 1.0800
- Tipo: LONG
- Prezzo corrente iniziale: 1.0820 (sotto Entry)

**Durante monitoraggio:**
- Minuto 1: Prezzo = 1.0830 (ancora sotto Entry) → Nessuna azione
- Minuto 2: Prezzo = 1.0845 (ancora sotto Entry) → Nessuna azione
- Minuto 3: Prezzo = 1.0851 (**SOPRA Entry!**) → Bot sposta SL a 1.0852 (BE)
- Minuto 4+: Prezzo continua a salire → Posizione protetta, SL a BE

## ⚠️ IMPORTANTE: Differenza tra le Due Modalità

### Messaggio Telegram "BE"
- È una **richiesta esplicita** dal trader
- Il bot **sposta subito** a BE, anche se prezzo non ha ancora raggiunto Entry
- **Non importa** dove sia il prezzo attuale

### Monitoraggio Automatico "BE"
- È **automatico** quando il prezzo raggiunge Entry
- Il bot sposta a BE **solo quando** il prezzo è già sopra (LONG) o sotto (SHORT) Entry
- **Protezione automatica** quando posizione è in profitto

## 🎯 Perché Entrambe le Modalità?

### Messaggio Telegram:
- ✅ **Flessibilità**: Puoi spostare a BE in qualsiasi momento
- ✅ **Controllo**: Decidi tu quando spostare
- ✅ **Velocità**: Spostamento immediato

### Monitoraggio Automatico:
- ✅ **Sicurezza**: Protezione automatica quando posizione è in profitto
- ✅ **Dormi tranquillo**: Funziona 24/7 anche quando non controlli
- ✅ **Nessun intervento**: Completamente automatico

## 📊 Esempio Completo Workflow

### Scenario: Ordine LONG EUR/USD

**Ordine iniziale:**
- Entry: 1.0850
- SL: 1.0800
- TP: 1.0900
- Tipo: LONG

**Fase 1: Ordine aperto**
- Prezzo corrente: 1.0830 (sotto Entry)
- Posizione: In perdita potenziale
- SL: 1.0800 (originale)

**Fase 2: Prezzo sale**
- Prezzo corrente: 1.0845 (ancora sotto Entry)
- Posizione: Ancora in perdita potenziale
- SL: 1.0800 (originale)

**Fase 3: Prezzo raggiunge Entry**
- Prezzo corrente: 1.0851 (**SOPRA Entry!**)
- Bot monitoraggio: **Sposta automaticamente SL a 1.0852 (BE)**
- Posizione: Ora protetta, non può perdere

**Fase 4A: Se ricevi messaggio Telegram "BE"**
- Bot: **Sposta immediatamente** SL a 1.0852 (anche se prezzo era sotto Entry)
- Protezione immediata

**Fase 4B: Se prezzo continua a salire**
- Prezzo corrente: 1.0870
- Posizione: In profitto, protetta a BE
- SL: 1.0852 (BE)

**Fase 5: Prezzo raggiunge TP**
- Prezzo corrente: 1.0900 (TP)
- Bot: Chiude posizione, profitto realizzato
- Balance aggiornato (interesse composto)

## 🔍 Logica Tecnica

### Calcolo Break Even

```typescript
// Per LONG:
BE = Entry + spread
// Es: Entry 1.0850, spread 2 pip (0.0002)
// BE = 1.0850 + 0.0002 = 1.0852

// Per SHORT:
BE = Entry - spread
// Es: Entry 1.0850, spread 2 pip (0.0002)
// BE = 1.0850 - 0.0002 = 1.0848
```

### Quando Spostare a BE (Automatico)

```typescript
// Per LONG:
if (currentPrice > entryPrice) {
  // Sposta SL a BE
  newSL = entryPrice + spread;
}

// Per SHORT:
if (currentPrice < entryPrice) {
  // Sposta SL a BE
  newSL = entryPrice - spread;
}
```

## ⚙️ Configurazione

**File `.env`:**
```env
# Pips sopra/sotto entry per Break Even (per coprire spread)
BREAKEVEN_PIPS=2

# Intervallo monitoraggio (in millisecondi)
MONITORING_INTERVAL=60000  # 1 minuto
```

## ✅ Vantaggi

1. **Protezione Automatica**: Quando posizione è in profitto, è protetta
2. **Flessibilità Manuale**: Puoi spostare a BE quando vuoi via messaggio
3. **Interesse Composto**: Balance si aggiorna con ogni trade
4. **Nessuna Perdita**: Una volta a BE, non puoi perdere

## 📝 Note Finali

- **Messaggio BE**: Spostamento immediato, non importa dove sia il prezzo
- **Monitoraggio BE**: Spostamento automatico quando prezzo raggiunge Entry
- **Spread**: Sempre considerato per coprire i costi del broker
- **Interesse Composto**: Ogni trade usa il balance aggiornato (profitti inclusi)

**Entrambe le modalità funzionano insieme per massimizzare la protezione!** 🛡️

