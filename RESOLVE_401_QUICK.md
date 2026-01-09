# ⚡ Solution rapide pour l'erreur 401

## 🎯 Problème
Vous recevez : `401 Unauthorized - Identifiants invalides`

## ✅ Solution en 3 étapes

### 1️⃣ Vérifier si l'utilisateur existe
```bash
cd backend
npm run check-user
```

### 2️⃣ Créer l'utilisateur admin (si nécessaire)
```bash
npm run create-admin
```

### 3️⃣ Tester la connexion
- Email: `admin@creative.dz`
- Password: `admin123`

## 📋 Commandes complètes

```bash
# Aller dans le dossier backend
cd backend

# Vérifier l'utilisateur
npm run check-user

# Si l'utilisateur n'existe pas, le créer
npm run create-admin

# Si le mot de passe est incorrect, le réinitialiser
npm run reset-password admin@creative.dz admin123
```

## 🔍 Ce que vous verrez

**Si l'utilisateur existe :**
```
✅ Utilisateur trouvé :
   Email: admin@creative.dz
   Actif: ✅ Oui
```

**Si l'utilisateur n'existe pas :**
```
❌ Aucun utilisateur trouvé
💡 Pour créer un utilisateur admin, utilisez :
   npm run create-admin
```

## ⚠️ Important

- Assurez-vous que votre fichier `.env` contient `MONGODB_URI`
- Les scripts se connectent à la même base de données que votre serveur
- Changez le mot de passe après la première connexion !
