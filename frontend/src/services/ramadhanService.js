import axios from '../utils/axios.js';

// Helper function to handle rate limiting with exponential backoff
const waitForRetry = async (retryCount) => {
  const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
  return new Promise(resolve => setTimeout(resolve, delay));
};

const makeRequest = async (requestFn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      // If rate limited (429), wait and retry
      if (error.response?.status === 429 && i < retries - 1) {
        console.warn(`Rate limited, retrying in ${Math.min(1000 * Math.pow(2, i), 10000)}ms...`);
        await waitForRetry(i);
        continue;
      }
      // For other errors or final retry, throw the error
      throw error;
    }
  }
};

const ramadhanService = {
  // Obtenir tous les dons Ramadhan
  getAll: async (params = {}) => {
    return await makeRequest(async () => {
      const response = await axios.get('/ramadhan', { params });
      return response.data;
    });
  },

  // Obtenir un don Ramadhan par ID
  getById: async (id) => {
    return await makeRequest(async () => {
      const response = await axios.get(`/ramadhan/${id}`);
      return response.data;
    });
  },

  // Créer un nouveau don Ramadhan
  create: async (data) => {
    return await makeRequest(async () => {
      const response = await axios.post('/ramadhan', data);
      return response.data;
    });
  },

  // Mettre à jour un don Ramadhan
  update: async (id, data) => {
    const response = await axios.put(`/ramadhan/${id}`, data);
    return response.data;
  },

  // Supprimer un don Ramadhan
  delete: async (id) => {
    return await makeRequest(async () => {
      const response = await axios.delete(`/ramadhan/${id}`);
      return response.data;
    });
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

      // Get current user info from localStorage or auth context
      const getCurrentUser = () => {
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            return user._id || user.id;
          }
        } catch (e) {
          console.warn('Could not get user from localStorage');
        }
        return null;
      };

      const currentUserId = getCurrentUser();

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
            // createdBy will be set automatically by the backend middleware
          };

          // Skip migration if no user is authenticated
          if (!currentUserId) {
            errors.push({
              productName: donation.productName,
              error: 'Utilisateur non authentifié - impossible de migrer'
            });
            continue;
          }

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
