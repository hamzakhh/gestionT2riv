// Statuts des prêts
export const LOAN_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

// Statuts des équipements
export const EQUIPMENT_STATUS = {
  AVAILABLE: 'available',
  BORROWED: 'borrowed',
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

// Rôles utilisateurs
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Statuts des orphelins
export const ORPHAN_STATUS = {
  ACTIVE: 'active',
  GRADUATED: 'graduated',
  TRANSFERRED: 'transferred'
};

// Types de donateurs
export const DONOR_TYPE = {
  INDIVIDUAL: 'individual',
  COMPANY: 'company'
};

// Catégories de donations
export const DONATION_CATEGORY = {
  EQUIPMENT: 'equipment',
  ORPHANS: 'orphans',
  ZAKAT: 'zakat',
  RAMADAN: 'ramadan',
  GENERAL: 'general'
};

// Types de paiement
export const PAYMENT_TYPE = {
  CASH: 'cash',
  CHECK: 'check',
  BANK_TRANSFER: 'bank_transfer',
  ONLINE: 'online'
};

// Fréquence de don
export const DONATION_FREQUENCY = {
  ONE_TIME: 'one-time',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUAL: 'annual'
};

// Types de Zakat
export const ZAKAT_TYPE = {
  FITR: 'zakat_fitr',
  MAL: 'zakat_mal',
  RAMADAN: 'ramadan_aid'
};

// Statuts de distribution Zakat
export const ZAKAT_STATUS = {
  PENDING: 'pending',
  DISTRIBUTED: 'distributed',
  CANCELLED: 'cancelled'
};

// Pagination
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
