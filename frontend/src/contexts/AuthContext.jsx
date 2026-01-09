import { createContext, useContext, useState, useEffect, useRef } from 'react';
import authService from 'services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Éviter les initialisations multiples
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    // Vérifier si l'utilisateur est connecté au chargement
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Essayer de récupérer les données fraîches du serveur
        const response = await authService.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
          // Mettre à jour localStorage avec les données fraîches
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      } catch (error) {
        // Si erreur 429 (rate limit), utiliser les données locales
        if (error.response?.status === 429) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Si pas de données locales non plus, déconnecter
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } else if (error.response?.status === 401 || error.response?.status === 403) {
          // Token invalide ou expiré, nettoyer le localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          // Pour les autres erreurs, utiliser les données locales
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    
    if (response.success && response.data && response.data.user) {
      setUser(response.data.user);
    }
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    if (response.success && response.data && response.data.user) {
      setUser(response.data.user);
    }
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = async (data) => {
    const response = await authService.updateProfile(data);
    if (response.success && response.data) {
      setUser(response.data);
    }
    return response;
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      // If refresh fails, logout user
      logout();
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export default AuthContext;
