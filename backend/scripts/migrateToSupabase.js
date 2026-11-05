import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Patient from '../src/models/Patient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET || 'association-files';
const mongodbUri = process.env.MONGODB_URI;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes. Définissez SUPABASE_URL et SUPABASE_SECRET_KEY.');
  process.exit(1);
}

if (!mongodbUri) {
  console.error('❌ Variable MONGODB_URI manquante. Définissez MONGODB_URI pour mettre à jour MongoDB.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour migrer un fichier local vers Supabase
const migrateFile = async (localPath, supabasePath) => {
  try {
    if (!fs.existsSync(localPath)) {
      console.log(`⚠️  Fichier non trouvé: ${localPath}`);
      return null;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const ext = localPath.split('.').pop().toLowerCase();
    const mimeType = ext === 'pdf' ? 'application/pdf' : `image/${ext}`;
    const stats = fs.statSync(localPath);

    const { data, error } = await supabase.storage
      .from(supabaseBucket)
      .upload(supabasePath, fileBuffer, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      console.error(`❌ Erreur upload ${localPath}:`, error.message);
      return null;
    }

    console.log(`✅ Upload réussi: ${localPath} → ${supabasePath}`);
    return {
      path: supabasePath,
      fileName: path.basename(supabasePath),
      originalName: path.basename(localPath),
      mimeType: mimeType,
      size: stats.size,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`❌ Erreur migration ${localPath}:`, error.message);
    return null;
  }
};

// Fonction principale de migration
const migratePatientFiles = async () => {
  console.log('🚀 Début de la migration des fichiers patients vers Supabase Storage...\n');

  // Connexion à MongoDB
  try {
    await mongoose.connect(mongodbUri);
    console.log('✅ Connecté à MongoDB\n');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }

  const uploadsDir = path.join(__dirname, '../../src/uploads/patients');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('ℹ️  Aucun dossier uploads/patients trouvé. Rien à migrer.');
    await mongoose.disconnect();
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`📁 ${files.length} fichiers trouvés dans uploads/patients\n`);

  let successCount = 0;
  let failCount = 0;
  let patientUpdateCount = 0;

  for (const file of files) {
    const localPath = path.join(uploadsDir, file);
    const supabasePath = `patients/${file}`;
    
    const result = await migrateFile(localPath, supabasePath);
    if (result) {
      successCount++;

      // Chercher les patients qui référencent ce fichier
      const oldPath = `uploads/patients/${file}`;
      const patients = await Patient.find({ files: oldPath });

      if (patients.length > 0) {
        console.log(`📝 Mise à jour de ${patients.length} patient(s) pour le fichier ${file}`);
        
        for (const patient of patients) {
          // Remplacer l'ancien chemin par le nouveau avec métadonnées complètes
          patient.files = patient.files.map(f => {
            if (f === oldPath || (typeof f === 'string' && f.includes(file))) {
              return result;
            }
            return f;
          });
          
          await patient.save();
          patientUpdateCount++;
        }
      }
    } else {
      failCount++;
    }
  }

  console.log(`\n📊 Migration terminée:`);
  console.log(`   ✅ Fichiers uploadés: ${successCount}`);
  console.log(`   ❌ Échecs: ${failCount}`);
  console.log(`   📝 Patients mis à jour: ${patientUpdateCount}`);
  console.log(`\n⚠️  IMPORTANT: Vérifiez que la migration est correcte avant de supprimer les fichiers locaux.`);
  console.log(`   Les fichiers locaux sont conservés dans: ${uploadsDir}`);

  await mongoose.disconnect();
};

// Exécuter la migration
migratePatientFiles()
  .then(() => {
    console.log('\n✅ Migration terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
