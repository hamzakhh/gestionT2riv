import axios from 'axios';
import { API_BASE_URL } from 'config';
//bbbb
const api = axios.create({
  baseURL: API_BASE_URL,
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
  getAvailableEquipment: async (limit = null) => {
    try {
      console.log('Fetching available equipment...');
      const url = limit ? `/equipment/available?limit=${limit}` : '/equipment/available';
      const response = await api.get(url);
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

  // Récupérer tous les équipements (avec pagination)
  getAllEquipment: async (page = 1, limit = 50000) => {
    try {
      console.log(`Fetching all equipment (page ${page}, limit ${limit})...`);
      const response = await api.get('/equipment', { 
        params: { page, limit, all: true } 
      });
      console.log('All equipment response:', response);
      
      // Vérifier si la réponse contient des données
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Gérer différents formats de réponse
      let equipmentData = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        equipmentData = response.data.data;
      } else if (Array.isArray(response.data)) {
        equipmentData = response.data;
      } else if (response.data.docs && Array.isArray(response.data.docs)) {
        equipmentData = response.data.docs;
      }
      
      return {
        success: true,
        data: equipmentData,
        count: equipmentData.length,
        pagination: response.data.pagination || null
      };
    } catch (error) {
      console.error('Error fetching all equipment:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch all equipment',
        data: []
      };
    }
  },

  // Récupérer les détails d'un équipement
  getEquipmentById: async (id) => {
    try {
      const response = await api.get(`/equipment/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching equipment with id ${id}:`, error);
      throw error;
    }
  },

  // Mettre à jour l'état d'un équipement
  updateEquipmentStatus: async (id, statusData) => {
    try {
      const response = await api.patch(`/equipment/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error(`Error updating equipment status for id ${id}:`, error);
      throw error;
    }
  },

  // Ajouter un nouvel équipement
  addEquipment: async (equipmentData) => {
    try {
      const response = await api.post('/equipment', equipmentData);
      return response.data;
    } catch (error) {
      console.error('Error adding equipment:', error);
      throw error;
    }
  },

  // Mettre à jour un équipement existant
  updateEquipment: async (id, equipmentData) => {
    try {
      const response = await api.put(`/equipment/${id}`, equipmentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating equipment with id ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un équipement
  deleteEquipment: async (id) => {
    try {
      const response = await api.delete(`/equipment/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting equipment with id ${id}:`, error);
      throw error;
    }
  },
};

export default equipmentService;
