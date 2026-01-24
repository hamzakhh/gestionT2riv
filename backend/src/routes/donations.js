import express from 'express';
const router = express.Router();
import { protect, authorize, ROLES } from '../middleware/auth.js';
import {
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
  getDonationStats,
  getDonationReport,
} from '../controllers/donationController.js';

router.use(protect);

router.get('/', getAllDonations);
router.get('/stats', getDonationStats);
router.get('/report', getDonationReport);
router.get('/:id', getDonationById);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), createDonation);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), updateDonation);
router.delete('/:id', authorize(ROLES.ADMIN), deleteDonation);

export default router;
