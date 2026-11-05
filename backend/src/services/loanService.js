import mongoose from 'mongoose';
import Loan from '../models/Loan.js';
import Patient from '../models/Patient.js';
import Equipment from '../models/Equipment.js';
import { LOAN_STATUS, EQUIPMENT_STATUS } from '../config/constants.js';
import logger from '../utils/logger.js';

/**
 * Service de gestion des prêts avec transactions MongoDB
 */

/**
 * Créer un nouveau prêt
 * @param {Object} loanData - Données du prêt
 * @param {String} userId - ID de l'utilisateur qui crée le prêt
 * @returns {Promise<Object>} Prêt créé
 */
export const createLoan = async (loanData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { patient, equipment, expectedReturnDate, conditionAtLoan, notes } = loanData;

    // Étape 3: Vérifier Patient
    const patientExists = await Patient.findById(patient).session(session);
    if (!patientExists) {
      throw new Error('PATIENT_NOT_FOUND');
    }

    // Étape 4: Vérifier Equipment
    const equipmentExists = await Equipment.findById(equipment).session(session);
    if (!equipmentExists) {
      throw new Error('EQUIPMENT_NOT_FOUND');
    }

    // Étape 5: Vérifier disponibilité Equipment
    if (equipmentExists.status !== EQUIPMENT_STATUS.AVAILABLE) {
      if (equipmentExists.status === EQUIPMENT_STATUS.MAINTENANCE) {
        throw new Error('EQUIPMENT_IN_MAINTENANCE');
      } else if (equipmentExists.status === EQUIPMENT_STATUS.LOST) {
        throw new Error('EQUIPMENT_LOST');
      } else if (equipmentExists.status === EQUIPMENT_STATUS.DECOMMISSIONED) {
        throw new Error('EQUIPMENT_DECOMMISSIONED');
      } else {
        throw new Error('EQUIPMENT_NOT_AVAILABLE');
      }
    }

    // Étape 6: Vérifier qu'aucun Loan actif n'existe pour cet équipement
    const activeLoan = await Loan.findOne({
      equipment: equipment,
      status: LOAN_STATUS.ACTIVE
    }).session(session);

    if (activeLoan) {
      throw new Error('EQUIPMENT_ALREADY_LOANED');
    }

    // Étape 7: Valider les dates
    const loanDate = new Date();
    const returnDate = new Date(expectedReturnDate);
    if (returnDate <= loanDate) {
      throw new Error('INVALID_RETURN_DATE');
    }

    // Étape 8: Créer le Loan
    const loan = await Loan.create([{
      patient,
      equipment,
      loanDate,
      expectedReturnDate: returnDate,
      conditionAtLoan,
      notes,
      status: LOAN_STATUS.ACTIVE,
      createdBy: userId
    }], { session });

    // Étape 9: Mettre à jour le cache Patient
    await Patient.findByIdAndUpdate(patient, {
      $push: { borrowedEquipment: equipment },
      $inc: { activeLoans: 1 }
    }).session(session);

    // Étape 10: Commit transaction
    await session.commitTransaction();

    logger.info(`Loan créé: ${loan[0]._id} - Equipment ${equipment} pour Patient ${patient} par ${userId}`);

    return loan[0];
  } catch (error) {
    await session.abortTransaction();
    
    // Gérer spécifiquement l'erreur d'index unique (conflit)
    if (error.code === 11000) {
      logger.warn(`Conflit de création de loan - équipement déjà prêté: ${loanData.equipment}`);
      throw new Error('EQUIPMENT_ALREADY_LOANED');
    }
    
    logger.error(`Erreur lors de la création de loan: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Retourner un prêt
 * @param {String} loanId - ID du prêt
 * @param {Object} returnData - Données de retour
 * @param {String} userId - ID de l'utilisateur qui retourne le prêt
 * @returns {Promise<Object>} Prêt retourné
 */
export const returnLoan = async (loanId, returnData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Vérifier que le Loan existe
    const loan = await Loan.findById(loanId).session(session);
    if (!loan) {
      throw new Error('LOAN_NOT_FOUND');
    }

    // Vérifier que le Loan est actif
    if (loan.status !== LOAN_STATUS.ACTIVE) {
      if (loan.status === LOAN_STATUS.RETURNED) {
        throw new Error('LOAN_ALREADY_RETURNED');
      } else if (loan.status === LOAN_STATUS.CANCELLED) {
        throw new Error('LOAN_ALREADY_CANCELLED');
      } else {
        throw new Error('INVALID_LOAN_STATUS');
      }
    }

    const { conditionAtReturn, returnNotes } = returnData;

    // Mettre à jour le Loan
    const updatedLoan = await Loan.findByIdAndUpdate(
      loanId,
      {
        actualReturnDate: new Date(),
        conditionAtReturn,
        returnNotes,
        returnedBy: userId,
        status: LOAN_STATUS.RETURNED
      },
      { session, new: true }
    );

    // Mettre à jour le cache Patient
    await Patient.findByIdAndUpdate(loan.patient, {
      $pull: { borrowedEquipment: loan.equipment },
      $inc: { activeLoans: -1 }
    }, { session });

    await session.commitTransaction();

    logger.info(`Loan retourné: ${loanId} - Equipment ${loan.equipment} par ${userId}`);

    return updatedLoan;
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Erreur lors du retour de loan: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Annuler un prêt
 * @param {String} loanId - ID du prêt
 * @param {Object} cancelData - Données d'annulation
 * @param {String} userId - ID de l'utilisateur qui annule le prêt
 * @returns {Promise<Object>} Prêt annulé
 */
export const cancelLoan = async (loanId, cancelData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Vérifier que le Loan existe
    const loan = await Loan.findById(loanId).session(session);
    if (!loan) {
      throw new Error('LOAN_NOT_FOUND');
    }

    // Vérifier que le Loan est actif
    if (loan.status !== LOAN_STATUS.ACTIVE) {
      if (loan.status === LOAN_STATUS.RETURNED) {
        throw new Error('LOAN_ALREADY_RETURNED');
      } else if (loan.status === LOAN_STATUS.CANCELLED) {
        throw new Error('LOAN_ALREADY_CANCELLED');
      } else {
        throw new Error('INVALID_LOAN_STATUS');
      }
    }

    const { cancellationReason } = cancelData;

    if (!cancellationReason || cancellationReason.trim() === '') {
      throw new Error('CANCELLATION_REASON_REQUIRED');
    }

    // Mettre à jour le Loan
    const updatedLoan = await Loan.findByIdAndUpdate(
      loanId,
      {
        cancelledDate: new Date(),
        cancellationReason,
        cancelledBy: userId,
        status: LOAN_STATUS.CANCELLED
      },
      { session, new: true }
    );

    // Mettre à jour le cache Patient
    await Patient.findByIdAndUpdate(loan.patient, {
      $pull: { borrowedEquipment: loan.equipment },
      $inc: { activeLoans: -1 }
    }, { session });

    await session.commitTransaction();

    logger.info(`Loan annulé: ${loanId} - Equipment ${loan.equipment} par ${userId}`);

    return updatedLoan;
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Erreur lors de l'annulation de loan: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Obtenir les prêts en retard
 * @returns {Promise<Array>} Liste des prêts en retard
 */
export const getOverdueLoans = async () => {
  try {
    const overdueLoans = await Loan.find({
      status: LOAN_STATUS.ACTIVE,
      expectedReturnDate: { $lt: new Date() }
    })
    .populate('patient', 'firstName lastName')
    .populate('equipment', 'assetId name')
    .populate('createdBy', 'firstName lastName')
    .sort({ expectedReturnDate: 1 });

    return overdueLoans;
  } catch (error) {
    logger.error(`Erreur lors de la récupération des prêts en retard: ${error.message}`);
    throw error;
  }
};

/**
 * Obtenir les statistiques des prêts
 * @returns {Promise<Object>} Statistiques
 */
export const getLoanStats = async () => {
  try {
    const total = await Loan.countDocuments();
    const active = await Loan.countDocuments({ status: LOAN_STATUS.ACTIVE });
    const returned = await Loan.countDocuments({ status: LOAN_STATUS.RETURNED });
    const cancelled = await Loan.countDocuments({ status: LOAN_STATUS.CANCELLED });

    // Calculer les prêts en retard
    const overdue = await Loan.countDocuments({
      status: LOAN_STATUS.ACTIVE,
      expectedReturnDate: { $lt: new Date() }
    });

    return {
      total,
      active,
      returned,
      cancelled,
      overdue
    };
  } catch (error) {
    logger.error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    throw error;
  }
};

/**
 * Obtenir l'historique des prêts d'un patient
 * @param {String} patientId - ID du patient
 * @returns {Promise<Array>} Historique des prêts
 */
export const getLoansByPatient = async (patientId) => {
  try {
    const loans = await Loan.find({ patient: patientId })
      .populate('equipment', 'assetId name serialNumber')
      .populate('createdBy', 'firstName lastName')
      .populate('returnedBy', 'firstName lastName')
      .populate('cancelledBy', 'firstName lastName')
      .sort({ loanDate: -1 });

    return loans;
  } catch (error) {
    logger.error(`Erreur lors de la récupération des prêts du patient: ${error.message}`);
    throw error;
  }
};

/**
 * Obtenir l'historique des prêts d'un équipement
 * @param {String} equipmentId - ID de l'équipement
 * @returns {Promise<Array>} Historique des prêts
 */
export const getLoansByEquipment = async (equipmentId) => {
  try {
    const loans = await Loan.find({ equipment: equipmentId })
      .populate('patient', 'firstName lastName phone')
      .populate('createdBy', 'firstName lastName')
      .populate('returnedBy', 'firstName lastName')
      .populate('cancelledBy', 'firstName lastName')
      .sort({ loanDate: -1 });

    return loans;
  } catch (error) {
    logger.error(`Erreur lors de la récupération des prêts de l'équipement: ${error.message}`);
    throw error;
  }
};

/**
 * Obtenir le résumé des équipements par type et catégorie
 * @returns {Promise<Array>} Résumé des équipements
 */
export const getEquipmentSummary = async () => {
  try {
    // Agrégation pour compter les équipements par type et catégorie
    const summary = await Equipment.aggregate([
      {
        $group: {
          _id: {
            type: '$type',
            category: '$category'
          },
          total: { $sum: 1 },
          available: {
            $sum: {
              $cond: [{ $eq: ['$status', 'available'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: {
          '_id.category': 1,
          '_id.type': 1
        }
      }
    ]);

    // Récupérer tous les prêts actifs pour calculer les équipements en cours
    const activeLoans = await Loan.find({ status: LOAN_STATUS.ACTIVE })
      .populate('equipment', '_id type category assetId');

    // Créer un map pour compter les équipements en cours par type/catégorie
    const activeCountMap = new Map();
    activeLoans.forEach(loan => {
      if (loan.equipment) {
        const key = `${loan.equipment.type}|${loan.equipment.category}`;
        activeCountMap.set(key, (activeCountMap.get(key) || 0) + 1);
      }
    });

    // Fusionner les résultats
    const result = summary.map(item => {
      const key = `${item._id.type}|${item._id.category}`;
      const active = activeCountMap.get(key) || 0;

      return {
        type: item._id.type,
        category: item._id.category,
        total: item.total,
        available: item.available,
        active: active
      };
    });

    return result;
  } catch (error) {
    logger.error(`Erreur lors de la récupération du résumé des équipements: ${error.message}`);
    throw error;
  }
};

/**
 * Obtenir les équipements d'un type et catégorie spécifiques
 * @param {String} type - Type d'équipement
 * @param {String} category - Catégorie
 * @param {String} filter - Filtre optionnel ('all', 'available', 'active')
 * @returns {Promise<Array>} Liste des équipements
 */
export const getEquipmentByTypeCategory = async (type, category, filter = 'all') => {
  try {
    const query = { type, category };

    let equipment = await Equipment.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ assetId: 1 });

    if (filter === 'available') {
      equipment = equipment.filter(eq => eq.status === 'available');
    } else if (filter === 'active') {
      // Récupérer les équipements avec des prêts actifs
      const activeLoans = await Loan.find({ status: LOAN_STATUS.ACTIVE })
        .populate('equipment', '_id type category assetId')
        .populate('patient', 'firstName lastName phone');

      const activeEquipmentIds = activeLoans
        .filter(loan => loan.equipment && loan.equipment.type === type && loan.equipment.category === category)
        .map(loan => loan.equipment._id.toString());

      equipment = equipment.filter(eq => activeEquipmentIds.includes(eq._id.toString()));

      // Ajouter les informations de prêt pour chaque équipement
      equipment = equipment.map(eq => {
        const activeLoan = activeLoans.find(loan => 
          loan.equipment && loan.equipment._id.toString() === eq._id.toString()
        );
        return {
          ...eq.toObject(),
          activeLoan: activeLoan ? {
            patient: activeLoan.patient,
            loanDate: activeLoan.loanDate,
            expectedReturnDate: activeLoan.expectedReturnDate
          } : null
        };
      });
    }

    return equipment;
  } catch (error) {
    logger.error(`Erreur lors de la récupération des équipements par type/catégorie: ${error.message}`);
    throw error;
  }
};
