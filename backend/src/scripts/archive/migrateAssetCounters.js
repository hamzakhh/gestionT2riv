import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Equipment from '../models/Equipment.js';
import AssetCounter from '../models/AssetCounter.js';

dotenv.config();

const migrateAssetCounters = async () => {
  try {
    console.log('============================================================');
    console.log('        MIGRATION DES COMPTEURS ASSET ID');
    console.log('============================================================\n');

    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Étape 1: Analyser l'état actuel
    console.log('ÉTAPE 1: Analyse de l\'état actuel');
    const allEquipment = await Equipment.find().select('assetId category').sort({ assetId: 1 }).lean();
    console.log(`Total équipements : ${allEquipment.length}`);

    const medical = allEquipment.filter(e => e.category === 'Médical');
    const bureautique = allEquipment.filter(e => e.category === 'Bureautique');
    console.log(`Équipements Medical : ${medical.length}`);
    console.log(`Équipements Bureautique : ${bureautique.length}`);

    // Trouver le numéro maximum pour chaque catégorie
    const medicalMax = medical.map(e => {
      const match = e.assetId.match(/MAT-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const bureautiqueMax = bureautique.map(e => {
      const match = e.assetId.match(/BUR-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });

    const medicalSequence = medicalMax.length > 0 ? Math.max(...medicalMax) : 0;
    const bureautiqueSequence = bureautiqueMax.length > 0 ? Math.max(...bureautiqueMax) : 0;

    console.log(`Numéro maximum Medical : ${medicalSequence}`);
    console.log(`Numéro maximum Bureautique : ${bureautiqueSequence}`);
    console.log();

    // Étape 2: Nettoyer tous les compteurs existants
    console.log('ÉTAPE 2: Nettoyage des compteurs existants');
    const deletedCount = await AssetCounter.deleteMany({});
    console.log(`✅ ${deletedCount.deletedCount} compteur(s) supprimé(s)`);
    console.log();

    // Étape 3: Créer les nouveaux compteurs par catégorie
    console.log('ÉTAPE 3: Création des nouveaux compteurs par catégorie');
    
    // Compteur Medical
    const medicalCounter = await AssetCounter.findOneAndUpdate(
      { key: 'medical' },
      { $set: { sequence: medicalSequence } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`✅ Compteur Medical créé/mis à jour : sequence = ${medicalCounter.sequence}`);

    // Compteur Bureautique
    const bureautiqueCounter = await AssetCounter.findOneAndUpdate(
      { key: 'bureautique' },
      { $set: { sequence: bureautiqueSequence } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`✅ Compteur Bureautique créé/mis à jour : sequence = ${bureautiqueCounter.sequence}`);
    console.log();

    // Étape 4: Vérification
    console.log('ÉTAPE 4: Vérification de la migration');
    const newCounters = await AssetCounter.find().sort({ key: 1 });
    console.log('Compteurs actuels dans AssetCounter :');
    newCounters.forEach(c => {
      console.log(`  key: ${c.key}, sequence: ${c.sequence}`);
    });
    console.log();

    // ÉTAPE 5: Vérification de la cohérence
    console.log('ÉTAPE 5: Vérification de la cohérence');
    let coherence = true;
    
    // Vérifier Medical
    if (medicalSequence > 0) {
      const expectedMedical = `MAT-${String(medicalSequence).padStart(6, '0')}`;
      const lastMedical = medical.length > 0 ? medical[medical.length - 1].assetId : null;
      if (lastMedical && lastMedical !== expectedMedical) {
        console.log(`⚠️  Avertissement: dernier Medical ${lastMedical} ≠ attendu ${expectedMedical}`);
        coherence = false;
      } else {
        console.log(`✅ Medical cohérent (dernier: ${lastMedical || 'aucun'})`);
      }
    } else {
      console.log('✅ Medical vide, compteur à 0');
    }

    // Vérifier Bureautique
    if (bureautiqueSequence > 0) {
      const expectedBureautique = `BUR-${String(bureautiqueSequence).padStart(6, '0')}`;
      const lastBureautique = bureautique.length > 0 ? bureautique[bureautique.length - 1].assetId : null;
      if (lastBureautique && lastBureautique !== expectedBureautique) {
        console.log(`⚠️  Avertissement: dernier Bureautique ${lastBureautique} ≠ attendu ${expectedBureautique}`);
        coherence = false;
      } else {
        console.log(`✅ Bureautique cohérent (dernier: ${lastBureautique || 'aucun'})`);
      }
    } else {
      console.log('✅ Bureautique vide, compteur à 0');
    }
    console.log();

    // ÉTAPE 6: Résultat
    console.log('============================================================');
    console.log('RÉSULTAT DE LA MIGRATION');
    console.log('============================================================');
    console.log(`Ancien compteur supprimé : ${deletedCount.deletedCount > 0 ? '✅' : '❌ (déjà absent)'}`);
    console.log(`Compteur Medical : sequence = ${medicalCounter.sequence}`);
    console.log(`Compteur Bureautique : sequence = ${bureautiqueCounter.sequence}`);
    console.log(`Cohérence : ${coherence ? '✅' : '⚠️  AVERTISSEMENT'}`);
    console.log();
    console.log('Format des nouveaux Asset ID :');
    console.log('  Medical → MAT-000001, MAT-000002, ...');
    console.log('  Bureautique → BUR-000001, BUR-000002, ...');
    console.log('============================================================');

    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

migrateAssetCounters();
