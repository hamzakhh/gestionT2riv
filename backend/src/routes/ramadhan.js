import express from 'express';
import {
  getAllRamadhanDonations,
  getRamadhanDonationById,
  createRamadhanDonation,
  updateRamadhanDonation,
  deleteRamadhanDonation,
  getRamadhanStats,
  updateDistribution,
  getProductTotals
} from '../controllers/ramadhanController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques (si nécessaire, sinon utiliser protect)
router.get('/', protect, getAllRamadhanDonations);
router.get('/stats', protect, getRamadhanStats);
router.get('/products/totals', protect, getProductTotals);
router.get('/:id', protect, getRamadhanDonationById);

// Routes protégées (nécessitent une authentification)
router.post('/', protect, authorize('user', 'admin'), createRamadhanDonation);
router.put('/:id', protect, authorize('user', 'admin'), updateRamadhanDonation);
router.patch('/:id/distribution', protect, authorize('user', 'admin'), updateDistribution);
router.delete('/:id', protect, authorize('admin'), deleteRamadhanDonation);

export default router;
