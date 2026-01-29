import express from 'express';
import {
  getAllZakat,
  getZakatById,
  createZakat,
  updateZakat,
  deleteZakat,
  distributeZakat,
  getZakatStats,
  getZakatReport
} from '../controllers/zakatController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques (si nécessaire, sinon utiliser protect)
router.get('/', protect, getAllZakat);
router.get('/stats', protect, getZakatStats);
router.get('/report', protect, authorize('admin', 'user'), getZakatReport);
router.get('/:id', protect, getZakatById);

// Routes protégées (nécessitent une authentification)
router.post('/', protect, authorize('user', 'admin'), createZakat);
router.put('/:id', protect, authorize('user', 'admin'), updateZakat);
router.patch('/:id/distribute', protect, authorize('user', 'admin'), distributeZakat);
router.delete('/:id', protect, authorize('admin'), deleteZakat);

export default router;
