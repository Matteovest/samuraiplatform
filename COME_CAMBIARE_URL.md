# 🔗 Come Cambiare l'URL del Sito GitHub Pages

## 📍 L'URL di GitHub Pages

L'URL del tuo sito è sempre:
```
https://TUO-USERNAME.github.io/NOME-REPOSITORY/
```

Per cambiare l'URL, devi cambiare il **nome del repository**.

---

## ✅ Opzione 1: Rinominare il Repository (PIÙ SEMPLICE)

### Passo 1: Vai su GitHub

1. Apri il tuo repository su GitHub
2. Clicca su **Settings** (in alto a destra)
3. Scorri fino a **"Repository name"** (in alto)
4. Clicca sull'icona matita (Edit) accanto al nome
5. Cambia il nome (es. da `enoteca-langolo-del-vino` a `langolo-del-vino`)
6. Clicca **Rename**

### Passo 2: Il Nuovo URL

Dopo aver rinominato, il nuovo URL sarà:
```
https://TUO-USERNAME.github.io/NUOVO-NOME-REPOSITORY/
```

**Esempio:**
- Vecchio: `https://matteo123.github.io/enoteca-langolo-del-vino/`
- Nuovo: `https://matteo123.github.io/langolo-del-vino/`

### ⚠️ Importante

- Il vecchio URL smetterà di funzionare
- Aggiorna tutti i link che hai condiviso
- Google impiegherà tempo per indicizzare il nuovo URL

---

## 🌐 Opzione 2: Usare un Dominio Personalizzato (PROFESSIONALE)

Se vuoi un URL tipo `www.langolodelvino.it` o `langolodelvino.com`:

### Passo 1: Compra un Dominio

1. Vai su un registrar (es. [Namecheap](https://www.namecheap.com), [GoDaddy](https://www.godaddy.com), [Aruba](https://www.aruba.it))
2. Cerca un dominio disponibile (es. `langolodelvino.it`)
3. Compralo (costo: ~10-15€/anno)

### Passo 2: Configura su GitHub

1. Vai su GitHub → Il tuo repository → **Settings** → **Pages**
2. Nella sezione **"Custom domain"**, inserisci il tuo dominio (es. `www.langolodelvino.it`)
3. Clicca **Save**

### Passo 3: Configura il DNS

1. Vai sul pannello del tuo registrar (dove hai comprato il dominio)
2. Aggiungi questi record DNS:
   - **Tipo:** A
   - **Nome:** @
   - **Valore:** `185.199.108.153`
   - **Tipo:** A
   - **Nome:** @
   - **Valore:** `185.199.109.153`
   - **Tipo:** A
   - **Nome:** @
   - **Valore:** `185.199.110.153`
   - **Tipo:** A
   - **Nome:** @
   - **Valore:** `185.199.111.153`
   - **Tipo:** CNAME
   - **Nome:** www
   - **Valore:** `TUO-USERNAME.github.io`

3. Attendi 24-48 ore per la propagazione DNS

### Vantaggi del Dominio Personalizzato

- ✅ URL professionale (es. `www.langolodelvino.it`)
- ✅ Più facile da ricordare
- ✅ Migliore per il branding
- ✅ Più professionale per i clienti

---

## 🔄 Opzione 3: Creare un Nuovo Repository

Se vuoi mantenere il vecchio repository e crearne uno nuovo:

1. Crea un nuovo repository su GitHub con il nome che vuoi
2. Carica tutti i file nel nuovo repository
3. Attiva GitHub Pages sul nuovo repository
4. Il nuovo URL sarà: `https://TUO-USERNAME.github.io/NUOVO-NOME/`

---

## 📋 Quale Opzione Scegliere?

### Per un URL più corto/semplice:
→ **Opzione 1** (Rinominare il repository) - GRATIS

### Per un URL professionale con dominio:
→ **Opzione 2** (Dominio personalizzato) - ~10-15€/anno

### Per mantenere entrambi:
→ **Opzione 3** (Nuovo repository) - GRATIS

---

## 🎯 Esempi di URL

### Con GitHub Pages (gratis):
- `https://matteo123.github.io/langolo-del-vino/`
- `https://matteo123.github.io/enoteca-viterbo/`
- `https://matteo123.github.io/la-quercia-vini/`

### Con Dominio Personalizzato:
- `www.langolodelvino.it`
- `langolodelvino.com`
- `enoteca-la-quercia.it`

---

## ⚠️ Dopo Aver Cambiato URL

1. **Aggiorna tutti i link:**
   - Profilo Instagram
   - Carta da visita
   - Google Business (se ce l'hai)

2. **Risottometti a Google:**
   - Vai su Google Search Console
   - Aggiungi la nuova proprietà
   - Richiedi indicizzazione

3. **Comunica il cambio:**
   - Se hai già condiviso il vecchio link, informa i clienti del nuovo URL

---

## 💡 Suggerimento

Per un'enoteca, consiglio:
- **URL corto** se vuoi restare su GitHub Pages gratis
- **Dominio personalizzato** se vuoi un URL più professionale e facile da ricordare

---

## 📞 Dimmi Cosa Preferisci

Quale opzione vuoi usare?
1. Rinominare il repository (URL più corto)
2. Usare un dominio personalizzato (URL professionale)
3. Creare un nuovo repository

Dimmi e ti guido passo-passo! 🚀






