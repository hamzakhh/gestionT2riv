#!/bin/bash

# Script de déploiement pour Render - Association Management System
# Auteur: hamzakhh
# Email: khilihamza46@gmail.com

echo "🚀 Déploiement du système de gestion d'association sur Render"
echo "=================================================="

# Vérification des prérequis
echo "📋 Vérification des prérequis..."

if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Prérequis vérifiés"

# Configuration des variables
BACKEND_REPO="association-backend"
FRONTEND_REPO="association-frontend"
GITHUB_USER="hamzakhh"

echo ""
echo "📁 Configuration des repositories:"
echo "   Backend: $BACKEND_REPO"
echo "   Frontend: $FRONTEND_REPO"
echo "   GitHub: https://github.com/$GITHUB_USER"

# Instructions pour le déploiement
echo ""
echo "🎯 ÉTAPES DE DÉPLOIEMENT:"
echo "========================"

echo ""
echo "1. CRÉATION DES REPOSITORIES GITHUB:"
echo "   - Allez sur https://github.com"
echo "   - Connectez-vous avec votre compte $GITHUB_USER"
echo "   - Créez deux repositories:"
echo "     • $BACKEND_REPO"
echo "     • $FRONTEND_REPO"
echo "   - Rendez-les publics ou privés selon vos besoins"

echo ""
echo "2. DÉPLOIEMENT DU BACKEND SUR RENDER:"
echo "   - Allez sur https://render.com"
echo "   - Connectez-vous avec votre compte GitHub"
echo "   - Cliquez sur 'New +' → 'Web Service'"
echo "   - Sélectionnez le repository $BACKEND_REPO"
echo "   - Configuration:"
echo "     • Name: association-backend"
echo "     • Environment: Node"
echo "     • Root Directory: ./"
echo "     • Build Command: npm install"
echo "     • Start Command: npm start"
echo "     • Instance Type: Free"
echo "   - Ajoutez les variables d'environnement:"
echo "     • NODE_ENV=production"
echo "     • PORT=3001"
echo "     • MONGODB_URI=votre_uri_mongodb_atlas"
echo "     • JWT_SECRET=votre_jwt_secret_securise"
echo "     • JWT_EXPIRE=7d"
echo "     • FRONTEND_URL=https://votre-frontend.onrender.com"

echo ""
echo "3. CONFIGURATION MONGODB ATLAS:"
echo "   - Allez sur https://www.mongodb.com/atlas"
echo "   - Créez un compte gratuit"
echo "   - Créez un cluster gratuit"
echo "   - Dans 'Network Access', ajoutez: 0.0.0.0/0"
echo "   - Dans 'Database Access', créez un utilisateur"
echo "   - Copiez l'URI de connexion"
echo "   - Ajoutez l'URI dans les variables Render"

echo ""
echo "4. DÉPLOIEMENT DU FRONTEND SUR RENDER:"
echo "   - Sur Render, cliquez sur 'New +' → 'Static Site'"
echo "   - Sélectionnez le repository $FRONTEND_REPO"
echo "   - Configuration:"
echo "     • Name: association-frontend"
echo "     • Environment: React"
echo "     • Root Directory: ./"
echo "     • Build Command: npm run build"
echo "     • Publish Directory: dist"
echo "     • Instance Type: Free"
echo "   - Ajoutez les variables d'environnement:"
echo "     • VITE_API_URL=https://votre-backend.onrender.com"
echo "     • VITE_APP_NAME=Association Management"
echo "     • VITE_APP_VERSION=1.0.0"

echo ""
echo "5. FINALISATION:"
echo "   - Attendez que les deux services soient déployés"
echo "   - Testez l'application complète"
echo "   - Configurez le domaine personnalisé si nécessaire"

echo ""
echo "📊 URLS DE DÉPLOIEMENT:"
echo "======================"
echo "Backend: https://association-backend.onrender.com"
echo "Frontend: https://association-frontend.onrender.com"

echo ""
echo "🔧 COMMANDES UTILES:"
echo "==================="
echo "Vérifier le statut des services:"
echo "  curl https://association-backend.onrender.com/api/health"
echo ""
echo "Logs du backend:"
echo "  Via le dashboard Render → Logs"
echo ""
echo "Redéploiement automatique:"
echo "  Push sur GitHub → Redéploiement automatique"

echo ""
echo "📞 SUPPORT:"
echo "==========="
echo "Email: khilihamza46@gmail.com"
echo "GitHub: https://github.com/$GITHUB_USER"
echo "Documentation: README.md dans chaque repository"

echo ""
echo "✅ Script terminé! Suivez les étapes ci-dessus pour déployer votre application."
