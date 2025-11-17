# Fix per GitHub Pages - Immagini Non Visibili

## Problema
Le immagini non appaiono su GitHub Pages anche se i file sono stati caricati.

## Soluzioni

### 1. Verifica la Struttura delle Cartelle
Assicurati che la struttura sia così:
```
repository/
├── index.html
├── styles.css
├── script.js
├── images/
│   ├── negozio-copertina.jp.jpg
│   ├── violone-le-lase.jpg
│   └── ... (altre immagini)
└── altri-file.html
```

### 2. Verifica i Nomi dei File (Case-Sensitive)
GitHub Pages è **case-sensitive**! I nomi devono corrispondere esattamente:
- ✅ `images/violone-le-lase.jpg`
- ❌ `images/Violone-Le-Lase.jpg` (se il file si chiama violone-le-lase.jpg)

### 3. Verifica le Estensioni
Controlla che le estensioni siano corrette:
- Alcuni file hanno doppia estensione: `.jpg.jpg` (es. `le-lase-prima-lux.jpg.jpg`)
- I percorsi nel codice devono corrispondere esattamente

### 4. Percorsi Relativi vs Assoluti
I percorsi relativi `images/file.jpg` dovrebbero funzionare se:
- Il file HTML è nella root del repository
- La cartella `images/` è nella root del repository

### 5. Come Verificare
1. Vai su GitHub nel tuo repository
2. Clicca su una cartella `images/`
3. Verifica che i file siano presenti
4. Clicca su un file immagine
5. Copia l'URL del file (es. `https://raw.githubusercontent.com/USERNAME/REPO/main/images/file.jpg`)
6. Apri l'URL nel browser per verificare che l'immagine si carichi

### 6. Fix Immediato
Se le immagini non si caricano, prova a:
1. Usare percorsi assoluti con il nome del repository:
   ```html
   <img src="/NOME-REPOSITORY/images/file.jpg" alt="...">
   ```
   
2. Oppure verificare che i file siano stati committati correttamente:
   ```bash
   git add images/
   git commit -m "Add images"
   git push
   ```

### 7. Cache del Browser
Dopo aver caricato le immagini, svuota la cache:
- Chrome: Ctrl+Shift+Delete
- Firefox: Ctrl+Shift+Delete
- Safari: Cmd+Option+E

### 8. Verifica GitHub Pages Settings
1. Vai su Settings → Pages
2. Verifica che Source sia impostato su `main` (o `master`)
3. Verifica che la cartella sia `/ (root)`
4. Attendi qualche minuto per la pubblicazione

