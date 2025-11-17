# 🔧 Risoluzione: "Branch to deploy" obbligatorio su Netlify

## Soluzione 1: Inserisci manualmente "main"

Se Netlify non trova il branch automaticamente:

1. Nel campo **"Branch to deploy"**, digita manualmente: `main`
2. Oppure prova: `master` (se non hai rinominato il branch)
3. Clicca **"Deploy site"**

## Soluzione 2: Verifica il branch su GitHub

1. Vai su: `https://github.com/TUO_USERNAME/samurai-platform`
2. Controlla in alto a sinistra quale branch è selezionato
3. Di solito è `main` o `master`
4. Usa quello stesso nome su Netlify

## Soluzione 3: Ricarica Netlify

1. **Chiudi completamente** la pagina Netlify
2. **Riapri** https://app.netlify.com
3. Vai su **"Add new site"** → **"Import an existing project"**
4. Clicca **"Deploy with GitHub"**
5. Seleziona il repository
6. Ora dovrebbe mostrare i branch

## Soluzione 4: Verifica autorizzazioni

1. Vai su: https://app.netlify.com/user/applications
2. Controlla che GitHub sia autorizzato
3. Se necessario, clicca **"Configure"** e riautorizza
4. Assicurati di dare accesso al repository `samurai-platform`

## Soluzione 5: Usa il deploy manuale (alternativa)

Se continua a non funzionare:

1. Vai su: https://app.netlify.com
2. Clicca **"Add new site"** → **"Deploy manually"**
3. Nel terminale esegui:
   ```powershell
   cd "C:\Users\Matteo\.cursor"
   npm run build
   ```
4. Trascina la cartella `.next` su Netlify
5. Il sito sarà online (ma senza deploy automatico)

## ✅ Soluzione Rapida (Prova questa prima!)

**Nel campo "Branch to deploy" su Netlify, digita semplicemente:**
- `main` (se hai rinominato il branch)
- `master` (se non l'hai rinominato)

Poi clicca **"Deploy site"** - dovrebbe funzionare!

---

## Verifica rapida

Esegui questo comando per vedere il tuo branch:

```powershell
git branch
```

Usa il nome del branch che vedi (probabilmente `main` o `master`) e inseriscilo manualmente su Netlify.

