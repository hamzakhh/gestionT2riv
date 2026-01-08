import express from 'express';
const router = express.Router();
import { body } from 'express-validator';
import validate from '../middleware/validator.js';
import { protect } from '../middleware/auth.js';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
} from '../controllers/authController.js';

// Validation des données d'inscription
const registerValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
  validate,
];

// Validation de connexion
const loginValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
  validate,
];

// Routes publiques
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Route de test pour vérifier que le backend répond
router.get('/test', (req, res) => {
  console.log('🧪 Test endpoint appelé à', new Date().toISOString());
  console.log('📧 Headers:', req.headers);
  console.log('🔑 JWT_SECRET exists:', !!process.env.JWT_SECRET);
  
  const testData = {
    success: true,
    message: 'Backend fonctionne correctement',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    jwtSecretExists: !!process.env.JWT_SECRET,
    mongoUriExists: !!process.env.MONGODB_URI
  };
  
  console.log('📤 Test response:', JSON.stringify(testData, null, 2));
  
  res.json(testData);
});

// Route de test POST pour simuler un login
router.post('/test-login', (req, res) => {
  console.log('🧪 Test login endpoint appelé');
  console.log('📧 Request body:', req.body);
  
  const testData = {
    success: true,
    message: 'Test login endpoint fonctionne',
    timestamp: new Date().toISOString(),
    receivedData: req.body
  };
  
  console.log('📤 Test login response:', JSON.stringify(testData, null, 2));
  
  res.json(testData);
});

// Routes protégées
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router;
