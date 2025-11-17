# Fix Immagini GitHub Pages

## Problema
Le immagini non appaiono su GitHub Pages anche se i file sono stati caricati.

## Soluzioni da Provare

### 1. Verifica che i file siano stati committati
```bash
git add images/
git commit -m "Add images"
git push
```

### 2. Verifica i nomi dei file (Case-Sensitive)
GitHub è case-sensitive! I nomi devono corrispondere esattamente.

### 3. Problema con spazi nei nomi
I file con spazi (es. " - Copia") potrebbero causare problemi. 
Soluzione: URL-encode gli spazi come %20

### 4. Problema con caratteri speciali
I caratteri come "è" in "aimè" potrebbero causare problemi.
Soluzione: URL-encode i caratteri speciali

### 5. Verifica la struttura
Assicurati che la struttura sia:
```
repository/
├── index.html
├── images/
│   ├── aimè-pecorino - Copia.jpg
│   └── ...
```

### 6. Test diretto
Prova ad aprire direttamente l'URL dell'immagine:
`https://TUO-USERNAME.github.io/NOME-REPO/images/aimè-pecorino%20-%20Copia.jpg`

### 7. Soluzione: Rinominare i file
La soluzione migliore è rinominare i file rimuovendo spazi e caratteri speciali:
- `aimè-pecorino - Copia.jpg` → `aime-pecorino.jpg`
- `le-lase-pinot-grigio - Copia.jpg` → `le-lase-pinot-grigio.jpg`

