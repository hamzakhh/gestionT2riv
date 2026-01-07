import axios from 'utils/axios';

const authService = {
  // Connexion
  login: async (email, password) => {
    const response = await axios.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return {
      success: response.data.success,
      user: response.data.data.user,
      token: response.data.data.token
    };
  },

  // Inscription
  register: async (userData) => {
    const response = await axios.post('/auth/register', userData);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return {
      success: response.data.success,
      user: response.data.data.user,
      token: response.data.data.token
    };
  },

  // Déconnexion
  logout: async () => {
    try {
      await axios.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Obtenir le profil
  getProfile: async () => {
    const response = await axios.get('/auth/profile');
    return response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (data) => {
    const response = await axios.put('/auth/profile', data);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (currentPassword, newPassword) => {
    const response = await axios.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
