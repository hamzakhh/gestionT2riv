// Statuts des équipements
export const EQUIPMENT_STATUS = {
  AVAILABLE: 'available',
  MAINTENANCE: 'maintenance',
  DECOMMISSIONED: 'decommissioned',
  LOST: 'lost'
};

// Conditions des équipements
export const EQUIPMENT_CONDITION = {
  NEW: 'new',
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  UNUSABLE: 'unusable'
};

// Statuts des prêts
export const LOAN_STATUS = {
  ACTIVE: 'active',
  RETURNED: 'returned',
  CANCELLED: 'cancelled'
};

// Rôles utilisateurs
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Pagination
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
