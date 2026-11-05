import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import { getSignedUrl } from '../middleware/upload.js';
import Patient from '../models/Patient.js';

// @desc    Obtenir une URL signée temporaire pour un fichier
// @route   GET /api/files/signed-url
// @access  Privé
router.get('/signed-url', protect, async (req, res) => {
  const { path: filePath } = req.query;

  if (!filePath) {
    return res.status(400).json({
      success: false,
      message: 'Le paramètre path est requis'
    });
  }

  try {
    // Vérifier que le fichier appartient à un patient auquel l'utilisateur a accès
    // Pour l'instant, tous les utilisateurs authentifiés peuvent accéder aux fichiers
    // Dans une implémentation plus avancée, vérifier les rôles et permissions
    const patient = await Patient.findOne({ 'files.path': filePath });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé ou accès non autorisé'
      });
    }

    const signedUrl = await getSignedUrl(filePath, 3600); // 1 heure
    
    res.json({
      success: true,
      data: {
        signedUrl,
        expiresIn: 3600,
        path: filePath
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
