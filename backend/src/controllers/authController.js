import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

/**
 * Générer un token JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Protéger les routes - vérifie si l'utilisateur est authentifié
export const protect = async (req, res, next) => {
  try {
    // 1) Récupérer le token et vérifier s'il existe
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette ressource.', 401)
      );
    }

    // 2) Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Vérifier si l'utilisateur existe toujours
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('L\'utilisateur associé à ce token n\'existe plus.', 401)
      );
    }

    // 4) Vérifier si l'utilisateur a changé son mot de passe après l'émission du token
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('Le mot de passe a été modifié récemment. Veuillez vous reconnecter.', 401)
      );
    }

    // 5) Accorder l'accès à la route protégée
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Erreur d\'authentification. Veuillez vous reconnecter.', 401));
  }
};

// Restreindre l'accès en fonction des rôles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles est un tableau ['admin', 'manager', etc.]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Vous n\'avez pas la permission d\'effectuer cette action', 403)
      );
    }
    next();
  };
};

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public (ou Admin uniquement selon les besoins)
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName, role, phone } = req.body;

    // Créer l'utilisateur
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
    });

    logger.info(`Nouvel utilisateur créé: ${user.email}`);

    // Générer le token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          pagePermissions: user.pagePermissions,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Connexion d'un utilisateur
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    console.log('🔍 Login endpoint called');
    console.log('📧 Request body:', req.body);
    console.log('🔑 JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis',
      });
    }

    console.log('👤 Looking for user:', email);
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).select('+password');
    console.log('👤 User found:', !!user);

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides',
      });
    }

    console.log('🔐 Comparing password...');
    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    console.log('🔐 Password match:', isMatch);

    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides',
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      console.log('❌ Account inactive');
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé',
      });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = Date.now();
    await user.save();

    logger.info(`Connexion réussie: ${user.email}`);
    console.log('✅ User authenticated successfully');

    console.log('🎟️ Generating token...');
    // Générer le token
    const token = generateToken(user._id);
    console.log('🎟️ Token generated:', !!token);

    const responseData = {
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          pagePermissions: user.pagePermissions,
        },
        token,
      },
    };
    
    console.log('📤 Sending response:', JSON.stringify(responseData, null, 2));
    
    res.status(200).json(responseData);
  } catch (error) {
    console.error('💥 Login error:', error);
    logger.error('Login error:', error);
    
    // S'assurer qu'on renvoie toujours du JSON même en cas d'erreur
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la connexion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } else {
      next(error);
    }
  }
};

/**
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        pagePermissions: user.pagePermissions,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mettre à jour le profil
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    await user.save();

    logger.info(`Profil mis à jour: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        pagePermissions: user.pagePermissions,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Changer le mot de passe
 * @route   POST /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe requis',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect',
      });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    logger.info(`Mot de passe changé: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Mot de passe changé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Déconnexion
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    logger.info(`Déconnexion: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    next(error);
  }
};
