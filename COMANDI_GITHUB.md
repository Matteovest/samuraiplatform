# 📋 Comandi GitHub - Copia e Incolla

## Setup Iniziale (Solo la prima volta)

```powershell
# 1. Vai nella cartella del progetto
cd "C:\Users\Matteo\.cursor"

# 2. Aggiungi tutti i file
git add .

# 3. Crea il primo commit
git commit -m "Initial commit - Samurai Platform"

# 4. Rinomina branch in main
git branch -M main

# 5. Collega a GitHub (SOSTITUISCI TUO_USERNAME)
git remote add origin https://github.com/TUO_USERNAME/samurai-platform.git

# 6. Carica il codice
git push -u origin main
```

## Aggiornare il Sito (Dopo ogni modifica)

```powershell
# 1. Aggiungi le modifiche
git add .

# 2. Crea commit con descrizione
git commit -m "Descrizione delle modifiche"

# 3. Carica su GitHub
git push
```

## Verifiche

```powershell
# Stato del repository
git status

# Vedi i commit
git log --oneline

# Vedi i branch
git branch
```

## Se qualcosa va storto

```powershell
# Rimuovi il remote e ricollocalo
git remote remove origin
git remote add origin https://github.com/TUO_USERNAME/samurai-platform.git

# Annulla l'ultimo commit (mantiene le modifiche)
git reset --soft HEAD~1

# Annulla tutte le modifiche non committate
git reset --hard
```

