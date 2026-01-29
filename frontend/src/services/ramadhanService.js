import axios from '../utils/axios.js';

const ramadhanService = {
  // Obtenir tous les dons Ramadhan
  getAll: async (params = {}) => {
    const response = await axios.get('/ramadhan', { params });
    return response.data;
  },

  // Obtenir un don Ramadhan par ID
  getById: async (id) => {
    const response = await axios.get(`/ramadhan/${id}`);
    return response.data;
  },

  // Créer un nouveau don Ramadhan
  create: async (data) => {
    const response = await axios.post('/ramadhan', data);
    return response.data;
  },

  // Mettre à jour un don Ramadhan
  update: async (id, data) => {
    const response = await axios.put(`/ramadhan/${id}`, data);
    return response.data;
  },

  // Supprimer un don Ramadhan
  delete: async (id) => {
    const response = await axios.delete(`/ramadhan/${id}`);
    return response.data;
  },

  // Mettre à jour la distribution d'un don
  updateDistribution: async (id, distributionData) => {
    const response = await axios.patch(`/ramadhan/${id}/distribution`, distributionData);
    return response.data;
  },

  // Obtenir les statistiques des dons Ramadhan
  getStats: async (params = {}) => {
    const response = await axios.get('/ramadhan/stats', { params });
    return response.data;
  },

  // Obtenir les totaux par produit
  getProductTotals: async (params = {}) => {
    const response = await axios.get('/ramadhan/products/totals', { params });
    return response.data;
  },

  // Migration des données depuis localStorage
  migrateFromLocalStorage: async () => {
    try {
      const savedDonations = localStorage.getItem('ramadhanDonations');
      if (!savedDonations) {
        return { success: true, message: 'Aucune donnée à migrer', migrated: 0 };
      }

      const donations = JSON.parse(savedDonations);
      let migratedCount = 0;
      let errors = [];

      for (const donation of donations) {
        try {
          // Transformer les données au format attendu par l'API
          const apiData = {
            productName: donation.productName,
            category: donation.category || 'Non catégorisé',
            unitPrice: donation.unitPrice,
            quantity: donation.quantity,
            totalPrice: donation.totalPrice || (donation.unitPrice * donation.quantity),
            destination: donation.destination || 'association',
            distributedQuantity: donation.distributedQuantity || 0,
            assignedToRestaurant: donation.assignedToRestaurant || 0,
            assignedToKouffa: donation.assignedToKouffa || 0,
            donationDate: donation.date ? new Date(donation.date) : new Date(),
            notes: donation.notes || '',
          };

          await ramadhanService.create(apiData);
          migratedCount++;
        } catch (error) {
          errors.push({
            productName: donation.productName,
            error: error.response?.data?.message || error.message
          });
        }
      }

      // Nettoyer localStorage après migration réussie
      if (migratedCount > 0 && errors.length === 0) {
        localStorage.removeItem('ramadhanDonations');
      }

      return {
        success: true,
        message: `Migration terminée: ${migratedCount} dons migrés avec succès`,
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

export default ramadhanService;
