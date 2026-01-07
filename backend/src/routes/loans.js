import express from 'express';
const router = express.Router({ mergeParams: true });
import { 
  createLoan,
  returnEquipment,
  getLoanDetails,
  getActiveLoans,
  cancelLoan,
  getLoanHistory,
  getLoanStats,
  deleteLoan,
  fixActiveLoans
} from '../controllers/loanController.js';
import { protect, authorize } from '../middleware/auth.js';

// Routes protégées - nécessitent une authentification
router.use(protect);

// 1. Définir d'abord toutes les routes spécifiques
// 1.1 Route pour les prêts actifs
router.get('/active', getActiveLoans);

// 1.2 Route pour les statistiques des prêts
router.get('/stats', authorize('admin', 'medical'), getLoanStats);

// 1.3 Route pour l'historique des prêts
router.get('/', getLoanHistory);

// 1.4 Route pour créer un prêt (doit être avant /:id)
router.post('/', authorize('admin', 'medical'), createLoan);

// 1.5 Route pour corriger les activeLoans négatifs (maintenance)
router.post('/fix-active-loans', authorize('admin'), fixActiveLoans);

// 2. Définir ensuite les routes avec paramètres
// 2.1 Route pour retourner un équipement
router.put('/:id/return', authorize('admin', 'medical'), returnEquipment);

// 2.2 Route pour annuler un prêt
router.put('/:id/cancel', authorize('admin', 'medical'), cancelLoan);
//delete pret
router.delete('/:id', authorize('admin', 'medical'), deleteLoan);

// 2.3 Route pour un prêt spécifique (doit être la dernière)
router.route('/:id')
  .get(getLoanDetails);

export default router;
