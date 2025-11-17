# 📤 Comandi per Caricare su GitHub

Esegui questi comandi in PowerShell:

```powershell
cd "C:\Users\Matteo\.cursor"

# Aggiungi tutti i file (inclusi le modifiche)
git add .

# Crea il commit
git commit -m "Initial commit - Samurai Platform"

# Assicurati di essere su main
git branch -M main

# Carica su GitHub
git push -u origin main
```

**Se ti chiede login:**
- Username: `Matteovest`
- Password: Personal Access Token da https://github.com/settings/tokens

Dopo il push, il repository sarà popolato e potrai collegarlo a Netlify!

