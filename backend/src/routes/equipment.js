import express from 'express';
const router = express.Router();
import { protect, authorize, ROLES } from '../middleware/auth.js';
import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentStats,
  getEquipmentHistory
} from '../controllers/equipmentController.js';

// Toutes les routes nécessitent une authentification
router.use(protect);

// Route pour les équipements disponibles (doit être avant /:id)
router.get('/available', (req, res, next) => {
  // Ajouter le filtre de statut disponible
  req.query.status = 'available';

  // Appeler la méthode getAllEquipment avec le statut disponible
  return getAllEquipment(req, res, next);
});

// Route pour les statistiques
router.get('/stats', getEquipmentStats);

// Route pour obtenir un équipement par Asset ID (doit être avant /:id)
router.get('/asset/:assetId', getEquipmentById);

// Route pour la liste des équipements (avec filtrage optionnel via query params)
router.get('/', getAllEquipment);

// Route pour l'historique d'un équipement (doit être avant /:id)
router.get('/:id/history', (req, res, next) => {
  return getEquipmentHistory(req, res, next);
});

// Route pour un équipement spécifique (doit être après les autres routes GET)
router.get('/:id', getEquipmentById);

// Routes nécessitant des permissions
router.post('/', authorize(ROLES.ADMIN), createEquipment);
router.put('/:id', authorize(ROLES.ADMIN), updateEquipment);
router.delete('/:id', authorize(ROLES.ADMIN), deleteEquipment);

export default router;
