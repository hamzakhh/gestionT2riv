import axios from 'axios';
import { API_URL } from '../config';

const API_ENDPOINT = `${API_URL}/users`;

// Récupérer le token du stockage local
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Configurer les en-têtes d'autorisation
const getConfig = () => ({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

// Récupérer tous les utilisateurs
export const getUsers = async () => {
  try {
    const response = await axios.get(API_ENDPOINT, getConfig());
    // Ensure we have an array and map to ensure consistent data structure
    const users = Array.isArray(response.data.data?.users) 
      ? response.data.data.users 
      : [];
    return users.map(user => ({
      ...user,
      id: user._id, // Ensure we have an 'id' field which is required by DataGrid
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim()
    }));
  } catch (error) {
    throw error;
  }
};

// Récupérer un utilisateur par son ID
export const getUser = async (id) => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/${id}`, getConfig());
    return response.data.data.user;
  } catch (error) {
    throw error;
  }
};

// Créer un nouvel utilisateur
export const createUser = async (userData) => {
  try {
    const response = await axios.post(API_ENDPOINT, userData, getConfig());
    return response.data.data.user;
  } catch (error) {
    throw error;
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (id, userData) => {
  try {
    const response = await axios.patch(
      `${API_ENDPOINT}/${id}`,
      userData,
      getConfig()
    );
    return response.data.data.user;
  } catch (error) {
    throw error;
  }
};

// Supprimer un utilisateur
export const deleteUser = async (id) => {
  try {
    await axios.delete(`${API_ENDPOINT}/${id}`, getConfig());
  } catch (error) {
    throw error;
  }
};
