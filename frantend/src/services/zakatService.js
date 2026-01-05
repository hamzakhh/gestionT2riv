import axios from 'utils/axios';

// Configuration du délai de base et du nombre maximum de tentatives
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 seconde

// Fonction utilitaire pour attendre un certain temps
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fonction pour gérer les tentatives avec délai exponentiel
const fetchWithRetry = async (requestFn, retries = MAX_RETRIES) => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    // Si c'est une erreur 429 (Too Many Requests) et qu'il reste des tentatives
    if (error.response?.status === 429 && retries > 0) {
      // Calcul du délai avec backoff exponentiel
      const delay = BASE_DELAY * Math.pow(2, MAX_RETRIES - retries);
      console.warn(`Rate limited. Tentative ${MAX_RETRIES - retries + 1}/${MAX_RETRIES} dans ${delay}ms...`);
      
      // Attente avant de réessayer
      await wait(delay);
      return fetchWithRetry(requestFn, retries - 1);
    }
    
    // Si ce n'est pas une erreur 429 ou qu'il n'y a plus de tentatives
    throw error;
  }
};

const zakatService = {
  getAll: async (params = {}) => {
    return fetchWithRetry(() => axios.get('/zakat', { 
      params,
      // Ajout d'un timestamp pour éviter le cache du navigateur
      paramsSerializer: params => {
        const searchParams = new URLSearchParams();
        for (const key in params) {
          if (params[key] !== undefined && params[key] !== null) {
            searchParams.append(key, params[key]);
          }
        }
        searchParams.append('_t', Date.now());
        return searchParams.toString();
      }
    }));
  },

  getById: async (id) => {
    return fetchWithRetry(() => axios.get(`/zakat/${id}`));
  },

  create: async (data) => {
    return fetchWithRetry(() => axios.post('/zakat', data));
  },

  update: async (id, data) => {
    return fetchWithRetry(() => axios.put(`/zakat/${id}`, data));
  },

  delete: async (id) => {
    return fetchWithRetry(() => axios.delete(`/zakat/${id}`));
  },

  markAsDistributed: async (id) => {
    return fetchWithRetry(() => axios.post(`/zakat/${id}/distribute`));
  },

  getStats: async (params = {}) => {
    return fetchWithRetry(() => axios.get('/zakat/stats', { 
      params: { ...params, _t: Date.now() } 
    }));
  },

  getReport: async (params = {}) => {
    return fetchWithRetry(() => axios.get('/zakat/report', { 
      params: { ...params, _t: Date.now() } 
    }));
  }
};

export default zakatService;
