import mongoose from 'mongoose';
import Equipment from '../models/Equipment.js';
import { formatPaginatedResponse, getPaginationParams } from '../utils/helpers.js';
import { EQUIPMENT_STATUS } from '../config/constants.js';
import logger from '../utils/logger.js';

/**
 * @desc    Obtenir tous les équipements
 * @route   GET /api/equipment
 * @access  Private
 */
export const getAllEquipment = async (req, res, next) => {
  try {
    const { page, limit, status, category, search } = req.query;
    const { skip, itemsPerPage } = getPaginationParams(page, limit);

    // Construire le filtre
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Récupérer les équipements
    const equipment = await Equipment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage)
      .populate('createdBy', 'firstName lastName')
      .populate('assignedUserId', 'firstName lastName role');

    const total = await Equipment.countDocuments(filter);

    res.status(200).json({
      success: true,
      ...formatPaginatedResponse(equipment, page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir un équipement par ID
 * @route   GET /api/equipment/:id
 * @access  Private
 */
export const getEquipmentById = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('loanHistory.lentBy', 'firstName lastName')
      .populate('loanHistory.returnedBy', 'firstName lastName')
      .populate('maintenanceHistory.performedBy', 'firstName lastName');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Équipement non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Créer un équipement
 * @route   POST /api/equipment
 * @access  Private (Admin/Manager)
 */
export const createEquipment = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;

    const equipment = await Equipment.create(req.body);

    logger.info(`Équipement créé: ${equipment.name} par ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Équipement créé avec succès',
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mettre à jour un équipement
 * @route   PUT /api/equipment/:id
 * @access  Private (Admin/Manager)
 */
export const updateEquipment = async (req, res, next) => {
  try {
    console.log('=== DÉBUT updateEquipment ===');
    console.log('ID reçu:', req.params.id);
    console.log('Body brut:', req.body);
    console.log('Utilisateur:', req.user);
    
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      console.log('Équipement non trouvé');
      return res.status(404).json({
        success: false,
        message: 'Équipement non trouvé',
      });
    }

    // Ne pas permettre la modification de certains champs via cette route
    delete req.body.loanHistory;
    delete req.body.maintenanceHistory;
    delete req.body.currentBorrower;

    // Nettoyer les données
    const cleanBody = { ...req.body };
    
    // Gérer assignedUserId vide
    if (cleanBody.assignedUserId === '' || cleanBody.assignedUserId === null || cleanBody.assignedUserId === undefined) {
      cleanBody.assignedUserId = null;
    }
    
    // Gérer les valeurs de condition invalides - mapper les anciennes valeurs vers les nouvelles
    const conditionMapping = {
      'Mauvais état': 'poor',
      'Très mauvais état': 'poor',
      'Bon état': 'good',
      'Très bon état': 'excellent',
      'État moyen': 'fair',
      'Neuf': 'new',
      'Nouveau': 'new'
    };
    
    if (cleanBody.condition && conditionMapping[cleanBody.condition]) {
      console.log('Mapping condition:', cleanBody.condition, '->', conditionMapping[cleanBody.condition]);
      cleanBody.condition = conditionMapping[cleanBody.condition];
    }

    console.log('Body après nettoyage:', cleanBody);

    // Validation manuelle des champs requis
    const requiredFields = ['name', 'category', 'type', 'serialNumber'];
    const missingFields = requiredFields.filter(field => !cleanBody[field]);
    
    if (missingFields.length > 0) {
      console.error('Champs requis manquants:', missingFields);
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants',
        errors: missingFields.map(field => `Le champ ${field} est requis`)
      });
    }

    // Validation des enums
    const validCategories = ['Médical', 'Bureautique'];
    if (cleanBody.category && !validCategories.includes(cleanBody.category)) {
      console.error('Catégorie invalide:', cleanBody.category);
      return res.status(400).json({
        success: false,
        message: 'Catégorie invalide',
        errors: [`La catégorie doit être l'une de: ${validCategories.join(', ')}`]
      });
    }

    Object.assign(equipment, cleanBody);
    
    // Validation avant sauvegarde
    const validationError = equipment.validateSync();
    if (validationError) {
      console.error('Erreur de validation Mongoose:', validationError);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }
    
    await equipment.save();

    logger.info(`Équipement mis à jour: ${equipment.name} par ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Équipement mis à jour',
      data: equipment,
    });
  } catch (error) {
    console.error('Erreur dans updateEquipment:', error);
    
    // Gérer les erreurs de duplication
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Le champ ${field} existe déjà`,
        errors: [`${field} doit être unique`]
      });
    }
    
    next(error);
  }
};

/**
 * @desc    Supprimer un équipement
 * @route   DELETE /api/equipment/:id
 * @access  Private (Admin)
 */
export const deleteEquipment = async (req, res, next) => {
  try {
    console.log('=== DÉBUT deleteEquipment ===');
    console.log('Headers de la requête:', req.headers);
    console.log('Utilisateur effectuant la suppression:', req.user);
    console.log('ID reçu:', req.params.id);
    
    // Vérifier si l'ID est valide
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('ID invalide:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'ID invalide',
      });
    }
    
    const equipment = await Equipment.findById(req.params.id);
    console.log('Équipement trouvé:', equipment ? 'Oui' : 'Non');

    if (!equipment) {
      console.log('Équipement non trouvé avec l\'ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Équipement non trouvé',
      });
    }

    // Vérifier si l'équipement est prêté
    console.log('Statut de l\'équipement:', equipment.status);
    console.log('Valeur de EQUIPMENT_STATUS.BORROWED:', EQUIPMENT_STATUS.BORROWED);
    
    if (equipment.status === EQUIPMENT_STATUS.BORROWED) {
      console.log('Tentative de suppression d\'un équipement prêté');
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un équipement prêté',
      });
    }

    try {
      console.log('Tentative de suppression...');
      await equipment.deleteOne();
      console.log('Équipement supprimé avec succès');

      logger.info(`Équipement supprimé: ${equipment.name} par ${req.user.email}`);

      return res.status(200).json({
        success: true,
        message: 'Équipement supprimé',
      });
    } catch (deleteError) {
      console.error('Erreur lors de la suppression dans la base de données:', deleteError);
      throw deleteError; // Laisser le gestionnaire d'erreurs global gérer cela
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Prêter un équipement
 * @route   POST /api/equipment/:id/lend
 * @access  Private
 */
export const lendEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Équipement non trouvé',
      });
    }

    if (equipment.status === EQUIPMENT_STATUS.BORROWED) {
      return res.status(400).json({
        success: false,
        message: 'Équipement déjà prêté',
      });
    }

    if (equipment.status !== EQUIPMENT_STATUS.AVAILABLE) {
      return res.status(400).json({
        success: false,
        message: 'Équipement non disponible pour le prêt',
      });
    }

    const { name, phone, address, idCard } = req.body;

    equipment.lend({ name, phone, address, idCard }, req.user._id);
    await equipment.save();

    logger.info(`Équipement prêté: ${equipment.name} à ${name} par ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Équipement prêté avec succès',
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Retourner un équipement
 * @route   POST /api/equipment/:id/return
 * @access  Private
 */
export const returnEquipmentItem = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Équipement non trouvé',
      });
    }

    if (equipment.status !== EQUIPMENT_STATUS.BORROWED) {
      return res.status(400).json({
        success: false,
        message: 'Équipement non prêté',
      });
    }

    const { condition, notes } = req.body;

    equipment.return(condition, notes, req.user._id);
    await equipment.save();

    logger.info(`Équipement retourné: ${equipment.name} par ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Équipement retourné avec succès',
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ajouter une maintenance
 * @route   POST /api/equipment/:id/maintenance
 * @access  Private
 */
export const addMaintenance = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Équipement non trouvé',
      });
    }

    const { date, description, cost } = req.body;

    equipment.maintenanceHistory.push({
      date,
      description,
      cost,
      performedBy: req.user._id,
    });

    equipment.status = EQUIPMENT_STATUS.MAINTENANCE;
    await equipment.save();

    logger.info(`Maintenance ajoutée: ${equipment.name} par ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Maintenance enregistrée',
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir les statistiques des équipements
 * @route   GET /api/equipment/stats
 * @access  Private
 */
export const getEquipmentStats = async (req, res, next) => {
  try {
    const stats = await Equipment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryStats = await Equipment.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Equipment.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        total,
        byStatus: stats,
        byCategory: categoryStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
