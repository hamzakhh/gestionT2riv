import axios from 'utils/axios';

const equipmentService = {
  // Obtenir tous les équipements
  getAll: async (params = {}) => {
    console.log('Appel à getAll avec params:', params);
    const response = await axios.get('/equipment', { params });
    console.log('Réponse de getAll:', response.data);
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

  // Créer un équipement
  create: async (data) => {
    console.log('Création équipement avec données:', data);
    // S'assurer que les dates sont au bon format
    const payload = {
      ...data,
      exitDate: data.exitDate || null,
      entryDate: data.entryDate || null
    };
    const response = await axios.post('/equipment', payload);
    console.log('Réponse création:', response.data);
    return response.data;
  },

  // Mettre à jour un équipement
  update: async (id, data) => {
    try {
      console.log(`Mise à jour équipement ${id} avec:`, data);
      const response = await axios.put(`/equipment/${id}`, data);
      console.log('Réponse mise à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur détaillée lors de la mise à jour:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      throw error;
    }
  },

  // Supprimer un équipement
  delete: async (id) => {
    try {
      console.log('Tentative de suppression de l\'équipement ID:', id);
      const response = await axios.delete(`/equipment/${id}`);
      console.log('Réponse de suppression:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur détaillée lors de la suppression:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      throw error;
    }
  },

  // Prêter un équipement
  lend: async (id, borrowerInfo) => {
    const response = await axios.post(`/equipment/${id}/lend`, borrowerInfo);
    return response.data;
  },

  // Retourner un équipement
  return: async (id, returnInfo) => {
    const response = await axios.post(`/equipment/${id}/return`, returnInfo);
    return response.data;
  },

  // Ajouter une maintenance
  addMaintenance: async (id, maintenanceData) => {
    const response = await axios.post(`/equipment/${id}/maintenance`, maintenanceData);
    return response.data;
  },

  // Obtenir les statistiques
  getStats: async () => {
    const response = await axios.get('/equipment/stats');
    return response.data;
  }
};

export default equipmentService;
