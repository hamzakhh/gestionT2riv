import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { uploadVolunteerPhoto as upload } from '../middleware/upload.js';
import {
  getVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  getVolunteerStats
} from '../controllers/volunteerController.js';

const router = express.Router();

// Routes accessibles par tous les utilisateurs authentifiés
router.get('/', protect, getVolunteers);
router.get('/stats', protect, getVolunteerStats);
router.get('/:id', protect, getVolunteerById);

// Routes protégées (admin uniquement)
router.post('/', protect, authorize('admin'), upload.single('photo'), createVolunteer);

router.put('/:id', protect, authorize('admin'), upload.single('photo'), updateVolunteer);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteVolunteer
);

export default router;
