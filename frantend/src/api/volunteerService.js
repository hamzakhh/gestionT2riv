import axios from 'axios';
import { API_BASE_URL } from 'config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Récupérer tous les bénévoles avec pagination
const getVolunteers = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await api.get('/volunteers', {
      params: { page, limit, search },
    });
    
    // Vérifier si la réponse contient directement les données
    if (response.data && response.data.docs) {
      return response.data;
    }
    
    // Vérifier si la réponse est dans data.data
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return { docs: [], total: 0 };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des bénévoles:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Retourner un objet vide en cas d'erreur
    return { docs: [], total: 0 };
  }
};

// Récupérer un bénévole par son ID
const getVolunteerById = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Créer un nouveau bénévole
const createVolunteer = async (volunteerData) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.post(API_URL, volunteerData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error('Réponse du serveur invalide');
  } catch (error) {
    console.error('Erreur lors de la création du bénévole:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Amélioration du message d'erreur
    const errorMessage = error.response?.data?.message || 'Erreur lors de la création du bénévole';
    throw new Error(errorMessage);
  }
};

// Mettre à jour un bénévole
const updateVolunteer = async (id, volunteerData) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.put(`${API_URL}/${id}`, volunteerData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    
    if (response.data && response.data.success) {
      return response.data.data; // Retourne directement les données du bénévole mis à jour
    }
    
    throw new Error('Réponse du serveur invalide');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du bénévole:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du bénévole';
    throw new Error(errorMessage);
  }
};

// Supprimer un bénévole
const deleteVolunteer = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Récupérer les statistiques des bénévoles
const getVolunteerStats = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export default {
  getVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  getVolunteerStats
};
