import axios from 'utils/axios';

const patientService = {
  // Récupérer tous les patients avec pagination et recherche
  getPatients: async (params = {}) => {
    const { page = 1, limit = 10, search = '', status } = params;
    const response = await axios.get('/patients', {
      params: { page, limit, search, status }
    });
    return response.data;
  },

  // Récupérer un patient par ID
  getPatientById: async (id) => {
    const response = await axios.get(`/patients/${id}`);
    return response.data;
  },

  // Créer un nouveau patient
  createPatient: async (patientData) => {
    const response = await axios.post('/patients', patientData);
    return response.data;
  },

  // Mettre à jour un patient
  updatePatient: async (id, patientData) => {
    const response = await axios.put(`/patients/${id}`, patientData);
    return response.data;
  },

  // Supprimer un patient
  deletePatient: async (id) => {
    const response = await axios.delete(`/patients/${id}`);
    return response.data;
  },

  // Obtenir les statistiques des patients
  getPatientStats: async () => {
    const response = await axios.get('/patients/stats');
    return response.data;
  }
};

export default patientService;
