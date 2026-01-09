# ⚡ Vérification rapide des logs

## 🚀 Méthode la plus rapide

### 1. Ouvrez deux terminaux

**Terminal 1 - Backend (si pas déjà lancé) :**
```bash
cd backend
npm run dev
```

**Terminal 2 - Surveillance des logs :**
```bash
cd backend
npm run logs:watch
```

### 2. Tentez une connexion

Allez sur votre frontend et tentez de vous connecter avec :
- Email: `admin@creative.dz`
- Password: `admin123`

### 3. Observez les logs

Dans Terminal 2, vous verrez immédiatement :
- ✅ `Tentative de connexion pour: admin@creative.dz`
- Puis l'un de ces messages :
  - ❌ `Tentative de connexion avec email inexistant: admin@creative.dz`
  - ❌ `Mot de passe incorrect pour: admin@creative.dz`
  - ❌ `Tentative de connexion avec compte désactivé: admin@creative.dz`
  - ✅ `Connexion réussie: admin@creative.dz`

## 📋 Commandes disponibles

```bash
# Voir les derniers logs (30 lignes)
npm run logs

# Surveiller les logs en temps réel
npm run logs:watch

# Filtrer uniquement les logs de connexion
npm run logs:auth

# Voir les logs avec un filtre personnalisé
node watch-logs.js --filter=motdepasse
```

## 🔍 Alternative : Console du serveur

Si le serveur backend tourne déjà, les logs s'affichent directement dans la console où vous avez lancé `npm run dev`.

Cherchez les lignes qui commencent par :
- `info: Tentative de connexion pour:`
- `warn: Tentative de connexion avec email inexistant:`
- `warn: Mot de passe incorrect pour:`
- `warn: Tentative de connexion avec compte désactivé:`

## 💡 Astuce

Pour voir uniquement les logs de connexion dans la console du serveur, utilisez un filtre dans votre terminal ou IDE.
