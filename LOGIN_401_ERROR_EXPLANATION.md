# Explication de l'erreur 401 lors de la connexion

## 🔍 Résumé de l'erreur

L'erreur **401 Unauthorized** signifie que la requête de connexion atteint bien le serveur backend, mais que l'authentification échoue.

## 📋 Messages d'erreur dans la console

```
Failed to load resource: the server responded with a status of 401 ()
❌ Erreur: POST /auth/login → 401
⚠️  Erreur de login (identifiants incorrects), pas de déconnexion
❌ Erreur de connexion: AxiosError
```

## 🔄 Flux de la requête

1. **Frontend** (`AuthLogin.jsx`) → Appelle `login(email, password)`
2. **AuthContext** → Appelle `authService.login(email, password)`
3. **authService** → Fait `axios.post('/auth/login', { email, password })`
4. **axios.js** → Ajoute le baseURL (`/api`) → `POST /api/auth/login`
5. **Backend** (`authController.js`) → Vérifie les identifiants
6. **Backend** → Retourne **401** si les identifiants sont incorrects

## ❌ Causes possibles du 401

Le backend retourne 401 dans 3 cas (voir `backend/src/controllers/authController.js`):

### 1. Utilisateur introuvable (ligne 138-142)
```javascript
if (!user) {
  return res.status(401).json({
    success: false,
    message: 'Identifiants invalides',
  });
}
```
**Cause**: L'email n'existe pas dans la base de données.

### 2. Mot de passe incorrect (ligne 148-152)
```javascript
if (!isMatch) {
  return res.status(401).json({
    success: false,
    message: 'Identifiants invalides',
  });
}
```
**Cause**: Le mot de passe fourni ne correspond pas au hash stocké en base.

### 3. Compte désactivé (ligne 156-160)
```javascript
if (!user.isActive) {
  return res.status(401).json({
    success: false,
    message: 'Compte désactivé',
  });
}
```
**Cause**: Le compte utilisateur a `isActive: false` dans la base de données.

## ✅ Comportement correct du frontend

Le frontend gère correctement cette erreur :
- **Ne déconnecte pas** l'utilisateur si c'est une erreur de login (ligne 44-46 de `axios.js`)
- Affiche un message d'erreur à l'utilisateur
- Permet de réessayer avec d'autres identifiants

## 🔧 Comment déboguer

### 1. Vérifier les logs backend

Avec les améliorations ajoutées, le backend log maintenant :
- `Tentative de connexion pour: [email]`
- `Tentative de connexion avec email inexistant: [email]`
- `Mot de passe incorrect pour: [email]`
- `Tentative de connexion avec compte désactivé: [email]`

### 2. Vérifier la base de données

Connectez-vous à MongoDB et vérifiez :
```javascript
// Vérifier si l'utilisateur existe
db.users.findOne({ email: "admin@creative.dz" })

// Vérifier si le compte est actif
db.users.findOne({ email: "admin@creative.dz" }, { isActive: 1 })
```

### 3. Créer un utilisateur de test

Si l'utilisateur n'existe pas, créez-en un via l'API d'inscription :

**Option A : Via l'interface web**
- Allez sur la page d'inscription (`/register`)
- Remplissez le formulaire avec :
  - Email: `admin@creative.dz`
  - Password: `admin123`
  - Username: `admin`
  - Prénom: `Admin`
  - Nom: `User`
  - Rôle: `admin` (si disponible dans le formulaire)

**Option B : Via curl ou Postman**
```bash
POST http://localhost:5000/api/auth/register
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

**Option C : Via MongoDB directement**
```javascript
// Dans MongoDB shell ou Compass
use creative-association
db.users.insertOne({
  username: "admin",
  email: "admin@creative.dz",
  password: "$2a$10$...", // Hash bcrypt de "admin123"
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

⚠️ **Note**: Si vous créez l'utilisateur directement en MongoDB, vous devez hasher le mot de passe avec bcrypt. Il est plus simple d'utiliser l'API d'inscription.

### 4. Vérifier les identifiants par défaut

Le formulaire de login pré-remplit :
- Email: `admin@creative.dz`
- Password: `admin123`

Ces identifiants doivent exister dans votre base de données avec le mot de passe correct.

## 🛠️ Améliorations apportées

1. **Backend** : Ajout de logs détaillés pour identifier la cause exacte
2. **Frontend** : Messages d'erreur plus spécifiques selon le type d'erreur

## 📝 Prochaines étapes

1. Vérifiez les logs du backend pour voir la cause exacte
2. Vérifiez que l'utilisateur existe dans la base de données
3. Si nécessaire, créez un nouvel utilisateur via l'API d'inscription
4. Vérifiez que le compte est actif (`isActive: true`)
