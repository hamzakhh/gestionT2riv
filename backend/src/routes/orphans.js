import express from 'express';
import multer from 'multer';
import { uploadOrphanPhoto as upload } from '../middleware/upload.js';
import { protect, authorize, ROLES } from '../middleware/auth.js';
import {
  getAllOrphans,
  getOrphanById,
  createOrphan,
  updateOrphan,
  deleteOrphan,
  sponsorOrphan,
  getOrphanStats,
} from '../controllers/orphanController.js';

const router = express.Router();

router.use(protect);

// Routes GET
router.get('/', getAllOrphans);
router.get('/stats', getOrphanStats);
router.get('/:id', getOrphanById);

// Routes protégées nécessitant des droits d'administration
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), upload.single('photo'), createOrphan);

router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), upload.single('photo'), updateOrphan);

router.delete('/:id', authorize(ROLES.ADMIN), deleteOrphan);
router.post('/:id/sponsor', authorize(ROLES.ADMIN, ROLES.MANAGER), sponsorOrphan);

// Gestion des erreurs de téléchargement de fichiers
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err) {
    return res.status(500).json({
      success: false,
      message: 'Erreur de serveur interne lors du téléchargement du fichier.',
    });
  }
  next();
});

export default router;
