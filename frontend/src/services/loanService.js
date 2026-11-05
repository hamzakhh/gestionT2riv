import axios from 'utils/axios';

const loanService = {
  // Obtenir tous les prêts
  getAll: async (params = {}) => {
    const response = await axios.get('/loans', { params });
    return response.data;
  },

  // Obtenir un prêt par ID
  getById: async (id) => {
    const response = await axios.get(`/loans/${id}`);
    return response.data;
  },

  // Créer un prêt
  create: async (data) => {
    const response = await axios.post('/loans', data);
    return response.data;
  },

  // Retourner un prêt
  return: async (id, data) => {
    const response = await axios.post(`/loans/${id}/return`, data);
    return response.data;
  },

  // Annuler un prêt
  cancel: async (id, data) => {
    const response = await axios.post(`/loans/${id}/cancel`, data);
    return response.data;
  },

  // Obtenir les statistiques
  getStats: async () => {
    const response = await axios.get('/loans/stats');
    return response.data;
  },

  // Obtenir les prêts en retard
  getOverdue: async () => {
    const response = await axios.get('/loans/overdue');
    return response.data;
  },

  // Obtenir les prêts d'un patient
  getByPatient: async (patientId) => {
    const response = await axios.get(`/loans/patient/${patientId}`);
    return response.data;
  },

  // Obtenir les prêts d'un équipement
  getByEquipment: async (equipmentId) => {
    const response = await axios.get(`/loans/equipment/${equipmentId}`);
    return response.data;
  },

  // Obtenir le résumé des équipements par type et catégorie
  getEquipmentSummary: async () => {
    const response = await axios.get('/loans/equipment-summary');
    return response.data;
  },

  // Obtenir les équipements d'un type et catégorie spécifiques
  getEquipmentByTypeCategory: async (type, category, filter = 'all') => {
    const response = await axios.get('/loans/equipment-by-type', {
      params: { type, category, filter }
    });
    return response.data;
  }
};

export default loanService;
