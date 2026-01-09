# 📋 Guide pour vérifier les logs backend

## 📁 Emplacement des logs

Les logs sont stockés dans le dossier `backend/logs/` :
- **`combined.log`** : Tous les logs (info, warn, error)
- **`error.log`** : Uniquement les erreurs

## 🔍 Méthodes pour consulter les logs

### Méthode 1 : Console du serveur (Recommandé en développement)

Si le serveur backend est en cours d'exécution, les logs s'affichent directement dans la console du terminal où vous avez lancé le serveur.

**Pour voir les logs en temps réel :**
1. Ouvrez un terminal dans le dossier `backend`
2. Lancez le serveur : `npm run dev` ou `npm start`
3. Les logs de connexion apparaîtront directement dans la console

### Méthode 2 : Fichiers de logs

**Windows (PowerShell) :**
```powershell
# Voir les dernières lignes du fichier combined.log
Get-Content backend\logs\combined.log -Tail 50

# Suivre les logs en temps réel (comme tail -f)
Get-Content backend\logs\combined.log -Wait -Tail 20

# Voir uniquement les erreurs
Get-Content backend\logs\error.log -Tail 50
```

**Windows (CMD) :**
```cmd
# Voir les dernières lignes
powershell -Command "Get-Content backend\logs\combined.log -Tail 50"

# Suivre en temps réel
powershell -Command "Get-Content backend\logs\combined.log -Wait -Tail 20"
```

**Linux/Mac :**
```bash
# Voir les dernières lignes
tail -n 50 backend/logs/combined.log

# Suivre les logs en temps réel
tail -f backend/logs/combined.log

# Voir uniquement les erreurs
tail -n 50 backend/logs/error.log
```

### Méthode 3 : Script de surveillance (Recommandé)

Utilisez le script `watch-logs.js` que nous allons créer pour surveiller les logs en temps réel.

## 🔎 Ce qu'il faut chercher dans les logs

Lors d'une tentative de connexion, vous devriez voir l'un de ces messages :

### ✅ Connexion réussie
```
info: Tentative de connexion pour: admin@creative.dz
info: Connexion réussie: admin@creative.dz
```

### ❌ Email inexistant
```
info: Tentative de connexion pour: admin@creative.dz
warn: Tentative de connexion avec email inexistant: admin@creative.dz
```

### ❌ Mot de passe incorrect
```
info: Tentative de connexion pour: admin@creative.dz
warn: Mot de passe incorrect pour: admin@creative.dz
```

### ❌ Compte désactivé
```
info: Tentative de connexion pour: admin@creative.dz
warn: Tentative de connexion avec compte désactivé: admin@creative.dz
```

### ❌ Champs manquants
```
warn: Tentative de connexion sans email ou mot de passe
```

## 📊 Format des logs

Les logs sont au format JSON avec timestamp :
```json
{
  "level": "info",
  "message": "Tentative de connexion pour: admin@creative.dz",
  "timestamp": "2024-01-15 10:30:45",
  "service": "creative-association-api"
}
```

## 🛠️ Commandes utiles

### Filtrer les logs de connexion uniquement
**PowerShell :**
```powershell
Get-Content backend\logs\combined.log | Select-String "connexion" -CaseSensitive
```

**Linux/Mac :**
```bash
grep -i "connexion" backend/logs/combined.log
```

### Voir les logs des 5 dernières minutes
**PowerShell :**
```powershell
Get-Content backend\logs\combined.log | Select-String (Get-Date).AddMinutes(-5).ToString("yyyy-MM-dd HH:mm")
```

## 🚀 Test rapide

Pour tester et voir les logs immédiatement :

1. **Ouvrez deux terminaux :**
   - Terminal 1 : Lancez le serveur backend (`npm run dev`)
   - Terminal 2 : Surveillez les logs (voir méthodes ci-dessus)

2. **Tentez une connexion depuis le frontend**

3. **Observez les logs dans Terminal 2**

Les logs vous indiqueront exactement pourquoi la connexion échoue !
