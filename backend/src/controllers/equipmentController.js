import mongoose from 'mongoose';
import Equipment from '../models/Equipment.js';
import AssetCounter from '../models/AssetCounter.js';
import Loan from '../models/Loan.js';
import User from '../models/User.js';
import { formatPaginatedResponse, getPaginationParams } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * @desc    Obtenir tous les équipements
 * @route   GET /api/equipment
 * @access  Private
 */
export const getAllEquipment = async (req, res, next) => {
  try {
    const { page, limit, status, category, search, lean = true, minimal = false } = req.query;
    const { skip, itemsPerPage } = getPaginationParams(page, limit);

    // Construire le filtre
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { assetId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Projection optimisée pour les réponses rapides (champs uniquement nécessaires pour l'affichage)
    const projection = minimal === 'true' ? {
      _id: 1,
      assetId: 1,
      name: 1,
      category: 1,
      type: 1,
      status: 1,
      condition: 1,
      serialNumber: 1,
      assignedUserId: 1
    } : {};

    // Récupérer les équipements avec optimisations
    let query = Equipment.find(filter, projection)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage);

    // Utiliser lean pour les meilleures performances si demandé
    if (lean === 'true') {
      query = query.lean();
    }

    // Population conditionnelle
    if (minimal !== 'true') {
      query = query
        .populate('createdBy', 'firstName lastName')
        .populate('assignedUserId', 'firstName lastName role');
    }

    const equipment = await query;

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
 * @desc    Obtenir un équipement par ID ou Asset ID
 * @route   GET /api/equipment/:id
 * @route   GET /api/equipment/asset/:assetId
 * @access  Private
 */
export const getEquipmentById = async (req, res, next) => {
  try {
    const identifier = req.params.id || req.params.assetId;

    // Essayer d'abord par _id (ObjectId), puis par assetId
    let equipment;

    // Vérifier si c'est un ObjectId valide
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      equipment = await Equipment.findById(identifier)
        .populate('createdBy', 'firstName lastName')
        .populate('maintenanceHistory.performedBy', 'firstName lastName');
    }

    // Si pas trouvé par ObjectId, essayer par assetId
    if (!equipment) {
      equipment = await Equipment.findOne({ assetId: identifier })
        .populate('createdBy', 'firstName lastName')
        .populate('maintenanceHistory.performedBy', 'firstName lastName');
    }

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

    // Sécurité : ignorer tout assetId envoyé par le frontend
    delete req.body.assetId;

    // Générer un nouvel Asset ID de manière atomique selon la catégorie
    const category = req.body.category || 'Médical';
    const assetId = await Equipment.generateNextAssetId(category);
    req.body.assetId = assetId;

    // Gérer serialNumber - générer automatiquement si vide ou non fourni
    if (!req.body.serialNumber || req.body.serialNumber.trim() === '') {
      req.body.serialNumber = generateSerialNumber(req.body.type);
    } else {
      req.body.serialNumber = req.body.serialNumber.trim();
    }

    // Valider assignedUserId si fourni
    if (req.body.assignedUserId) {
      if (!mongoose.Types.ObjectId.isValid(req.body.assignedUserId)) {
        return res.status(400).json({
          success: false,
          message: 'ID utilisateur invalide',
          errors: ['assignedUserId doit être un ObjectId valide']
        });
      }

      const userExists = await User.findById(req.body.assignedUserId);
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: 'L\'utilisateur sélectionné n\'existe pas',
          errors: ['assignedUserId: utilisateur non trouvé']
        });
      }
    }

    const equipment = await Equipment.create(req.body);

    logger.info(`Équipement créé: ${equipment.assetId} - ${equipment.name} par ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Équipement créé avec succès',
      data: equipment,
    });
  } catch (error) {
    // Gérer les erreurs de duplication (code 11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      logger.error(`Erreur de duplication lors de la création d'équipement: champ ${field}`);
      return res.status(400).json({
        success: false,
        message: `Le champ ${field} existe déjà`,
        errors: [`${field} doit être unique`]
      });
    }

    logger.error(`Erreur lors de la création d'équipement: ${error.message}`);
    next(error);
  }
};

// Fonction pour générer un numéro de série automatique
// Format: 5 premiers caractères du type + tiret + nombre aléatoire (ex: CHAISE ROULANTE → CHAIR-12345)
const generateSerialNumber = (type) => {
  if (!type) {
    return `SER-${Math.floor(Math.random() * 90000) + 10000}`;
  }
  
  // Prendre les 5 premiers caractères du type, en majuscules, sans espaces
  const prefix = type
    .toUpperCase()
    .replace(/\s/g, '')
    .substring(0, 5);
  
  // Générer un nombre aléatoire entre 10000 et 99999
  const randomNum = Math.floor(Math.random() * 90000) + 10000;
  
  return `${prefix}-${randomNum}`;
};

/**
 * @desc    Mettre à jour un équipement
 * @route   PUT /api/equipment/:id
 * @access  Private (Admin/Manager)
 */
export const updateEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Équipement non trouvé',
      });
    }

    // Ne pas permettre la modification de certains champs via cette route
    delete req.body.maintenanceHistory;
    delete req.body.assetId; // Empêcher la modification de l'Asset ID

    // Nettoyer les données
    const cleanBody = { ...req.body };
    
    // Gérer assignedUserId vide
    if (cleanBody.assignedUserId === '' || cleanBody.assignedUserId === null || cleanBody.assignedUserId === undefined) {
      cleanBody.assignedUserId = null;
    }

    // Valider assignedUserId si fourni
    if (cleanBody.assignedUserId) {
      if (!mongoose.Types.ObjectId.isValid(cleanBody.assignedUserId)) {
        return res.status(400).json({
          success: false,
          message: 'ID utilisateur invalide',
          errors: ['assignedUserId doit être un ObjectId valide']
        });
      }

      const userExists = await User.findById(cleanBody.assignedUserId);
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: 'L\'utilisateur sélectionné n\'existe pas',
          errors: ['assignedUserId: utilisateur non trouvé']
        });
      }
    }
    
    // Gérer les valeurs de condition invalides - mapper les anciennes valeurs vers les nouvelles
    const conditionMapping = {
      'Mauvais état': 'poor',
      'Très mauvais état': 'poor',
      'Bon état': 'good',
      'Très bon état': 'excellent',
      'État moyen': 'fair',
      'Neuf': 'new',
      'Nouveau': 'new',
      'Endommagé': 'poor', // Ancienne valeur DAMAGED → poor
      'Inutilisable': 'unusable'
    };

    if (cleanBody.condition && conditionMapping[cleanBody.condition]) {
      cleanBody.condition = conditionMapping[cleanBody.condition];
    }

    // Gérer serialNumber optionnel
    if (cleanBody.serialNumber !== undefined && cleanBody.serialNumber !== null) {
      cleanBody.serialNumber = cleanBody.serialNumber.trim();
      if (cleanBody.serialNumber === '') {
        cleanBody.serialNumber = null;
      }
    }

    // Validation manuelle des champs requis (serialNumber retiré)
    const requiredFields = ['name', 'category', 'type'];
    const missingFields = requiredFields.filter(field => !cleanBody[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants',
        errors: missingFields.map(field => `Le champ ${field} est requis`)
      });
    }

    // Validation des enums
    const validCategories = ['Médical', 'Bureautique'];
    if (cleanBody.category && !validCategories.includes(cleanBody.category)) {
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
    // Vérifier si l'ID est valide
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide',
      });
    }

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Équipement non trouvé',
      });
    }

    // Vérifier si l'équipement est associé à un prêt actif
    const activeLoan = await Loan.findOne({
      equipment: equipment._id,
      status: 'active'
    });

    if (activeLoan) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer cet équipement car il est actuellement associé à un prêt actif.',
      });
    }

    try {
      await equipment.deleteOne();

      logger.info(`Équipement supprimé: ${equipment.name} par ${req.user.email}`);

      // Reset sécurisé du compteur si plus aucun équipement de cette catégorie
      const key = equipment.category === 'Bureautique' ? 'bureautique' : 'medical';
      const count = await Equipment.countDocuments({ category: equipment.category });

      if (count === 0) {
        await AssetCounter.findOneAndUpdate(
          { key },
          { $set: { sequence: 0 } }
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Équipement supprimé',
      });
    } catch (deleteError) {
      throw deleteError; // Laisser le gestionnaire d'erreurs global gérer cela
    }
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

/**
 * @desc    Obtenir l'historique complet d'un équipement
 * @route   GET /api/equipment/:id/history
 * @access  Private
 */
export const getEquipmentHistory = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('maintenanceHistory.performedBy', 'firstName lastName email')
      .populate('assignedUserId', 'firstName lastName email role');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Équipement non trouvé',
      });
    }

    // Formatter l'historique pour une meilleure présentation
    const history = {
      equipment: {
        _id: equipment._id,
        assetId: equipment.assetId,
        name: equipment.name,
        category: equipment.category,
        type: equipment.type,
        serialNumber: equipment.serialNumber,
        status: equipment.status,
        condition: equipment.condition,
        entryDate: equipment.entryDate,
        createdAt: equipment.createdAt,
        updatedAt: equipment.updatedAt,
        createdBy: equipment.createdBy,
        assignedUserId: equipment.assignedUserId,
        notes: equipment.notes
      },
      maintenanceHistory: equipment.maintenanceHistory.map(maintenance => ({
        date: maintenance.date,
        description: maintenance.description,
        cost: maintenance.cost,
        performedBy: maintenance.performedBy
      })),
      statistics: {
        totalMaintenance: equipment.maintenanceHistory.length
      }
    };

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
