import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Equipment from '../models/Equipment.js';
import AssetCounter from '../models/AssetCounter.js';

dotenv.config();

const resetCounterSafely = async () => {
  try {
    console.log('============================================================');
    console.log('        VÉRIFICATION ET RÉINITIALISATION DES COMPTEURS');
    console.log('============================================================\n');

    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Étape 1: Vérifier le nombre d'équipements par catégorie
    const totalEquipment = await Equipment.countDocuments();
    const medicalCount = await Equipment.countDocuments({ category: 'Médical' });
    const bureautiqueCount = await Equipment.countDocuments({ category: 'Bureautique' });
    
    const medicalCounter = await AssetCounter.findOne({ key: 'medical' });
    const bureautiqueCounter = await AssetCounter.findOne({ key: 'bureautique' });
    
    const medicalSequence = medicalCounter ? medicalCounter.sequence : 0;
    const bureautiqueSequence = bureautiqueCounter ? bureautiqueCounter.sequence : 0;

    console.log('État actuel:');
    console.log(`Total équipements               : ${totalEquipment}`);
    console.log(`Équipements Medical              : ${medicalCount}`);
    console.log(`Équipements Bureautique          : ${bureautiqueCount}`);
    console.log(`Compteur Medical (sequence)     : ${medicalSequence}`);
    console.log(`Compteur Bureautique (sequence) : ${bureautiqueSequence}`);
    console.log();

    // Étape 2: Vérifier si les collections sont vides par catégorie
    if (medicalCount > 0 && bureautiqueCount > 0) {
      console.log('⚠️  Les collections Equipment ne sont pas vides.');
      console.log('❌ OPÉRATION ANNULÉE - Aucune modification effectuée.');
      console.log();
      console.log('Veuillez vérifier les équipements existants avant de continuer.');
      
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('✅ Au moins une catégorie est vide.');
    console.log('✅ Réinitialisation autorisée pour les catégories vides.');
    console.log();

    // Étape 3: Réinitialiser les compteurs des catégories vides
    console.log('Réinitialisation des compteurs...');
    
    if (medicalCount === 0) {
      await AssetCounter.findOneAndUpdate(
        { key: 'medical' },
        { $set: { sequence: 0 } },
        { upsert: true }
      );
      console.log('✅ Compteur Medical remis à 0');
    } else {
      console.log('ℹ️  Compteur Medical conservé (catégorie non vide)');
    }
    
    if (bureautiqueCount === 0) {
      await AssetCounter.findOneAndUpdate(
        { key: 'bureautique' },
        { $set: { sequence: 0 } },
        { upsert: true }
      );
      console.log('✅ Compteur Bureautique remis à 0');
    } else {
      console.log('ℹ️  Compteur Bureautique conservé (catégorie non vide)');
    }
    console.log();

    // Étape 4: Vérifier après réinitialisation
    const medicalAfter = await AssetCounter.findOne({ key: 'medical' });
    const bureautiqueAfter = await AssetCounter.findOne({ key: 'bureautique' });
    console.log('Vérification après réinitialisation:');
    console.log(`Compteur Medical (sequence)     : ${medicalAfter.sequence}`);
    console.log(`Compteur Bureautique (sequence) : ${bureautiqueAfter.sequence}`);
    console.log();

    // Étape 5: Test de création
    console.log('Test de création d\'équipement Medical...');
    const testMedicalId = await Equipment.generateNextAssetId('Médical');
    console.log(`Asset ID généré (Medical)       : ${testMedicalId}`);
    
    const testMedical = await Equipment.create({
      assetId: testMedicalId,
      name: 'TEST RESET MEDICAL',
      category: 'Médical',
      type: 'Test',
      serialNumber: 'TEST-RESET-MED-001',
      status: 'available',
      condition: 'good',
      createdBy: new mongoose.Types.ObjectId()
    });
    
    console.log(`✅ Équipement Medical créé avec Asset ID : ${testMedical.assetId}`);
    console.log();

    // Étape 6: Test de création Bureautique
    console.log('Test de création d\'équipement Bureautique...');
    const testBureautiqueId = await Equipment.generateNextAssetId('Bureautique');
    console.log(`Asset ID généré (Bureautique)  : ${testBureautiqueId}`);
    
    const testBureautique = await Equipment.create({
      assetId: testBureautiqueId,
      name: 'TEST RESET BUREAUTIQUE',
      category: 'Bureautique',
      type: 'Ordinateur',
      serialNumber: 'TEST-RESET-BUR-001',
      status: 'available',
      condition: 'good',
      createdBy: new mongoose.Types.ObjectId()
    });
    
    console.log(`✅ Équipement Bureautique créé avec Asset ID : ${testBureautique.assetId}`);
    console.log();

    // Étape 7: Nettoyage
    console.log('Nettoyage des équipements de test...');
    await Equipment.deleteOne({ _id: testMedical._id });
    await Equipment.deleteOne({ _id: testBureautique._id });
    console.log('✅ Équipements de test supprimés');
    console.log();

    // Étape 8: Remettre les compteurs à 0
    console.log('Remise des compteurs à 0 pour environnement propre...');
    await AssetCounter.findOneAndUpdate(
      { key: 'medical' },
      { $set: { sequence: 0 } },
      { upsert: true }
    );
    await AssetCounter.findOneAndUpdate(
      { key: 'bureautique' },
      { $set: { sequence: 0 } },
      { upsert: true }
    );
    console.log('✅ Compteurs remis à 0');
    console.log();

    // Étape 9: Vérification finale
    const finalMedical = await AssetCounter.findOne({ key: 'medical' });
    const finalBureautique = await AssetCounter.findOne({ key: 'bureautique' });
    const finalEquipmentCount = await Equipment.countDocuments();

    console.log('============================================================');
    console.log('RÉSULTAT FINAL');
    console.log('============================================================');
    console.log(`Nombre d'équipements               : ${finalEquipmentCount}`);
    console.log(`Compteur Medical (sequence)        : ${finalMedical.sequence}`);
    console.log(`Compteur Bureautique (sequence)    : ${finalBureautique.sequence}`);
    console.log();
    console.log('✅ Opération terminée avec succès');
    console.log('✅ Environnement prêt pour les tests');
    console.log('============================================================');

    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

resetCounterSafely();
