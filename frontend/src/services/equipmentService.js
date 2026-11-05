import axios from 'utils/axios';

const equipmentService = {
  // Obtenir tous les équipements
  getAll: async (params = {}) => {
    const response = await axios.get('/equipment', { params });
    // S'assurer que les champs de date existent
    if (Array.isArray(response.data)) {
      response.data = response.data.map(item => ({
        ...item,
        exitDate: item.exitDate || null,
        entryDate: item.entryDate || null
      }));
    }
    return response.data;
  },

  // Obtenir un équipement par ID
  getById: async (id) => {
    const response = await axios.get(`/equipment/${id}`);
    return response.data;
  },

  // Obtenir un équipement par Asset ID
  getByAssetId: async (assetId) => {
    const response = await axios.get(`/equipment/asset/${assetId}`);
    return response.data;
  },

  // Créer un équipement
  create: async (data) => {
    // S'assurer que les dates sont au bon format
    const payload = {
      ...data,
      exitDate: data.exitDate || null,
      entryDate: data.entryDate || null
    };
    const response = await axios.post('/equipment', payload);
    return response.data;
  },

  // Mettre à jour un équipement
  update: async (id, data) => {
    try {
      const response = await axios.put(`/equipment/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer un équipement
  delete: async (id) => {
    try {
      const response = await axios.delete(`/equipment/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtenir les statistiques
  getStats: async () => {
    const response = await axios.get('/equipment/stats');
    return response.data;
  },

  // Obtenir tous les équipements disponibles avec limite optionnelle
  getAvailableEquipment: async (limit = 10000) => {
    try {
      // Use the specific /available endpoint which filters by status=available
      const response = await axios.get('/equipment/available', {
        params: {
          limit: limit,
          minimal: 'true'
        }
      });

      // Handle backend response format: { success: true, data: [...], pagination: {...} }
      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          count: response.data.pagination?.totalItems || response.data.data.length
        };
      } else if (Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
          count: response.data.length
        };
      } else {
        return {
          success: true,
          data: [],
          count: 0
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch available equipment',
        data: []
      };
    }
  }
};

export default equipmentService;
