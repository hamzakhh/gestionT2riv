import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { uploadPatientPhotos } from '../middleware/upload.js';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientStats
} from '../controllers/patientController.js';

const router = express.Router();

// Routes accessibles par tous les utilisateurs authentifiés
router.get('/', protect, getPatients);
router.get('/stats', protect, getPatientStats);
router.get('/:id', protect, getPatientById);

// Routes protégées (admin uniquement pour création, modification, suppression)
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadPatientPhotos.fields([
    { name: 'cinPhoto', maxCount: 1 },
    { name: 'contractPhoto', maxCount: 1 },
    { name: 'notebookPhoto', maxCount: 1 }
  ]),
  createPatient
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  uploadPatientPhotos.fields([
    { name: 'cinPhoto', maxCount: 1 },
    { name: 'contractPhoto', maxCount: 1 },
    { name: 'notebookPhoto', maxCount: 1 }
  ]),
  updatePatient
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deletePatient
);

export default router;
