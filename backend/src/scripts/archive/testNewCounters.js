import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Equipment from '../models/Equipment.js';
import AssetCounter from '../models/AssetCounter.js';

dotenv.config();

const testNewCounters = async () => {
  try {
    console.log('============================================================');
    console.log('        TESTS DES NOUVEAUX COMPTEURS ASSET ID');
    console.log('============================================================\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Reset des compteurs avant les tests
    await AssetCounter.findOneAndUpdate({ key: 'medical' }, { $set: { sequence: 0 } }, { upsert: true });
    await AssetCounter.findOneAndUpdate({ key: 'bureautique' }, { $set: { sequence: 0 } }, { upsert: true });
    console.log('Compteurs reset avant tests\n');

    // TEST 1: Base vide → Medical = MAT-000001
    console.log('TEST 1: Base vide → Medical = MAT-000001');
    const id1 = await Equipment.generateNextAssetId('Médical');
    console.log(`Résultat: ${id1}`);
    console.log(id1 === 'MAT-000001' ? '✅ PASS' : '❌ FAIL');
    console.log();

    // TEST 2: Création deuxième Medical → MAT-000002
    console.log('TEST 2: Création deuxième Medical → MAT-000002');
    const id2 = await Equipment.generateNextAssetId('Médical');
    console.log(`Résultat: ${id2}`);
    console.log(id2 === 'MAT-000002' ? '✅ PASS' : '❌ FAIL');
    console.log();

    // TEST 3: Création Bureautique → BUR-000001
    console.log('TEST 3: Création Bureautique → BUR-000001');
    const id3 = await Equipment.generateNextAssetId('Bureautique');
    console.log(`Résultat: ${id3}`);
    console.log(id3 === 'BUR-000001' ? '✅ PASS' : '❌ FAIL');
    console.log();

    // Reset des compteurs pour les tests suivants
    await AssetCounter.findOneAndUpdate({ key: 'medical' }, { $set: { sequence: 0 } });
    await AssetCounter.findOneAndUpdate({ key: 'bureautique' }, { $set: { sequence: 0 } });
    console.log('Compteurs reset pour tests suivants\n');

    // TEST 4: Simuler suppression MAT-000001 → prochain = MAT-000003
    console.log('TEST 4: Suppression MAT-000001 → prochain Medical = MAT-000003');
    const testEq1 = await Equipment.create({
      assetId: 'MAT-000001',
      name: 'TEST1',
      category: 'Médical',
      type: 'Test',
      status: 'available',
      condition: 'good',
      createdBy: new mongoose.Types.ObjectId()
    });
    const testEq2 = await Equipment.create({
      assetId: 'MAT-000002',
      name: 'TEST2',
      category: 'Médical',
      type: 'Test',
      status: 'available',
      condition: 'good',
      createdBy: new mongoose.Types.ObjectId()
    });
    const testEq3 = await Equipment.create({
      assetId: 'MAT-000003',
      name: 'TEST3',
      category: 'Médical',
      type: 'Test',
      status: 'available',
      condition: 'good',
      createdBy: new mongoose.Types.ObjectId()
    });
    
    // Supprimer MAT-000002
    await Equipment.deleteOne({ assetId: 'MAT-000002' });
    
    // Simuler compteur à 3
    await AssetCounter.findOneAndUpdate({ key: 'medical' }, { $set: { sequence: 3 } });
    
    const id4 = await Equipment.generateNextAssetId('Médical');
    console.log(`Résultat: ${id4}`);
    console.log(id4 === 'MAT-000004' ? '✅ PASS' : '❌ FAIL');
    console.log();

    // Nettoyage
    await Equipment.deleteMany({ name: /^TEST/ });
    await AssetCounter.findOneAndUpdate({ key: 'medical' }, { $set: { sequence: 0 } });
    await AssetCounter.findOneAndUpdate({ key: 'bureautique' }, { $set: { sequence: 0 } });
    console.log('Nettoyage effectué\n');

    console.log('============================================================');
    console.log('RÉSUMÉ DES TESTS');
    console.log('============================================================');
    console.log('Tous les tests de génération d\'Asset ID sont terminés.');
    console.log('Veuillez vérifier les résultats ci-dessus.');
    console.log('============================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

testNewCounters();
