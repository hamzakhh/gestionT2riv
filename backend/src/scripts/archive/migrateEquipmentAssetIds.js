import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Equipment from '../models/Equipment.js';
import AssetCounter from '../models/AssetCounter.js';

dotenv.config();

// Vérifier si c'est un mode dry-run
const isDryRun = process.argv.includes('--dry-run');

const migrateEquipmentAssetIds = async () => {
  try {
    console.log('🔄 Migration des Asset IDs pour équipements existants');
    console.log('='.repeat(60));
    console.log(`Mode: ${isDryRun ? 'DRY RUN (aucune modification)' : 'MIGRATION RÉELLE'}`);
    console.log('='.repeat(60) + '\n');

    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Étape 1: Analyser l'état actuel
    console.log('📊 Étape 1: Analyse de l\'état actuel');
    console.log('-'.repeat(60));
    
    const totalEquipment = await Equipment.countDocuments();
    const equipmentWithAssetId = await Equipment.countDocuments({ assetId: { $exists: true, $ne: null } });
    const equipmentWithoutAssetId = await Equipment.countDocuments({ 
      $or: [
        { assetId: { $exists: false } },
        { assetId: null }
      ]
    });

    console.log(`Total équipements: ${totalEquipment}`);
    console.log(`Avec Asset ID: ${equipmentWithAssetId}`);
    console.log(`Sans Asset ID: ${equipmentWithoutAssetId}`);
    console.log();

    // Étape 2: Analyser les Asset IDs existants
    console.log('📊 Étape 2: Analyse des Asset IDs existants');
    console.log('-'.repeat(60));
    
    const equipmentWithAssetIdList = await Equipment.find({ 
      assetId: { $exists: true, $ne: null } 
    }).select('assetId name').sort({ assetId: 1 });

    let maxSequence = 0;
    const existingAssetIds = [];

    if (equipmentWithAssetIdList.length > 0) {
      console.log(`Analyse de ${equipmentWithAssetIdList.length} Asset IDs existants:`);
      
      for (const eq of equipmentWithAssetIdList) {
        const match = eq.assetId.match(/MAT-(\d+)/);
        if (match) {
          const sequence = parseInt(match[1]);
          existingAssetIds.push({
            assetId: eq.assetId,
            sequence: sequence,
            name: eq.name
          });
          
          if (sequence > maxSequence) {
            maxSequence = sequence;
          }
        }
      }

      console.log(`✅ Asset ID le plus élevé: MAT-${String(maxSequence).padStart(6, '0')} (séquence: ${maxSequence})`);
      console.log(`✅ Nombre d'Asset IDs valides: ${existingAssetIds.length}`);
      
      // Vérifier les doublons
      const uniqueSequences = new Set(existingAssetIds.map(e => e.sequence));
      if (uniqueSequences.size !== existingAssetIds.length) {
        console.log('⚠️  ATTENTION: Des doublons de séquence ont été détectés!');
        const duplicates = existingAssetIds.filter(e => {
          const count = existingAssetIds.filter(x => x.sequence === e.sequence).length;
          return count > 1;
        });
        console.log('Doublons:', duplicates);
      } else {
        console.log('✅ Aucun doublon détecté');
      }
    } else {
      console.log('ℹ️  Aucun Asset ID existant trouvé');
    }
    console.log();

    // Étape 3: Analyser l'état du compteur
    console.log('📊 Étape 3: Analyse du compteur AssetCounter');
    console.log('-'.repeat(60));
    
    let counter = await AssetCounter.findById('equipment_asset_id');
    
    if (!counter) {
      console.log('ℹ️  Compteur AssetCounter non trouvé, sera créé avec sequence = 0');
      counter = { sequence: 0 };
    } else {
      console.log(`Compteur actuel: sequence = ${counter.sequence}`);
    }

    // Déterminer la séquence de départ pour la migration
    const startSequence = Math.max(maxSequence, counter.sequence);
    console.log(`Séquence de départ pour la migration: ${startSequence}`);
    console.log();

    // Étape 4: Récupérer les équipements sans Asset ID
    console.log('📊 Étape 4: Récupération des équipements sans Asset ID');
    console.log('-'.repeat(60));
    
    const equipmentToMigrate = await Equipment.find({
      $or: [
        { assetId: { $exists: false } },
        { assetId: null }
      ]
    }).sort({ createdAt: 1 }); // Trier par date de création pour l'ordre chronologique

    console.log(`✅ ${equipmentToMigrate.length} équipements à migrer`);
    
    if (equipmentToMigrate.length > 0) {
      console.log('Premiers équipements à migrer:');
      equipmentToMigrate.slice(0, 5).forEach(eq => {
        console.log(`  - ${eq.name} (créé le: ${eq.createdAt.toISOString().split('T')[0]})`);
      });
      if (equipmentToMigrate.length > 5) {
        console.log(`  ... et ${equipmentToMigrate.length - 5} autres`);
      }
    }
    console.log();

    // Étape 5: Simulation de la migration (Dry Run)
    console.log('📊 Étape 5: Simulation de la migration');
    console.log('-'.repeat(60));
    
    const migrationPlan = [];
    let currentSequence = startSequence;

    for (const eq of equipmentToMigrate) {
      const newAssetId = `MAT-${String(currentSequence + 1).padStart(6, '0')}`;
      migrationPlan.push({
        _id: eq._id,
        name: eq.name,
        currentAssetId: eq.assetId,
        newAssetId: newAssetId,
        sequence: currentSequence + 1
      });
      currentSequence++;
    }

    console.log(`✅ Plan de migration généré pour ${migrationPlan.length} équipements`);
    console.log(`Séquence finale: ${currentSequence}`);
    console.log(`Asset ID final: MAT-${String(currentSequence).padStart(6, '0')}`);
    console.log();

    // Étape 6: Synchronisation du compteur
    console.log('📊 Étape 6: Synchronisation du compteur AssetCounter');
    console.log('-'.repeat(60));
    
    const targetSequence = currentSequence;
    console.log(`Compteur actuel: ${counter.sequence || 0}`);
    console.log(`Compteur cible: ${targetSequence}`);
    
    if (isDryRun) {
      console.log('⏭️  [DRY RUN] Le compteur serait synchronisé à:', targetSequence);
    } else {
      await AssetCounter.findOneAndUpdate(
        { _id: 'equipment_asset_id' },
        { $set: { sequence: targetSequence } },
        { upsert: true, new: true }
      );
      console.log('✅ Compteur synchronisé à:', targetSequence);
    }
    console.log();

    // Étape 7: Exécution de la migration
    if (equipmentToMigrate.length > 0) {
      console.log('📊 Étape 7: Exécution de la migration');
      console.log('-'.repeat(60));

      if (isDryRun) {
        console.log('⏭️  [DRY RUN] Les modifications suivantes seraient appliquées:');
        console.log();
        
        migrationPlan.forEach((plan, index) => {
          console.log(`${index + 1}. ${plan.name}`);
          console.log(`   _id: ${plan._id}`);
          console.log(`   Asset ID actuel: ${plan.currentAssetId || 'null'}`);
          console.log(`   Nouvel Asset ID: ${plan.newAssetId}`);
          console.log();
        });
        
        console.log('⏭️  [DRY RUN] Aucune modification réelle appliquée');
      } else {
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const plan of migrationPlan) {
          try {
            // Utiliser updateOne pour bypasser le pre-save hook qui empêche la modification d'assetId
            await Equipment.updateOne(
              { _id: plan._id },
              { $set: { assetId: plan.newAssetId } }
            );
            
            console.log(`✅ ${plan.name} → ${plan.newAssetId}`);
            successCount++;
          } catch (error) {
            console.error(`❌ Erreur pour ${plan.name}:`, error.message);
            errorCount++;
            errors.push({
              equipment: plan.name,
              error: error.message
            });
          }
        }

        console.log();
        console.log('📊 Résultat de la migration:');
        console.log(`✅ Réussis: ${successCount}`);
        console.log(`❌ Échoués: ${errorCount}`);
        
        if (errors.length > 0) {
          console.log();
          console.log('Erreurs détaillées:');
          errors.forEach(err => {
            console.log(`  - ${err.equipment}: ${err.error}`);
          });
        }
      }
    } else {
      console.log('ℹ️  Aucun équipement à migrer');
    }
    console.log();

    // Étape 8: Vérification finale
    console.log('📊 Étape 8: Vérification finale');
    console.log('-'.repeat(60));
    
    const finalTotal = await Equipment.countDocuments();
    const finalWithAssetId = await Equipment.countDocuments({ 
      assetId: { $exists: true, $ne: null } 
    });
    const finalWithoutAssetId = await Equipment.countDocuments({ 
      $or: [
        { assetId: { $exists: false } },
        { assetId: null }
      ]
    });

    const finalCounter = await AssetCounter.findById('equipment_asset_id');
    const finalSequence = finalCounter ? finalCounter.sequence : 0;

    console.log(`Total équipements: ${finalTotal}`);
    console.log(`Avec Asset ID: ${finalWithAssetId}`);
    console.log(`Sans Asset ID: ${finalWithoutAssetId}`);
    console.log(`Valeur finale du compteur: ${finalSequence}`);
    console.log();

    // Résumé
    console.log('='.repeat(60));
    console.log('📊 RÉSUMÉ DE LA MIGRATION');
    console.log('='.repeat(60));
    console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'MIGRATION RÉELLE'}`);
    console.log(`Équipements avant migration: ${totalEquipment}`);
    console.log(`Avec Asset ID avant: ${equipmentWithAssetId}`);
    console.log(`Sans Asset ID avant: ${equipmentWithoutAssetId}`);
    console.log(`Équipements migrés: ${equipmentToMigrate.length}`);
    console.log(`Avec Asset ID après: ${finalWithAssetId}`);
    console.log(`Sans Asset ID après: ${finalWithoutAssetId}`);
    console.log(`Compteur final: ${finalSequence}`);
    console.log(`Asset ID maximal: MAT-${String(finalSequence).padStart(6, '0')}`);
    console.log('='.repeat(60));

    if (!isDryRun && finalWithoutAssetId === 0) {
      console.log('✅ Migration terminée avec succès - Tous les équipements ont un Asset ID');
    } else if (!isDryRun && finalWithoutAssetId > 0) {
      console.log(`⚠️  Migration terminée mais ${finalWithoutAssetId} équipements n'ont toujours pas d'Asset ID`);
    } else {
      console.log('✅ DRY RUN terminé - Exécutez sans --dry-run pour appliquer les modifications');
    }

    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

migrateEquipmentAssetIds();
