import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger .env depuis le backend
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Script de diagnostic MongoDB pour vérifier le support des transactions
 */
const diagnoseMongoTransactions = async () => {
  console.log('=== DIAGNOSTIC MONGODB TRANSACTIONS ===\n');

  try {
    // Connexion à MongoDB
    console.log('1. Connexion à MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connecté à: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Driver version: ${mongoose.version}\n`);

    // Vérifier si c'est un replica set ou MongoDB Atlas
    const admin = mongoose.connection.db.admin();
    const serverInfo = await admin.serverInfo();
    console.log('2. Information serveur:');
    console.log(`   Type: ${serverInfo.version}`);
    console.log(`   Process: ${serverInfo.process}\n`);

    // Vérifier le support des transactions
    console.log('3. Test de support des transactions...');
    
    const session = await mongoose.startSession();
    console.log('✅ Session démarrée avec succès');
    
    try {
      session.startTransaction();
      console.log('✅ Transaction démarrée avec succès');
      
      // Créer une collection de test
      const testCollection = mongoose.connection.db.collection('diagnostic_test');
      
      // Test d'écriture dans la transaction
      await testCollection.insertOne(
        { test: 'transaction', timestamp: new Date() },
        { session }
      );
      console.log('✅ Écriture dans transaction réussie');
      
      // Annuler la transaction
      await session.abortTransaction();
      console.log('✅ Transaction annulée avec succès');
      
      // Vérifier que les données n'ont pas été persistées
      const count = await testCollection.countDocuments({ test: 'transaction' });
      if (count === 0) {
        console.log('✅ Rollback fonctionnel (données non persistées)');
      } else {
        console.log('⚠️  Attention: Données persistées malgré le rollback');
      }
      
    } catch (transactionError) {
      console.log('❌ ERREUR TRANSACTION:');
      console.log(`   Message: ${transactionError.message}`);
      console.log(`   Code: ${transactionError.code}`);
      
      if (transactionError.message.includes('transaction') || 
          transactionError.message.includes('replica set')) {
        console.log('\n⚠️  LES TRANSACTIONS NE SONT PAS SUPPORTÉES');
        console.log('   Cause probable: MongoDB standalone (pas de replica set)');
        console.log('   Solution: Utiliser MongoDB Atlas ou configurer un replica set local');
      }
      throw transactionError;
    } finally {
      await session.endSession();
      console.log('✅ Session fermée\n');
    }

    // Nettoyer la collection de test
    const testCollection = mongoose.connection.db.collection('diagnostic_test');
    await testCollection.deleteMany({});
    console.log('4. Nettoyage collection de test: ✅\n');

    // Conclusion
    console.log('=== RÉSULTAT DU DIAGNOSTIC ===');
    console.log('✅ MongoDB supporte les transactions');
    console.log('✅ L\'implémentation Loan peut procéder\n');
    
    return true;

  } catch (error) {
    console.log('\n=== RÉSULTAT DU DIAGNOSTIC ===');
    console.log('❌ ERREUR CRITIQUE:');
    console.log(`   ${error.message}\n`);
    console.log('⚠️  LES TRANSACTIONS NE SONT PAS SUPPORTÉES');
    console.log('⚠️  L\'IMPLÉMENTATION LOAN NE PEUT PAS PROCÉDER\n');
    
    return false;
  } finally {
    await mongoose.connection.close();
    console.log('Connexion MongoDB fermée');
  }
};

// Exécuter le diagnostic
diagnoseMongoTransactions()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
