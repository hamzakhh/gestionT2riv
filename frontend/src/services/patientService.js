import axios from 'utils/axios';

// Système de cache simple pour améliorer les performances
const cache = {
  data: new Map(),
  timestamps: new Map(),
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes

  set(key, value, ttl = this.DEFAULT_TTL) {
    this.data.set(key, value);
    this.timestamps.set(key, Date.now() + ttl);
  },

  get(key) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() > timestamp) {
      this.delete(key);
      return null;
    }
    return this.data.get(key);
  },

  delete(key) {
    this.data.delete(key);
    this.timestamps.delete(key);
  },

  clear() {
    this.data.clear();
    this.timestamps.clear();
  },

  // Méthode pour invalider les clés qui correspondent à un pattern
  invalidatePattern(pattern) {
    for (const key of this.data.keys()) {
      if (key.includes(pattern)) {
        this.delete(key);
      }
    }
  }
};

// Get all patients with pagination
const getPatients = async (page = 1, limit = 10, search = '') => {
  try {
    // Créer une clé de cache unique basée sur les paramètres
    const cacheKey = `patients_${page}_${limit}_${search}`;
    
    // Vérifier si les données sont en cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const response = await axios.get('/patients', {
      params: { page, limit, search, lean: 'true' }, // Optimisation: lean pour des requêtes plus rapides
    });
    
    let result;
    // Backend format: { success: true, data: [...], count: ..., totalPages: ..., currentPage: ... }
    if (response.data && response.data.success && response.data.data) {
      result = {
        docs: response.data.data,
        total: response.data.count || response.data.data.length,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage
      };
    } else if (response.data && response.data.docs) {
      // Ancien format avec docs
      result = response.data;
    } else if (response.data && response.data.data) {
      // Format: { data: [...] }
      result = { docs: response.data.data, total: response.data.data.length };
    } else {
      result = { docs: [], total: 0 };
    }
    
    // Mettre en cache les résultats (3 minutes pour les données de liste)
    cache.set(cacheKey, result, 3 * 60 * 1000);
    
    return result;
  } catch (error) {
    return { docs: [], total: 0 };
  }
};

// Get a patient by ID
const getPatientById = async (id) => {
  try {
    const response = await axios.get(`/patients/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new patient
const createPatient = async (patientData) => {
  try {
    const response = await axios.post('/patients', patientData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data && response.data.success) {
      // Invalider le cache après création (pattern-based)
      cache.invalidatePattern('patients_');
      return response.data.data;
    }
    
    throw new Error('Invalid server response');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error creating patient';
    throw new Error(errorMessage);
  }
};

// Update a patient
const updatePatient = async (id, patientData) => {
  try {
    const response = await axios.put(`/patients/${id}`, patientData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data && response.data.success) {
      // Invalider le cache après mise à jour (pattern-based)
      cache.invalidatePattern('patients_');
      return response.data.data;
    }
    
    throw new Error('Invalid server response');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error updating patient';
    throw new Error(errorMessage);
  }
};

// Delete a patient
const deletePatient = async (id) => {
  try {
    const response = await axios.delete(`/patients/${id}`);
    // Invalider le cache après suppression (pattern-based)
    cache.invalidatePattern('patients_');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get patient statistics
const getPatientStats = async () => {
  try {
    const response = await axios.get('/patients/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientStats
};
