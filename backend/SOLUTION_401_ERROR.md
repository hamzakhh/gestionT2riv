# 🔧 Solution pour l'erreur 401 "Identifiants invalides"

## 🔍 Diagnostic

Vous recevez l'erreur **401 Unauthorized** avec le message "Identifiants invalides". Cela signifie que :

✅ La requête atteint bien le serveur  
✅ Le serveur traite la requête  
❌ Mais les identifiants sont incorrects ou l'utilisateur n'existe pas

## 🚀 Solutions rapides

### Solution 1 : Vérifier si l'utilisateur existe

```bash
cd backend
npm run check-user
```

Cela vérifiera si l'utilisateur `admin@creative.dz` existe dans la base de données.

**Avec un email personnalisé :**
```bash
npm run check-user admin@example.com
```

### Solution 2 : Créer un utilisateur admin

Si l'utilisateur n'existe pas, créez-le :

```bash
cd backend
npm run create-admin
```

Cela créera un utilisateur admin avec :
- **Email**: `admin@creative.dz`
- **Username**: `admin`
- **Password**: `admin123`
- **Rôle**: `admin`
- **Actif**: Oui

### Solution 3 : Réinitialiser le mot de passe

Si l'utilisateur existe mais que le mot de passe est incorrect :

```bash
cd backend
npm run reset-password admin@creative.dz nouveauMotDePasse
```

## 📋 Étapes détaillées

### Étape 1 : Vérifier l'utilisateur

```bash
cd backend
npm run check-user
```

**Résultat attendu :**

Si l'utilisateur existe :
```
✅ Utilisateur trouvé :
   Email: admin@creative.dz
   Username: admin
   Rôle: admin
   Actif: ✅ Oui
```

Si l'utilisateur n'existe pas :
```
❌ Aucun utilisateur trouvé avec l'email: admin@creative.dz
💡 Pour créer un utilisateur admin, utilisez :
   node scripts/create-admin.js
```

### Étape 2 : Créer l'utilisateur (si nécessaire)

```bash
npm run create-admin
```

**Résultat attendu :**
```
✅ Utilisateur admin créé avec succès !

📋 Identifiants de connexion :
   Email: admin@creative.dz
   Username: admin
   Mot de passe: admin123
   Rôle: admin
```

### Étape 3 : Tester la connexion

1. Allez sur votre frontend
2. Connectez-vous avec :
   - Email: `admin@creative.dz`
   - Password: `admin123`

## 🔍 Causes possibles

### 1. Utilisateur n'existe pas
**Solution** : Utilisez `npm run create-admin`

### 2. Mot de passe incorrect
**Solution** : Utilisez `npm run reset-password admin@creative.dz nouveauMotDePasse`

### 3. Compte désactivé
**Solution** : Le script `check-user` vous indiquera si le compte est désactivé. Utilisez `create-admin` pour le réactiver.

## 📝 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run check-user [email]` | Vérifier si un utilisateur existe |
| `npm run create-admin` | Créer un utilisateur admin par défaut |
| `npm run reset-password <email> <password>` | Réinitialiser le mot de passe |

## ⚠️ Important

- **Changez le mot de passe** après la première connexion
- Les scripts utilisent les variables d'environnement de votre fichier `.env`
- Assurez-vous que `MONGODB_URI` est correctement configuré

## 🐛 Si les scripts ne fonctionnent pas

1. **Vérifiez la connexion MongoDB** :
   ```bash
   # Vérifiez que MONGODB_URI est défini dans .env
   ```

2. **Vérifiez les logs** :
   ```bash
   npm run logs:watch
   ```

3. **Vérifiez que le serveur peut se connecter** :
   ```bash
   npm run dev
   ```

## 💡 Alternative : Créer via l'API

Si vous préférez créer l'utilisateur via l'API d'inscription :

```bash
POST https://gestiont2riv.onrender.com/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@creative.dz",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin"
}
```
