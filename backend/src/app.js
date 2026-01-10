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

// Importer les routes
import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import orphanRoutes from './routes/orphans.js';
import donorRoutes from './routes/donors.js';
import donationRoutes from './routes/donations.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import userRoutes from './routes/users.js';
import patientRoutes from './routes/patientRoutes.js';
import loanRoutes from './routes/loans.js';

// Initialiser l'application
const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', true);

// Connecter à la base de données
connectDB();

// -----------------------
// Middleware globaux
// -----------------------
const corsOptions = {
  origin: [
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
    'https://gestiont2riv.onrender.com',
    'https://gestiont2riv-tunisian.onrender.com',
    'https://gestiont2riv-frontend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Disposition'],
  optionsSuccessStatus: 204
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
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
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
      orphans: '/api/orphans',
      donors: '/api/donors',
      donations: '/api/donations',
      patients: '/api/patients',
      users: '/api/users',
      loans: '/api/loans',
      volunteers: '/api/volunteers',
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
      orphans: '/api/orphans',
      donors: '/api/donors',
      donations: '/api/donations',
      patients: '/api/patients',
      users: '/api/users',
      loans: '/api/loans',
      volunteers: '/api/volunteers',
    },
  });
});

// Helper pour enregistrer routes
const registerRoutes = (path, router) => {
  app.use(`/api${path}`, router);
};

// Enregistrement des routes
registerRoutes('/auth', authRoutes);
registerRoutes('/users', userRoutes);
registerRoutes('/volunteers', volunteerRoutes);
registerRoutes('/patients', patientRoutes);
registerRoutes('/equipment', equipmentRoutes);
registerRoutes('/orphans', orphanRoutes);
registerRoutes('/donors', donorRoutes);
registerRoutes('/donations', donationRoutes);
registerRoutes('/loans', loanRoutes);

// Compatibilité v1
app.use('/api/v1/volunteers', volunteerRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/patients', patientRoutes);

// Servir les fichiers uploadés
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
}, express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

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
process.on('uncaughtException', (err) => {
  logger.error(`Exception non capturée: ${err.message}`);
  process.exit(1);
});

export default app;
