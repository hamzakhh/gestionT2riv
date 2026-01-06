import axios from 'axios';
import { API_BASE_URL } from 'config';

const API_URL = `${API_BASE_URL}/api/loans`;

// Créer une instance axios avec une configuration de base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get loans with pagination, filtering, and sorting
const getLoans = async ({ page = 1, limit = 10, status = 'all', search = '', sortBy = 'createdAt', sortOrder = 'desc' } = {}) => {
  try {
    const params = {
      page,
      limit,
      status,
      search,
      sortBy,
      sort: sortOrder
    };

    const response = await api.get('', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching loans:', error);
    throw error;
  }
};

// Get active loans (for backward compatibility)
const getActiveLoans = async (page = 1, limit = 10) => {
  return getLoans({ page, limit, status: 'active' });
};

// Créer un nouveau prêt
const createLoan = async (loanData) => {
  try {
    const response = await api.post('/', loanData);
    return response.data;
  } catch (error) {
    console.error('Error creating loan:', error);
    throw error;
  }
};

// Retourner un équipement
const returnEquipment = async (loanId, returnData) => {
  try {
    const response = await api.put(`/${loanId}/return`, returnData);
    return response.data;
  } catch (error) {
    console.error(`Error returning equipment for loan ${loanId}:`, error);
    throw error;
  }
};

// Obtenir les détails d'un prêt
const getLoanDetails = async (loanId) => {
  try {
    const response = await api.get(`/${loanId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching loan details for id ${loanId}:`, error);
    throw error;
  }
};

// Obtenir l'historique des prêts
const getLoanHistory = async (filters = {}) => {
  try {
    const response = await api.get('', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching loan history:', error);
    throw error;
  }
};

// Obtenir les statistiques des prêts
const getLoanStats = async () => {
  try {
    const response = await api.get('/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching loan stats:', error);
    throw error;
  }
};

// Export all service functions
const loanService = {
  getLoans,
  getActiveLoans,
  createLoan,
  returnEquipment,
  getLoanDetails,
  getLoanHistory,
  getLoanStats,
  // Export to CSV
  exportToCSV: async (filters = {}) => {
    try {
      const response = await api.get('/export/csv', { 
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting loans to CSV:', error);
      throw error;
    }
  },
  // Export to PDF
  exportToPDF: async (filters = {}) => {
    try {
      const response = await api.get('/export/pdf', { 
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting loans to PDF:', error);
      throw error;
    }
  },
  // Bulk update status
  bulkUpdateStatus: async (loanIds, status) => {
    try {
      const response = await api.patch('/bulk-update-status', { loanIds, status });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating loan status:', error);
      throw error;
    }
  },
  
  // Cancel a loan
  cancelLoan: async (loanId, reason) => {
    try {
      const response = await api.put(`/${loanId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling loan:', error);
      throw error;
    }
  },
  // Delete a loan (only for completed or cancelled loans)
  deleteLoan: async (loanId) => {
    try {
      const response = await api.delete(`/${loanId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting loan:', error);
      throw error;
    }
  },
};

export default loanService;
