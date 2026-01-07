import express from 'express';
import { protect, authorize, ROLES } from '../middleware/auth.js';
import {
  getAllDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor,
  getDonorDonations,
  getDonorStats,
} from '../controllers/donorController.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllDonors);
router.get('/stats', getDonorStats);
router.get('/:id', getDonorById);
router.get('/:id/donations', getDonorDonations);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), createDonor);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), updateDonor);
router.delete('/:id', authorize(ROLES.ADMIN), deleteDonor);

export default router;
