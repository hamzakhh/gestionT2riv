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

const getUsers = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await api.get('/v1/users', { params: { page, limit, search } });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    const response = await api.get(`/v1/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

const createUser = async (userData) => {
  try {
    const response = await api.post('/v1/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/v1/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/v1/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

export default userService;
