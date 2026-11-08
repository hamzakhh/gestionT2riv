import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET || 'association-files';

console.log('🧪 TEST SUPABASE STORAGE');
console.log('======================\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes dans .env');
  console.error('   Vérifiez SUPABASE_URL et SUPABASE_SECRET_KEY');
  process.exit(1);
}

console.log('✅ Variables Supabase trouvées');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Bucket: ${supabaseBucket}\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

// TEST 1: CONNEXION
console.log('📡 TEST 1: CONNEXION SUPABASE');
try {
  const { data, error } = await supabase.storage.getBucket(supabaseBucket);
  
  if (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('   Le bucket existe-t-il dans Supabase Dashboard?');
  } else {
    console.log('✅ Connexion réussie');
    console.log(`   Bucket trouvé: ${data.name}`);
    console.log(`   Type: ${data.public ? 'Public' : 'Privé'}`);
  }
} catch (error) {
  console.error('❌ Erreur de connexion:', error.message);
}

// TEST 2: UPLOAD
console.log('\n📤 TEST 2: UPLOAD FICHIER');
try {
  // Créer un faux fichier image JPEG (valeur pixel noir 1x1)
  const testContent = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1F, 0x28, 0x37, 0x29, 0x2C,
    0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32, 0x3C,
    0x2E, 0x33, 0x34, 0x32, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00,
    0x3F, 0x00, 0x37, 0xFF, 0xD9
  ]);
  const testPath = `test/test-upload-${Date.now()}.jpg`;
  
  const { data, error } = await supabase.storage
    .from(supabaseBucket)
    .upload(testPath, testContent, {
      contentType: 'image/jpeg',
      upsert: true
    });
  
  if (error) {
    console.error('❌ Erreur upload:', error.message);
  } else {
    console.log('✅ Upload réussi');
    console.log(`   Chemin: ${data.path}`);
    
    // TEST 3: TÉLÉCHARGEMENT
    console.log('\n📥 TEST 3: TÉLÉCHARGEMENT FICHIER');
    try {
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from(supabaseBucket)
        .download(testPath);
      
      if (downloadError) {
        console.error('❌ Erreur téléchargement:', downloadError.message);
      } else {
        console.log('✅ Téléchargement réussi');
        console.log(`   Taille: ${downloadData.size} octets`);
        console.log(`   Type: ${downloadData.type}`);
        
        const content = await downloadData.text();
        console.log(`   Contenu: ${content.substring(0, 50)}...`);
      }
    } catch (downloadError) {
      console.error('❌ Erreur téléchargement:', downloadError.message);
    }
    
    // TEST 4: URL SIGNÉE
    console.log('\n🔗 TEST 4: GÉNÉRATION URL SIGNÉE');
    try {
      const { data: signedData, error: signedError } = await supabase.storage
        .from(supabaseBucket)
        .createSignedUrl(testPath, 3600);
      
      if (signedError) {
        console.error('❌ Erreur URL signée:', signedError.message);
      } else {
        console.log('✅ URL signée générée');
        console.log(`   Expiration: 3600 secondes`);
        console.log(`   URL: ${signedData.signedUrl.substring(0, 80)}...`);
      }
    } catch (signedError) {
      console.error('❌ Erreur URL signée:', signedError.message);
    }
    
    // Nettoyage
    console.log('\n🧹 NETTOYAGE');
    const { error: deleteError } = await supabase.storage
      .from(supabaseBucket)
      .remove([testPath]);
    
    if (deleteError) {
      console.warn('⚠️  Erreur suppression fichier test:', deleteError.message);
    } else {
      console.log('✅ Fichier test supprimé');
    }
  }
} catch (error) {
  console.error('❌ Erreur upload:', error.message);
}

console.log('\n======================');
console.log('TESTS TERMINÉS');
