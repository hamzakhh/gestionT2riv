import axios from 'utils/axios';

const authService = {
  // Connexion
  login: async (email, password) => {
    console.log('🔐 authService.login appelé avec email:', email);
    try {
      console.log('📤 Envoi de la requête POST /auth/login');
      const response = await axios.post('/auth/login', { email, password });
      console.log('✅ Réponse reçue:', response.status, response.data);
      
      if (response.data && response.data.success) {
        console.log('💾 Sauvegarde du token et de l\'utilisateur');
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data;
      } else {
        // Format de réponse inattendu
        console.error('❌ Format de réponse invalide:', response.data);
        const error = new Error(response.data?.message || 'Format de réponse invalide');
        error.response = { data: response.data, status: response.status };
        throw error;
      }
    } catch (error) {
      console.error('❌ Erreur dans authService.login:', error);
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data?.message);
      console.error('   Data:', error.response?.data);
      
      // Si c'est une erreur axios avec une réponse du serveur
      if (error.response) {
        // Propager l'erreur avec les données du serveur
        const serverError = new Error(error.response.data?.message || 'Erreur de connexion');
        serverError.response = error.response;
        serverError.status = error.response.status;
        throw serverError;
      }
      // Si c'est une erreur réseau ou autre
      console.error('❌ Erreur réseau ou autre:', error.message);
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
