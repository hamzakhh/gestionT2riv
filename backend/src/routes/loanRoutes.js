import express from 'express';
const router = express.Router();
import { protect, authorizePage } from '../middleware/auth.js';
import {
  getLoans,
  getLoanById,
  createLoanController,
  returnLoanController,
  cancelLoanController,
  getLoanStatsController,
  getOverdueLoansController,
  getLoansByPatientController,
  getLoansByEquipmentController,
  getEquipmentSummaryController,
  getEquipmentByTypeCategoryController
} from '../controllers/loanController.js';

// Toutes les routes nécessitent authentification + permission loans
router.use(protect);
router.use(authorizePage('loans'));

// Routes spécifiques avant /:id
router.get('/stats', getLoanStatsController);
router.get('/overdue', getOverdueLoansController);
router.get('/patient/:patientId', getLoansByPatientController);
router.get('/equipment/:equipmentId', getLoansByEquipmentController);
router.get('/equipment-summary', getEquipmentSummaryController);
router.get('/equipment-by-type', getEquipmentByTypeCategoryController);

// Routes standard
router.get('/', getLoans);
router.post('/', createLoanController);
router.get('/:id', getLoanById);

// Routes d'action
router.post('/:id/return', returnLoanController);
router.post('/:id/cancel', cancelLoanController);

export default router;
