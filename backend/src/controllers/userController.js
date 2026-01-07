import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import bcrypt from 'bcryptjs';

// Créer un nouvel utilisateur
export const createUser = catchAsync(async (req, res, next) => {
  const { username, email, password, role, firstName, lastName, phone, pagePermissions } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    return next(new AppError('Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà', 400));
  }

  const user = await User.create({
    username,
    email,
    password,
    role,
    firstName,
    lastName,
    phone,
    pagePermissions
  });

  // Ne pas renvoyer le mot de passe
  user.password = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Obtenir tous les utilisateurs
export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

// Obtenir un utilisateur par son ID
export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Mettre à jour un utilisateur
export const updateUser = catchAsync(async (req, res, next) => {
  const { password, ...updateData } = req.body;
  
  // Si le mot de passe est fourni, on le hache
  if (password) {
    updateData.password = await bcrypt.hash(password, 12);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Supprimer un utilisateur
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
