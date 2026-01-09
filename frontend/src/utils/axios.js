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
    
    if (error.response?.status === 401) {
      // NE PAS déconnecter automatiquement - laisser les composants gérer l'erreur
      console.log('⚠️  401 Unauthorized - Pas de déconnexion automatique');
      console.log('   URL:', url);
      // La déconnexion sera gérée par les composants qui appellent l'API
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
