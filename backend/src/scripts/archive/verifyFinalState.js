import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Equipment from '../models/Equipment.js';
import AssetCounter from '../models/AssetCounter.js';

dotenv.config();

const verifyFinalState = async () => {
  try {
    console.log('============================================================');
    console.log('        VÉRIFICATION FINALE ASSET IDs');
    console.log('============================================================\n');

    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Étape 1: Compter les équipements
    const totalEquipment = await Equipment.countDocuments();
    const equipmentWithAssetId = await Equipment.countDocuments({ 
      assetId: { $exists: true, $ne: null } 
    });
    const equipmentWithoutAssetId = await Equipment.countDocuments({ 
      $or: [
        { assetId: { $exists: false } },
        { assetId: null }
      ]
    });

    console.log('Statistiques générales:');
    console.log(`Total équipements              : ${totalEquipment}`);
    console.log(`Avec Asset ID                  : ${equipmentWithAssetId}`);
    console.log(`Sans Asset ID                  : ${equipmentWithoutAssetId}`);
    console.log();

    // Étape 2: Récupérer tous les équipements avec Asset ID
    const allEquipment = await Equipment.find({ 
      assetId: { $exists: true, $ne: null } 
    })
      .select('assetId name serialNumber')
      .sort({ assetId: 1 })
      .lean();

    // Étape 3: Vérifier les doublons d'Asset ID
    const assetIds = allEquipment.map(eq => eq.assetId);
    const uniqueAssetIds = new Set(assetIds);
    const duplicates = assetIds.length - uniqueAssetIds.size;

    console.log('Vérification des doublons:');
    console.log(`Asset IDs uniques              : ${uniqueAssetIds.size}`);
    console.log(`Doublons                       : ${duplicates}`);
    console.log();

    // Étape 4: Vérifier le format des Asset IDs
    const invalidAssetIds = assetIds.filter(id => {
      const match = id.match(/MAT-(\d{6})/);
      return !match;
    });

    console.log('Vérification du format:');
    console.log(`Asset IDs invalides            : ${invalidAssetIds.length}`);
    if (invalidAssetIds.length > 0) {
      console.log('Liste des Asset IDs invalides:');
      invalidAssetIds.forEach(id => console.log(`  - ${id}`));
    }
    console.log();

    // Étape 5: Premier et dernier Asset ID
    const firstAssetId = assetIds.length > 0 ? assetIds[0] : null;
    const lastAssetId = assetIds.length > 0 ? assetIds[assetIds.length - 1] : null;

    console.log('Étendue des Asset IDs:');
    console.log(`Premier Asset ID               : ${firstAssetId || '—'}`);
    console.log(`Dernier Asset ID               : ${lastAssetId || '—'}`);
    console.log();

    // Étape 6: Récupérer l'état des compteurs
    const medicalCounter = await AssetCounter.findOne({ key: 'medical' });
    const bureautiqueCounter = await AssetCounter.findOne({ key: 'bureautique' });
    const medicalSequence = medicalCounter ? medicalCounter.sequence : 0;
    const bureautiqueSequence = bureautiqueCounter ? bureautiqueCounter.sequence : 0;

    console.log('État des compteurs AssetCounter:');
    console.log(`Compteur Medical (sequence)     : ${medicalSequence}`);
    console.log(`Compteur Bureautique (sequence) : ${bureautiqueSequence}`);
    console.log();

    // Étape 7: Vérifier la cohérence par catégorie
    let coherence = '✅';
    
    const medicalIds = assetIds.filter(id => id.startsWith('MAT-'));
    const bureautiqueIds = assetIds.filter(id => id.startsWith('BUR-'));
    
    const lastMedical = medicalIds.length > 0 ? medicalIds[medicalIds.length - 1] : null;
    const lastBureautique = bureautiqueIds.length > 0 ? bureautiqueIds[bureautiqueIds.length - 1] : null;
    
    const expectedMedical = `MAT-${String(medicalSequence).padStart(6, '0')}`;
    const expectedBureautique = `BUR-${String(bureautiqueSequence).padStart(6, '0')}`;
    
    if (lastMedical && lastMedical !== expectedMedical) {
      coherence = '❌';
      console.log('⚠️  INHÉRENCE DÉTECTÉE (Medical):');
      console.log(`   Dernier Asset ID existant     : ${lastMedical}`);
      console.log(`   Asset ID attendu (compteur) : ${expectedMedical}`);
    }
    
    if (lastBureautique && lastBureautique !== expectedBureautique) {
      coherence = '❌';
      console.log('⚠️  INHÉRENCE DÉTECTÉE (Bureautique):');
      console.log(`   Dernier Asset ID existant     : ${lastBureautique}`);
      console.log(`   Asset ID attendu (compteur) : ${expectedBureautique}`);
    }
    
    console.log(`Cohérence compteur            : ${coherence}`);
    console.log();

    // Étape 8: État final
    const allTestsPassed = 
      equipmentWithoutAssetId === 0 &&
      duplicates === 0 &&
      invalidAssetIds.length === 0 &&
      coherence === '✅';

    console.log('============================================================');
    console.log('RÉSULTAT FINAL');
    console.log('============================================================');
    console.log(`Asset ID complets              : ${equipmentWithoutAssetId === 0 ? '✅' : '❌'}`);
    console.log(`Aucun doublon                  : ${duplicates === 0 ? '✅' : '❌'}`);
    console.log(`Format valide                  : ${invalidAssetIds.length === 0 ? '✅' : '❌'}`);
    console.log(`Compteur cohérent              : ${coherence}`);
    console.log();
    console.log(`ÉTAT GLOBAL                    : ${allTestsPassed ? '✅ VALIDÉ' : '❌ PROBLÈME'}`);
    console.log('============================================================');

    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

verifyFinalState();
