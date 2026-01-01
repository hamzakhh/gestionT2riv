import { createContext, useContext, useState, useEffect } from 'react';
import authService from 'services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Essayer de récupérer les données fraîches du serveur
          const response = await authService.getProfile();
          setUser(response.data);
          // Mettre à jour localStorage avec les données fraîches
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          // Si la requête échoue, utiliser les données locales
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Si pas de données locales non plus, déconnecter
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
    setUser(response.data.user);
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    setUser(response.data.user);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = async (data) => {
    const response = await authService.updateProfile(data);
    setUser(response.data);
    return response;
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
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
