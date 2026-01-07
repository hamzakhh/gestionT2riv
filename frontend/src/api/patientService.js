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

// Get all patients with pagination
const getPatients = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await api.get('/patients', {
      params: { page, limit, search },
    });
    
    if (response.data && response.data.docs) {
      return response.data;
    }
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return { docs: [], total: 0 };
    
  } catch (error) {
    console.error('Error fetching patients:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    return { docs: [], total: 0 };
  }
};

// Get a patient by ID
const getPatientById = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/patients/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Create a new patient
const createPatient = async (patientData) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.post(API_URL, patientData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error('Invalid server response');
  } catch (error) {
    console.error('Error creating patient:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    const errorMessage = error.response?.data?.message || 'Error creating patient';
    throw new Error(errorMessage);
  }
};

// Update a patient
const updatePatient = async (id, patientData) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.put(`${API_URL}/${id}`, patientData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error('Invalid server response');
  } catch (error) {
    console.error('Error updating patient:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    const errorMessage = error.response?.data?.message || 'Error updating patient';
    throw new Error(errorMessage);
  }
};

// Delete a patient
const deletePatient = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Get patient statistics
const getPatientStats = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export default {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientStats
};
