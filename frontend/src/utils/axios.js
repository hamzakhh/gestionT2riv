import axios from 'axios';
import { API_URL } from 'config';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 Requête avec token:', config.method.toUpperCase(), config.url);
    } else {
      console.log('📤 Requête sans token:', config.method.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Erreur intercepteur requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse:', response.config.method.toUpperCase(), response.config.url, '→', response.status);
    return response;
  },
  (error) => {
    const url = error.config?.url || 'unknown';
    const method = error.config?.method?.toUpperCase() || 'unknown';
    const status = error.response?.status || 'no response';
    
    console.error(`❌ Erreur: ${method} ${url} → ${status}`);
    
    // Gérer spécifiquement les erreurs 429 (rate limit)
    if (error.response?.status === 429) {
      console.warn('🚦 Rate limit atteint - patientez avant de réessayer');
      // Ne pas déconnecter pour les erreurs 429
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      // NE PAS déconnecter si c'est la requête de login elle-même qui échoue
      if (url.includes('/auth/login')) {
        console.log('⚠️  Erreur de login (identifiants incorrects), pas de déconnexion');
        return Promise.reject(error);
      }
      
      // Token expiré ou invalide pour d'autres requêtes
      console.log('🚪 401 Unauthorized → Déconnexion automatique');
      console.log('   URL qui a causé la déconnexion:', url);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Petit délai pour voir les logs avant redirection
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
