import axios from 'utils/axios';

const authService = {
  // Connexion
  login: async (email, password) => {
    try {
      // Validation basique côté client
      if (!email || !password) {
        throw new Error('Veuillez remplir tous les champs');
      }

      const response = await axios.post('/auth/login', { email, password });
      
      if (response.data && response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data;
      } else {
        // Format de réponse inattendu
        const error = new Error(response.data?.message || 'Format de réponse invalide');
        error.response = { data: response.data, status: response.status };
        throw error;
      }
    } catch (error) {
      // Si c'est une erreur axios avec une réponse du serveur
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;
        
        // Messages d'erreur spécifiques selon le code HTTP
        let errorMessage = serverMessage || 'Erreur de connexion';
        
        if (status === 401) {
          errorMessage = serverMessage || 'Email ou mot de passe incorrect';
        } else if (status === 400) {
          errorMessage = serverMessage || 'Données invalides';
        } else if (status === 403) {
          errorMessage = serverMessage || 'Compte désactivé. Contactez l\'administrateur';
        } else if (status === 429) {
          errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.';
        } else if (status >= 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard';
        }
        
        const serverError = new Error(errorMessage);
        serverError.response = error.response;
        serverError.status = status;
        throw serverError;
      }
      // Si c'est une erreur réseau (pas de réponse du serveur)
      if (error.request) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet et que le serveur est accessible.');
      }
      // Autre erreur (validation, etc.)
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
