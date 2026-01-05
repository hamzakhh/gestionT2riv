import axios from 'axios';
import { API_BASE_URL } from 'config';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/equipment`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
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

const equipmentService = {
  // Récupérer la liste des équipements disponibles
  getAvailableEquipment: async () => {
    try {
      console.log('Fetching available equipment...');
      const response = await api.get('/available');
      console.log('Available equipment response:', response);
      
      // Vérifier si la réponse contient des données
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Retourner les données dans un format cohérent
      return {
        success: true,
        data: response.data.data || response.data,
        count: response.data.count || (Array.isArray(response.data.data || response.data) ? (response.data.data || response.data).length : 0)
      };
    } catch (error) {
      console.error('Error fetching available equipment:', error);
      // Retourner un objet d'erreur cohérent
      return {
        success: false,
        error: error.message || 'Failed to fetch available equipment',
        data: []
      };
    }
  },

  // Récupérer les détails d'un équipement
  getEquipmentById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching equipment with id ${id}:`, error);
      throw error;
    }
  },

  // Mettre à jour l'état d'un équipement
  updateEquipmentStatus: async (id, statusData) => {
    try {
      const response = await api.patch(`/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error(`Error updating equipment status for id ${id}:`, error);
      throw error;
    }
  },

  // Ajouter un nouvel équipement
  addEquipment: async (equipmentData) => {
    try {
      const response = await api.post('/', equipmentData);
      return response.data;
    } catch (error) {
      console.error('Error adding equipment:', error);
      throw error;
    }
  },

  // Mettre à jour un équipement existant
  updateEquipment: async (id, equipmentData) => {
    try {
      const response = await api.put(`/${id}`, equipmentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating equipment with id ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un équipement
  deleteEquipment: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting equipment with id ${id}:`, error);
      throw error;
    }
  },
};

export default equipmentService;
