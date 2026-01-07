import axios from 'utils/axios';

const orphanService = {
  getAll: async (params = {}) => {
    const response = await axios.get('/api/orphans', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/api/orphans/${id}`);
    return response.data;
  },

  create: async (data) => {
    let config = {};
    // If data is FormData, set the appropriate headers
    if (data instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data'
      };
    } else {
      config.headers = {
        'Content-Type': 'application/json'
      };
    }
    const response = await axios.post('/api/orphans', data, config);
    return response.data;
  },

  update: async (id, data) => {
    let config = {};
    // If data is FormData, set the appropriate headers
    if (data instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data'
      };
    } else {
      config.headers = {
        'Content-Type': 'application/json'
      };
    }
    const response = await axios.put(`/api/orphans/${id}`, data, config);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/api/orphans/${id}`);
    return response.data;
  },

  sponsor: async (id, sponsorData) => {
    const response = await axios.post(`/api/orphans/${id}/sponsor`, sponsorData);
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get('/api/orphans/stats');
    return response.data;
  }
};

export default orphanService;
