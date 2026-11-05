 // ==============================|| THEME CONSTANT ||============================== //

export const APP_DEFAULT_PATH = '/dashboard/default';
export const DRAWER_WIDTH = 260;
export const MINI_DRAWER_WIDTH = 60;

// ==============================|| ROLES ||============================== //

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// ==============================|| PAGES ||============================== //

export const PAGES = {
  DASHBOARD: 'dashboard',
  EQUIPMENT: 'equipment',
  USERS: 'users',
  ROLE_MANAGEMENT: 'role-management',
  RAMADHAN: 'ramadhan',
  PATIENTS: 'patients',
  LOANS: 'loans'
};

// ==============================|| EQUIPMENT ||============================== //

export const EQUIPMENT_CONDITION = {
  NEW: 'Neuf',
  EXCELLENT: 'Excellent',
  GOOD: 'Bon état',
  FAIR: 'État moyen',
  POOR: 'Mauvais état',
  UNUSABLE: 'Inutilisable'
};

// ==============================|| API CONFIG ||============================== //

const isDevelopment = import.meta.env.DEV;
const rawApiBaseUrl = import.meta.env.VITE_API_URL;

// En développement, autoriser localhost par défaut
// En production, VITE_API_URL est obligatoire
if (!rawApiBaseUrl) {
  if (isDevelopment) {
    console.warn('⚠️  VITE_API_URL non défini. Utilisation de localhost par défaut en développement.');
  } else {
    throw new Error('VITE_API_URL environment variable is required in production');
  }
}

const normalizedApiBaseUrl = (rawApiBaseUrl || 'http://localhost:5000').trim().replace(/\/+$/, '');
const API_PREFIX = '/api';

// Base API = host + /api (évite les 404 quand le backend est monté sous /api)
export const API_URL = `${normalizedApiBaseUrl}${API_PREFIX}`;
// Alias pour la compatibilité avec le code existant
export const API_BASE_URL = API_URL;

// ==============================|| APP CONFIG ||============================== //

const config = {
  fontFamily: `'Public Sans', sans-serif`,
  basename: '/',
  apiUrl: API_URL
};

export default config;
