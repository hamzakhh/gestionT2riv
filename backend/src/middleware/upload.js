import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { supabase, supabaseBucket, supabaseEnabled } from '../config/supabase.js';

// Configuration de l'upload
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (selon .env)
const ALLOWED_EXTENSIONS = ['jpeg', 'jpg', 'png', 'pdf'];
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

// Storage en mémoire (pour upload vers Supabase)
const storage = multer.memoryStorage();

// Filtre pour accepter les images et les PDF
const fileFilter = (req, file, cb) => {
  const extname = ALLOWED_EXTENSIONS.includes(file.originalname.split('.').pop().toLowerCase());
  const mimetype = ALLOWED_MIMETYPES.includes(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF et images (JPEG, JPG, PNG) sont autorisés'));
  }
};

// Fonction pour uploader un fichier vers Supabase Storage
const uploadToSupabase = async (file, folder, prefix) => {
  if (!supabaseEnabled) {
    throw new Error('Stockage cloud Supabase non configuré. Définissez SUPABASE_URL et SUPABASE_SECRET_KEY.');
  }

  try {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const uniqueSuffix = Date.now() + '-' + uuidv4();
    const fileName = `${prefix}-${uniqueSuffix}.${ext}`;
    const filePath = `${folder}/${fileName}`;

    // Upload vers Supabase
    const { data, error } = await supabase.storage
      .from(supabaseBucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    // Pour un bucket privé, on ne retourne pas d'URL publique
    // Les fichiers seront accessibles via URLs signées uniquement
    return {
      path: filePath,
      fileName: fileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erreur upload Supabase:', error);
    throw error;
  }
};

// Fonction pour supprimer un fichier de Supabase Storage
const deleteFromSupabase = async (path) => {
  if (!supabaseEnabled) {
    console.warn('⚠️  Supabase non configuré, suppression ignorée');
    return;
  }

  try {
    const { error } = await supabase.storage
      .from(supabaseBucket)
      .remove([path]);

    if (error) {
      console.error('Erreur suppression Supabase:', error);
      throw new Error(`Erreur Supabase: ${error.message}`);
    }
  } catch (error) {
    console.error('Erreur suppression fichier:', error);
    throw error;
  }
};

// Fonction pour générer une URL signée temporaire
const getSignedUrl = async (path, expiresIn = 3600) => {
  if (!supabaseEnabled) {
    throw new Error('Stockage cloud Supabase non configuré');
  }

  try {
    const { data, error } = await supabase.storage
      .from(supabaseBucket)
      .createSignedUrl(path, { expiresIn });

    if (error) {
      throw new Error(`Erreur URL signée: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Erreur génération URL signée:', error);
    throw error;
  }
};

// Fonction pour créer un middleware d'upload
const createUploader = (folder, prefix = 'file') => {
  return multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: fileFilter
  });
};

// Export des uploaders pour différents types de fichiers
export const uploadPatientPhotos = createUploader('patients', 'patient');

// Export des fonctions utilitaires Supabase
export { uploadToSupabase, deleteFromSupabase, getSignedUrl, supabaseEnabled };
