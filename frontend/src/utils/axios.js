import axios from 'axios';
import { API_URL } from 'config';

// Log l'URL de l'API au chargement (seulement en développement)
if (import.meta.env.DEV) {
  console.log('🔗 API URL configurée:', API_URL);
}

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
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Pour les erreurs 401 sur les routes de login, ne pas déconnecter automatiquement
    // Laisser les composants gérer l'erreur selon le contexte
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      // Pour les autres routes protégées, nettoyer le token si invalide
      // (mais laisser les composants décider de la déconnexion)
      if (error.response?.data?.message?.includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
