import axios from '../utils/axios.js';

const zakatService = {
  // Obtenir tous les Zakat
  getAll: async (params = {}) => {
    const response = await axios.get('/zakat', { params });
    return response.data;
  },

  // Obtenir un Zakat par ID
  getById: async (id) => {
    const response = await axios.get(`/zakat/${id}`);
    return response.data;
  },

  // Créer un nouveau Zakat
  create: async (data) => {
    const response = await axios.post('/zakat', data);
    return response.data;
  },

  // Mettre à jour un Zakat
  update: async (id, data) => {
    const response = await axios.put(`/zakat/${id}`, data);
    return response.data;
  },

  // Supprimer un Zakat
  delete: async (id) => {
    const response = await axios.delete(`/zakat/${id}`);
    return response.data;
  },

  // Distribuer un Zakat
  distribute: async (id, distributionData) => {
    const response = await axios.patch(`/zakat/${id}/distribute`, distributionData);
    return response.data;
  },

  // Obtenir les statistiques Zakat
  getStats: async (params = {}) => {
    const response = await axios.get('/zakat/stats', { params });
    return response.data;
  },

  // Obtenir les rapports Zakat
  getReport: async (params = {}) => {
    const response = await axios.get('/zakat/report', { params });
    return response.data;
  },

  // Migration des données depuis localStorage
  migrateFromLocalStorage: async () => {
    try {
      const savedZakat = localStorage.getItem('zakatDonations');
      if (!savedZakat) {
        return { success: true, message: 'Aucune donnée à migrer', migrated: 0 };
      }

      const zakatRecords = JSON.parse(savedZakat);
      let migratedCount = 0;
      let errors = [];

      for (const record of zakatRecords) {
        try {
          // Transformer les données au format attendu par l'API
          const apiData = {
            donorName: record.donorName || 'Anonyme',
            donorPhone: record.donorPhone || '',
            donorEmail: record.donorEmail || '',
            donorAddress: record.donorAddress || '',
            zakatType: record.zakatType || 'zakat_mal',
            amount: record.amount || 0,
            currency: record.currency || 'DZD',
            status: record.status || 'pending',
            paymentMethod: record.paymentMethod || 'cash',
            paymentReference: record.paymentReference || '',
            notes: record.notes || '',
            beneficiaryInfo: record.beneficiaryInfo || {},
          };

          await zakatService.create(apiData);
          migratedCount++;
        } catch (error) {
          errors.push({
            donorName: record.donorName || 'Inconnu',
            error: error.response?.data?.message || error.message
          });
        }
      }

      // Nettoyer localStorage après migration réussie
      if (migratedCount > 0 && errors.length === 0) {
        localStorage.removeItem('zakatDonations');
      }

      return {
        success: true,
        message: `Migration terminée: ${migratedCount} enregistrements migrés avec succès`,
        migrated: migratedCount,
        errors: errors
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la migration',
        error: error.message
      };
    }
  }
};

export default zakatService;
