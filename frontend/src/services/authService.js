import axios from 'utils/axios';

const authService = {
  // Connexion
  login: async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      console.log('🔍 Response brute:', response);
      console.log('🔍 Response data:', response.data);
      console.log('🔍 Response status:', response.status);
      
      // Vérifier si la réponse est valide
      if (!response.data || typeof response.data !== 'object') {
        console.error('❌ Réponse invalide du serveur:', response.data);
        throw new Error('Réponse invalide du serveur');
      }
      
      if (response.data.success && response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        console.log('✅ Token et utilisateur sauvegardés');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      throw error;
    }
  },

  // Inscription
  register: async (userData) => {
    const response = await axios.post('/auth/register', userData);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
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
