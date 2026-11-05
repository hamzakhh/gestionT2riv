import {
  createLoan,
  returnLoan,
  cancelLoan,
  getOverdueLoans,
  getLoanStats,
  getLoansByPatient,
  getLoansByEquipment,
  getEquipmentSummary,
  getEquipmentByTypeCategory
} from '../services/loanService.js';
import Loan from '../models/Loan.js';
import Equipment from '../models/Equipment.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * @desc    Obtenir tous les prêts
 * @route   GET /api/loans
 * @access  Private
 */
export const getLoans = async (req, res, next) => {
  try {
    const { page, limit, status, patient, equipment, overdue, search } = req.query;
    const { skip, itemsPerPage } = getPaginationParams(page, limit);

    // Construire le filtre
    const filter = {};
    if (status) filter.status = status;
    if (patient) filter.patient = patient;
    if (equipment) filter.equipment = equipment;
    
    // Filtre overdue
    if (overdue === 'true') {
      filter.status = 'active';
      filter.expectedReturnDate = { $lt: new Date() };
    }

    // Recherche textuelle
    if (search) {
      // TODO: Implémenter la recherche sur patient et equipment
      // Pour l'instant, recherche basique
    }

    const loans = await Loan.find(filter)
      .populate('patient', 'firstName lastName phone')
      .populate('equipment', 'assetId name serialNumber')
      .populate('createdBy', 'firstName lastName')
      .populate('returnedBy', 'firstName lastName')
      .populate('cancelledBy', 'firstName lastName')
      .sort({ loanDate: -1 })
      .skip(skip)
      .limit(itemsPerPage);

    const total = await Loan.countDocuments(filter);

    // Calculer isOverdue pour chaque prêt
    const loansWithOverdue = loans.map(loan => ({
      ...loan.toObject(),
      isOverdue: loan.status === 'active' && new Date() > loan.expectedReturnDate
    }));

    res.status(200).json({
      success: true,
      ...formatPaginatedResponse(loansWithOverdue, page, limit, total),
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des prêts: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Obtenir un prêt par ID
 * @route   GET /api/loans/:id
 * @access  Private
 */
export const getLoanById = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('patient', 'firstName lastName phone address')
      .populate('equipment', 'assetId name serialNumber category type condition')
      .populate('createdBy', 'firstName lastName email')
      .populate('returnedBy', 'firstName lastName email')
      .populate('cancelledBy', 'firstName lastName email');

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Prêt non trouvé',
      });
    }

    // Calculer isOverdue
    const loanData = loan.toObject();
    loanData.isOverdue = loan.status === 'active' && new Date() > loan.expectedReturnDate;

    res.status(200).json({
      success: true,
      data: loanData,
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération du prêt: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Créer un nouveau prêt
 * @route   POST /api/loans
 * @access  Private
 */
export const createLoanController = async (req, res, next) => {
  try {
    const loan = await createLoan(req.body, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Prêt créé avec succès',
      data: loan,
    });
  } catch (error) {
    // Gérer les erreurs métier spécifiques
    const errorMessages = {
      'PATIENT_NOT_FOUND': 'Patient non trouvé',
      'EQUIPMENT_NOT_FOUND': 'Équipement non trouvé',
      'EQUIPMENT_NOT_AVAILABLE': 'Équipement non disponible',
      'EQUIPMENT_IN_MAINTENANCE': 'Équipement en maintenance',
      'EQUIPMENT_LOST': 'Équipement perdu',
      'EQUIPMENT_DECOMMISSIONED': 'Équipement déclassé',
      'EQUIPMENT_ALREADY_LOANED': 'Cet équipement est déjà prêté',
      'INVALID_RETURN_DATE': 'La date de retour doit être postérieure à la date de prêt',
      'INVALID_CONDITION': 'Condition invalide'
    };

    const message = errorMessages[error.message] || error.message;
    const statusCode = error.message === 'EQUIPMENT_ALREADY_LOANED' ? 409 : 400;

    logger.error(`Erreur lors de la création de prêt: ${error.message}`);
    
    return res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
};

/**
 * @desc    Retourner un prêt
 * @route   POST /api/loans/:id/return
 * @access  Private
 */
export const returnLoanController = async (req, res, next) => {
  try {
    const loan = await returnLoan(req.params.id, req.body, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Prêt retourné avec succès',
      data: loan,
    });
  } catch (error) {
    const errorMessages = {
      'LOAN_NOT_FOUND': 'Prêt non trouvé',
      'LOAN_ALREADY_RETURNED': 'Ce prêt a déjà été retourné',
      'LOAN_ALREADY_CANCELLED': 'Ce prêt a déjà été annulé',
      'INVALID_LOAN_STATUS': 'Statut de prêt invalide',
      'INVALID_CONDITION': 'Condition invalide'
    };

    const message = errorMessages[error.message] || error.message;

    logger.error(`Erreur lors du retour de prêt: ${error.message}`);
    
    return res.status(400).json({
      success: false,
      message: message,
    });
  }
};

/**
 * @desc    Annuler un prêt
 * @route   POST /api/loans/:id/cancel
 * @access  Private
 */
export const cancelLoanController = async (req, res, next) => {
  try {
    const loan = await cancelLoan(req.params.id, req.body, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Prêt annulé avec succès',
      data: loan,
    });
  } catch (error) {
    const errorMessages = {
      'LOAN_NOT_FOUND': 'Prêt non trouvé',
      'LOAN_ALREADY_RETURNED': 'Ce prêt a déjà été retourné',
      'LOAN_ALREADY_CANCELLED': 'Ce prêt a déjà été annulé',
      'INVALID_LOAN_STATUS': 'Statut de prêt invalide',
      'CANCELLATION_REASON_REQUIRED': 'La raison d\'annulation est obligatoire'
    };

    const message = errorMessages[error.message] || error.message;

    logger.error(`Erreur lors de l'annulation de prêt: ${error.message}`);
    
    return res.status(400).json({
      success: false,
      message: message,
    });
  }
};

/**
 * @desc    Obtenir les statistiques des prêts
 * @route   GET /api/loans/stats
 * @access  Private
 */
export const getLoanStatsController = async (req, res, next) => {
  try {
    const stats = await getLoanStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Obtenir les prêts en retard
 * @route   GET /api/loans/overdue
 * @access  Private
 */
export const getOverdueLoansController = async (req, res, next) => {
  try {
    const loans = await getOverdueLoans();

    // Calculer isOverdue pour chaque prêt
    const loansWithOverdue = loans.map(loan => ({
      ...loan.toObject(),
      isOverdue: true // Par définition, ce sont des prêts en retard
    }));

    res.status(200).json({
      success: true,
      data: loansWithOverdue,
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des prêts en retard: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Obtenir l'historique des prêts d'un patient
 * @route   GET /api/loans/patient/:patientId
 * @access  Private
 */
export const getLoansByPatientController = async (req, res, next) => {
  try {
    const loans = await getLoansByPatient(req.params.patientId);

    // Calculer isOverdue pour chaque prêt
    const loansWithOverdue = loans.map(loan => ({
      ...loan.toObject(),
      isOverdue: loan.status === 'active' && new Date() > loan.expectedReturnDate
    }));

    res.status(200).json({
      success: true,
      data: loansWithOverdue,
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des prêts du patient: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Obtenir l'historique des prêts d'un équipement
 * @route   GET /api/loans/equipment/:equipmentId
 * @access  Private
 */
export const getLoansByEquipmentController = async (req, res, next) => {
  try {
    const loans = await getLoansByEquipment(req.params.equipmentId);

    // Calculer isOverdue pour chaque prêt
    const loansWithOverdue = loans.map(loan => ({
      ...loan.toObject(),
      isOverdue: loan.status === 'active' && new Date() > loan.expectedReturnDate
    }));

    res.status(200).json({
      success: true,
      data: loansWithOverdue,
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des prêts de l'équipement: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Obtenir le résumé des équipements par type et catégorie
 * @route   GET /api/loans/equipment-summary
 * @access  Private
 */
export const getEquipmentSummaryController = async (req, res, next) => {
  try {
    const summary = await getEquipmentSummary();

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération du résumé des équipements: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Obtenir les équipements d'un type et catégorie spécifiques
 * @route   GET /api/loans/equipment-by-type
 * @access  Private
 */
export const getEquipmentByTypeCategoryController = async (req, res, next) => {
  try {
    const { type, category, filter } = req.query;

    if (!type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Les paramètres type et category sont requis',
      });
    }

    const equipment = await getEquipmentByTypeCategory(type, category, filter);

    res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des équipements par type/catégorie: ${error.message}`);
    next(error);
  }
};
