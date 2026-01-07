import axios from 'utils/axios';

const donorService = {
  // Récupérer tous les donateurs avec filtrage optionnel
  getAll: async (params = {}) => {
    const response = await axios.get('/donors', { params });
    return response.data;
  },

  // Récupérer un donateur par son ID
  getById: async (id) => {
    const response = await axios.get(`/donors/${id}`);
    return response.data;
  },

  // Créer un nouveau donateur
  create: async (data) => {
    const response = await axios.post('/donors', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  // Mettre à jour un donateur existant
  update: async (id, data) => {
    const response = await axios.put(`/donors/${id}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  // Supprimer un donateur
  delete: async (id) => {
    const response = await axios.delete(`/donors/${id}`);
    return response.data;
  },

  // Récupérer les statistiques des dons
  getStats: async () => {
    const response = await axios.get('/donors/stats');
    return response.data;
  },

  // Récupérer l'historique des dons d'un donateur
  getDonations: async (donorId) => {
    const response = await axios.get(`/donors/${donorId}/donations`);
    return response.data;
  },

  // Ajouter un nouveau don
  addDonation: async (donorId, donationData) => {
    const response = await axios.post(
      `/donors/${donorId}/donations`,
      donationData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }
};

export default donorService;
