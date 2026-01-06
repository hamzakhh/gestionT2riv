// Utilitaires pour la communication entre les modules patient et prêt

/**
 * Navigue vers le formulaire de prêt avec un patient pré-sélectionné
 * @param {string} patientId - ID du patient
 * @param {Function} navigate - Fonction de navigation de React Router
 */
export const navigateToLoanForm = (patientId, navigate) => {
  navigate(`/loans/new?patientId=${patientId}`);
};

/**
 * Navigue vers les détails d'un prêt
 * @param {string} loanId - ID du prêt
 * @param {Function} navigate - Fonction de navigation de React Router
 */
export const navigateToLoanDetails = (loanId, navigate) => {
  navigate(`/loans/${loanId}`);
};

/**
 * Navigue vers les détails d'un patient
 * @param {string} patientId - ID du patient
 * @param {Function} navigate - Fonction de navigation de React Router
 */
export const navigateToPatientDetails = (patientId, navigate) => {
  navigate(`/patients/${patientId}`);
};

/**
 * Formate le nom complet d'un patient
 * @param {Object} patient - Objet patient
 * @returns {string} Nom complet formaté
 */
export const formatPatientName = (patient) => {
  if (!patient) return '';
  return `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
};

/**
 * Formate les informations de contact d'un patient
 * @param {Object} patient - Objet patient
 * @returns {string} Informations de contact formatées
 */
export const formatPatientContact = (patient) => {
  if (!patient) return '';
  const parts = [];
  
  if (patient.phone) parts.push(patient.phone);
  if (patient.address) parts.push(patient.address);
  
  return parts.join(' - ');
};

/**
 * Vérifie si un patient a des prêts actifs
 * @param {Object} patient - Objet patient
 * @returns {boolean} True si le patient a des prêts actifs
 */
export const hasActiveLoans = (patient) => {
  return patient && (patient.activeLoans > 0 || patient.borrowedEquipment?.length > 0);
};

/**
 * Obtient le nombre de prêts actifs d'un patient
 * @param {Object} patient - Objet patient
 * @returns {number} Nombre de prêts actifs
 */
export const getActiveLoansCount = (patient) => {
  if (!patient) return 0;
  return patient.activeLoans || patient.borrowedEquipment?.length || 0;
};

/**
 * Formate le statut d'un prêt avec couleur appropriée
 * @param {string} status - Statut du prêt
 * @returns {Object} Objet avec label et couleur
 */
export const formatLoanStatus = (status) => {
  const statusMap = {
    'actif': { label: 'Actif', color: 'primary' },
    'terminé': { label: 'Terminé', color: 'success' },
    'annulé': { label: 'Annulé', color: 'error' },
    'retard': { label: 'En retard', color: 'warning' },
    'completed': { label: 'Terminé', color: 'success' },
    'cancelled': { label: 'Annulé', color: 'error' },
    'active': { label: 'Actif', color: 'primary' }
  };
  
  return statusMap[status] || { label: status, color: 'default' };
};

/**
 * Crée les actions pour un patient dans un tableau
 * @param {Object} patient - Objet patient
 * @param {Object} handlers - Fonctions de gestion
 * @returns {Array} Tableau d'objets d'action
 */
export const createPatientActions = (patient, handlers) => {
  const actions = [];
  
  if (handlers.onViewLoans) {
    actions.push({
      icon: 'Assignment',
      tooltip: 'Voir les prêts',
      color: 'info',
      onClick: () => handlers.onViewLoans(patient)
    });
  }
  
  if (handlers.onCreateLoan) {
    actions.push({
      icon: 'Add',
      tooltip: 'Créer un prêt',
      color: 'success',
      onClick: () => handlers.onCreateLoan(patient)
    });
  }
  
  if (handlers.onEdit) {
    actions.push({
      icon: 'Edit',
      tooltip: 'Modifier',
      color: 'primary',
      onClick: () => handlers.onEdit(patient)
    });
  }
  
  if (handlers.onDelete) {
    actions.push({
      icon: 'Delete',
      tooltip: 'Supprimer',
      color: 'error',
      onClick: () => handlers.onDelete(patient._id)
    });
  }
  
  if (handlers.onExport) {
    actions.push({
      icon: 'PictureAsPdf',
      tooltip: 'Exporter en PDF',
      color: 'secondary',
      onClick: () => handlers.onExport(patient)
    });
  }
  
  return actions;
};

/**
 * Valide si un patient peut être supprimé (pas de prêts actifs)
 * @param {Object} patient - Objet patient
 * @returns {Object} { canDelete: boolean, reason: string }
 */
export const canDeletePatient = (patient) => {
  if (!patient) {
    return { canDelete: false, reason: 'Patient invalide' };
  }
  
  if (hasActiveLoans(patient)) {
    return { 
      canDelete: false, 
      reason: `Ce patient a ${getActiveLoansCount(patient)} prêt(s) actif(s)` 
    };
  }
  
  return { canDelete: true, reason: '' };
};
