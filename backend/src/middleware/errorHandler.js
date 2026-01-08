import logger from '../utils/logger.js';

/**
 * Middleware de gestion des erreurs
 */
const errorHandler = (err, req, res, next) => {
  console.error('💥 Error caught:', err);
  
  let error = { ...err };
  error.message = err.message;

  // Logger l'erreur
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = {
      statusCode: 400,
      message: message,
    };
  }

  // Erreur de duplication Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      statusCode: 400,
      message: `${field} existe déjà`,
    };
  }

  // Erreur de cast Mongoose (ID invalide)
  if (err.name === 'CastError') {
    error = {
      statusCode: 404,
      message: 'Ressource non trouvée',
    };
  }

  // Erreur JWT expirée
  if (err.name === 'TokenExpiredError') {
    error = {
      statusCode: 401,
      message: 'Token expiré',
    };
  }

  // Erreur JWT invalide
  if (err.name === 'JsonWebTokenError') {
    error = {
      statusCode: 401,
      message: 'Token invalide',
    };
  }

  // S'assurer qu'on renvoie toujours du JSON
  const response = {
    success: false,
    message: error.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };
  
  console.log('📤 Error response:', JSON.stringify(response, null, 2));
  
  if (!res.headersSent) {
    res.status(error.statusCode || 500).json(response);
  }
};

/**
 * Middleware pour les routes non trouvées
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  error.statusCode = 404;
  res.status(404);
  next(error);
};

export {
  errorHandler,
  notFound,
};
