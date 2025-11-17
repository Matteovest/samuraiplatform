# 🌐 Come Usare un Dominio Personalizzato (www.tuosito.it)

## 🎯 Cosa Serve

Per avere un URL tipo `www.langolodelvino.it` invece di `username.github.io/repository`, devi:

1. **Comprare un dominio** (es. `langolodelvino.it`)
2. **Configurarlo su GitHub Pages**
3. **Configurare i DNS**

---

## 📋 Passo 1: Compra un Dominio

### Dove Comprare

1. **Aruba** (italiano): [aruba.it](https://www.aruba.it) - ~10-15€/anno
2. **Namecheap**: [namecheap.com](https://www.namecheap.com) - ~10-15€/anno
3. **GoDaddy**: [godaddy.com](https://www.godaddy.com) - ~10-15€/anno
4. **Register.it**: [register.it](https://www.register.it) - ~10-15€/anno

### Cosa Cercare

Cerca un dominio tipo:
- `langolodelvino.it`
- `enoteca-la-quercia.it`
- `langolo-del-vino.it`
- `enotecaviterbo.it`

**Suggerimento:** `.it` è perfetto per un'attività italiana!

---

## ⚙️ Passo 2: Configura su GitHub Pages

### Dopo Aver Comprato il Dominio:

1. Vai su GitHub → Il tuo repository
2. Clicca su **Settings**
3. Clicca su **Pages** (nella sidebar sinistra)
4. Nella sezione **"Custom domain"**, inserisci il tuo dominio:
   - Esempio: `www.langolodelvino.it` oppure `langolodelvino.it`
5. Clicca **Save**

**GitHub creerà automaticamente un file `CNAME` nel repository.**

---

## 🔧 Passo 3: Configura i DNS

### Vai sul Pannello del Tuo Registrar (dove hai comprato il dominio)

### Aggiungi Questi Record DNS:

#### Record A (4 record - tutti uguali):

1. **Tipo:** A  
   **Nome/Host:** `@` (o lascia vuoto)  
   **Valore/IP:** `185.199.108.153`  
   **TTL:** 3600 (o default)

2. **Tipo:** A  
   **Nome/Host:** `@`  
   **Valore/IP:** `185.199.109.153`  
   **TTL:** 3600

3. **Tipo:** A  
   **Nome/Host:** `@`  
   **Valore/IP:** `185.199.110.153`  
   **TTL:** 3600

4. **Tipo:** A  
   **Nome/Host:** `@`  
   **Valore/IP:** `185.199.111.153`  
   **TTL:** 3600

#### Record CNAME (per www):

**Tipo:** CNAME  
**Nome/Host:** `www`  
**Valore:** `TUO-USERNAME.github.io`  
**TTL:** 3600

**Esempio:**
- Se il tuo username è `matteo123`, il valore sarà: `matteo123.github.io`

---

## ⏱️ Tempi di Attivazione

- **DNS Propagation:** 24-48 ore
- Dopo la configurazione, il dominio potrebbe non funzionare subito
- Attendi fino a 48 ore per la propagazione completa

---

## ✅ Verifica che Funzioni

### Dopo 24-48 ore:

1. Vai su `www.tuodominio.it`
2. Dovresti vedere il tuo sito!
3. Anche `tuodominio.it` (senza www) dovrebbe funzionare

---

## 🔍 Esempio Completo

### Se compri `langolodelvino.it`:

**Su GitHub:**
- Custom domain: `www.langolodelvino.it`

**Sul Registrar (DNS):**
- 4 record A con gli IP di GitHub (vedi sopra)
- 1 record CNAME: `www` → `matteo123.github.io`

**Risultato:**
- `www.langolodelvino.it` → Apre il sito ✅
- `langolodelvino.it` → Apre il sito ✅

---

## 🆘 Problemi Comuni

### Il Dominio Non Funziona Dopo 48 Ore

1. Verifica che i DNS siano configurati correttamente
2. Controlla su GitHub Settings → Pages che il dominio sia verificato
3. Usa un tool online per verificare i DNS: [whatsmydns.net](https://www.whatsmydns.net)

### Errore "Domain not verified"

1. Assicurati che i DNS siano configurati correttamente
2. Attendi 24-48 ore
3. GitHub verificherà automaticamente il dominio

---

## 💡 Suggerimenti

1. **Scegli un dominio corto e facile da ricordare**
2. **Usa `.it` per attività italiane**
3. **Configura sia `www` che senza `www`**
4. **Dopo la configurazione, aggiorna Google Search Console con il nuovo dominio**

---

## 📞 Prossimi Passi

1. **Ora:** Scegli e compra un dominio
2. **Dopo l'acquisto:** Configura su GitHub Pages
3. **Poi:** Configura i DNS sul registrar
4. **Attendi:** 24-48 ore per la propagazione
5. **Verifica:** Apri il dominio nel browser

---

## 🎯 Domini Consigliati per Te

- `langolodelvino.it`
- `enoteca-la-quercia.it`
- `langolo-del-vino-viterbo.it`
- `enotecaviterbo.it`

Quale ti piace di più? 🍷



