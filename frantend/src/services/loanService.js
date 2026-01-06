import axios from 'utils/axios';

const loanService = {
  // Créer un nouveau prêt d'équipement
  createLoan: async (loanData) => {
    const response = await axios.post('/loans', loanData);
    return response.data;
  },

  // Retourner un équipement emprunté
  returnEquipment: async (loanId, returnData) => {
    const response = await axios.put(`/loans/${loanId}/return`, returnData);
    return response.data;
  },

  // Obtenir les détails d'un prêt
  getLoanDetails: async (id) => {
    const response = await axios.get(`/loans/${id}`);
    return response.data;
  },

  // Obtenir la liste des prêts actifs
  getActiveLoans: async (params = {}) => {
    const { page = 1, limit = 10 } = params;
    const response = await axios.get('/loans/active', {
      params: { page, limit }
    });
    return response.data;
  },

  // Annuler un prêt
  cancelLoan: async (id, reason) => {
    const response = await axios.patch(`/loans/${id}/cancel`, { reason });
    return response.data;
  },

  // Obtenir l'historique des prêts
  getLoanHistory: async (params = {}) => {
    const { 
      page = 1, 
      limit = 10, 
      patientId, 
      equipmentId, 
      status,
      startDate,
      endDate
    } = params;
    
    const response = await axios.get('/loans/history', {
      params: { 
        page, 
        limit, 
        patientId, 
        equipmentId, 
        status,
        startDate,
        endDate
      }
    });
    return response.data;
  },

  // Obtenir les statistiques des prêts
  getLoanStats: async () => {
    const response = await axios.get('/loans/stats');
    return response.data;
  },

  // Supprimer un prêt
  deleteLoan: async (id) => {
    const response = await axios.delete(`/loans/${id}`);
    return response.data;
  }
};

export default loanService;
