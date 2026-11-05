import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

import connectDB from './config/database.js';
import logger from './utils/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { protect } from './middleware/auth.js';

// Importer les routes
import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import userRoutes from './routes/users.js';
import patientRoutes from './routes/patientRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import fileRoutes from './routes/fileRoutes.js';

// Initialiser l'application
const app = express();

// Route de test pour vérifier le déploiement
app.get('/__ping', (req, res) => {
  res.send('PING OK');
});

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Connecter à la base de données
connectDB();

// -----------------------
// Middleware globaux
// -----------------------
// Configuration CORS dynamique basée sur l'environnement

// Origines autorisées en développement (localhost uniquement)
const developmentOrigins = [
  'http://localhost:5175',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

// Fonction pour construire la liste des origines autorisées
const getAllowedOrigins = () => {
  const origins = [];
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // En développement: autoriser uniquement localhost
  if (isDevelopment) {
    origins.push(...developmentOrigins);
  }

  // En production: autoriser uniquement FRONTEND_URL (configuré dans .env)
  // Localhost n'est PAS autorisé en production pour des raisons de sécurité
  if (!isDevelopment && process.env.FRONTEND_URL) {
    // Vérification supplémentaire: ne pas autoriser localhost en production
    const frontendUrl = process.env.FRONTEND_URL;
    const isLocalhost = frontendUrl.includes('localhost') || 
                       frontendUrl.includes('127.0.0.1');
    
    if (!isLocalhost) {
      origins.push(frontendUrl);
    } else {
      logger.warn('⚠️  FRONTEND_URL contient localhost en production. Ignoré pour des raisons de sécurité.');
    }
  }

  return origins;
};

// Fonction pour valider qu'une origin est une URL valide
const isValidOrigin = (origin) => {
  try {
    const url = new URL(origin);
    // L'origin doit être https en production (sauf localhost en développement)
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    
    if (!isDevelopment && !isLocalhost && url.protocol !== 'https:') {
      return false;
    }
    
    // Pas de path, paramètres ou fragment dans l'origin autorisée
    if (url.pathname !== '/' || url.search !== '' || url.hash !== '') {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// Fonction pour vérifier si une origin est autorisée (comparaison stricte)
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Requêtes sans origin (Postman, mobile, server-to-server)
  
  // Valider que l'origin de la requête est une URL valide
  if (!isValidOrigin(origin)) {
    return false;
  }
  
  const allowedOrigins = getAllowedOrigins();
  
  // Comparaison stricte des origins
  for (const allowedOrigin of allowedOrigins) {
    try {
      const allowedUrl = new URL(allowedOrigin);
      const requestUrl = new URL(origin);
      
      // Comparer les origins (protocol + hostname + port)
      if (allowedUrl.origin === requestUrl.origin) {
        return true;
      }
    } catch (error) {
      // Si l'origin autorisée est invalide, l'ignorer
      continue;
    }
  }
  
  return false;
};

// Configuration CORS avec callback dynamique
const corsOptions = {
  origin: (origin, callback) => {
    // Requêtes sans origin (Postman, mobile apps, server-to-server)
    // Ces requêtes sont autorisées car elles ne sont pas soumises aux restrictions CORS du navigateur
    if (!origin) {
      return callback(null, true);
    }

    // Vérifier si l'origin est autorisée (comparaison stricte)
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin non autorisée'));
    }
  },
  credentials: true, // Nécessaire pour cookies et Authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Disposition'], // Pour les téléchargements de fichiers
  optionsSuccessStatus: 204 // Réponse standard pour les requêtes preflight réussies
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logger HTTP
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// Rate limiting sur toutes les routes API
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
});

// Rate limiting plus permissif pour les routes d'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limite à 20 tentatives de connexion par IP
  message: 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting plus permissif pour les routes Ramadhan (migration)
const ramadhanLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requêtes par minute pour permettre la migration
  message: 'Trop de requêtes Ramadhan. Veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// -----------------------
// Routes
// -----------------------

// Info API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API Association Creative',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      equipment: '/api/equipment',
      patients: '/api/patients',
      users: '/api/users',
      loans: '/api/loans',
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Root route pour Render
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Association Creative - Backend Server',
    version: '1.0.0',
    endpoints: {
      api: '/api',
      health: '/health',
      auth: '/api/auth',
      equipment: '/api/equipment',
      patients: '/api/patients',
      users: '/api/users',
      loans: '/api/loans',
    },
  });
});

// Helper pour enregistrer routes
const registerRoutes = (path, router) => {
  app.use(`/api${path}`, router);
};

// Enregistrement des routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/files', protect, fileRoutes);
registerRoutes('/users', userRoutes);
registerRoutes('/patients', patientRoutes);
registerRoutes('/equipment', equipmentRoutes);
registerRoutes('/loans', loanRoutes);

// Compatibilité v1
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/patients', patientRoutes);

// Note: Les fichiers uploadés sont maintenant stockés dans Supabase Storage
// Les fichiers locaux ne sont plus servis directement en production
// Les fichiers sont accessibles via l'endpoint /api/files/signed-url avec URLs signées temporaires
if (process.env.NODE_ENV !== 'production') {
  // En développement uniquement, servir les fichiers locaux pour compatibilité
  app.use('/uploads', (req, res, next) => {
    // Répondre aux requêtes OPTIONS preflight
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Max-Age', '86400');
      return res.sendStatus(204);
    }
    
    // CORS headers pour les requêtes GET
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'credentialless');
    
    next();
  }, express.static(path.join(__dirname, 'uploads')));
}

// Servir le frontend React en production
if (process.env.NODE_ENV === 'production') {
  // Chemin robuste vers le frontend build (depuis la racine du projet)
  const frontendPath = path.resolve(process.cwd(), '../frontend/dist');

  app.use(express.static(frontendPath));

  // SPA fallback (React Router) - ne capture pas les routes API
  app.get(/^\/(?!api|uploads|__ping|health).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}



// -----------------------
// Middleware erreurs
// -----------------------
app.use(notFound);
app.use(errorHandler);

// -----------------------
// Démarrage serveur
// -----------------------
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║   🚀 API Association Creative                     ║
  ║                                                   ║
  ║   📡 Serveur démarré sur le port ${PORT}             ║
  ║   🌍 Environnement: ${process.env.NODE_ENV || 'development'}          ║
  ║   📝 Logs: logs/combined.log                      ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `);
});

// Gestion erreurs non gérées
process.on('unhandledRejection', (err) => {
  logger.error(`Erreur non gérée: ${err.message}`);
  server.close(() => process.exit(1));
});


export default app;
