import express from 'express';
import { getAllUsers, createUser, getUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../controllers/authController.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Protéger toutes les routes après ce middleware (nécessite d'être connecté)
router.use(protect);

// Restreindre l'accès aux administrateurs uniquement
router.use(restrictTo(ROLES.ADMIN));

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router;
