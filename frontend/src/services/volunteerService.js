import axios from 'axios';
import { API_URL } from 'config';

// Récupérer le token du stockage local
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Configurer les en-têtes d'autorisation
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`,
});

// Récupérer tous les bénévoles
const getVolunteers = (params = {}) => {
  return axios.get(`${API_URL}/volunteers`, { 
    params,
    headers: getAuthHeaders() 
  });
};

// Récupérer un bénévole par ID
const getVolunteer = (id) => {
  return axios.get(`${API_URL}/volunteers/${id}`, { 
    headers: getAuthHeaders() 
  });
};

// Créer un bénévole
const createVolunteer = (data) => {
  const formData = new FormData();
  
  // Ajouter tous les champs au FormData
  Object.keys(data).forEach(key => {
    if (key === 'skills' && Array.isArray(data[key])) {
      formData.append('skills', data[key].join(','));
    } else if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });
  
  return axios.post(`${API_URL}/volunteers`, formData, { 
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Mettre à jour un bénévole
const updateVolunteer = (id, data) => {
  const formData = new FormData();
  
  // Ajouter tous les champs au FormData
  Object.keys(data).forEach(key => {
    if (key === 'skills' && Array.isArray(data[key])) {
      formData.append('skills', data[key].join(','));
    } else if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });
  
  return axios.put(`${API_URL}/volunteers/${id}`, formData, { 
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Supprimer un bénévole
const deleteVolunteer = (id) => {
  return axios.delete(`${API_URL}/volunteers/${id}`, { 
    headers: getAuthHeaders() 
  });
};

// Obtenir les statistiques des bénévoles
const getVolunteerStats = () => {
  return axios.get(`${API_URL}/volunteers/stats`, { 
    headers: getAuthHeaders() 
  });
};

export default {
  getVolunteers,
  getVolunteer,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  getVolunteerStats
};
