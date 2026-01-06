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
  ORPHANS: 'orphans',
  DONORS: 'donors',
  VOLUNTEERS: 'volunteers',
  USERS: 'users',
  ROLE_MANAGEMENT: 'role-management',
  ZAKAT: 'zakat',
  DON_RAMADHAN: 'don-ramadhan',
  RAMADHAN: 'ramadhan',
  PATIENTS: 'patients',
  LOANS: 'loans'
};

// ==============================|| EQUIPMENT ||============================== //

export const EQUIPMENT_CONDITION = {
  NEW: 'Neuf',
  GOOD: 'Bon état',
  FAIR: 'État moyen',
  POOR: 'Mauvais état',
  DAMAGED: 'Endommagé',
  UNUSABLE: 'Inutilisable'
};

// ==============================|| API CONFIG ||============================== //

const rawApiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const normalizedApiBaseUrl = rawApiBaseUrl.trim().replace(/\/+$/, '');
export const API_URL = normalizedApiBaseUrl.endsWith('/api') ? normalizedApiBaseUrl : `${normalizedApiBaseUrl}/api`;
// Alias pour la compatibilité avec le code existant
export const API_BASE_URL = API_URL;

// ==============================|| APP CONFIG ||============================== //

const config = {
  fontFamily: `'Public Sans', sans-serif`,
  basename: '/',
  apiUrl: API_URL
};

export default config;
