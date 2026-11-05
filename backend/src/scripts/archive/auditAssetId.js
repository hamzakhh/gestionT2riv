import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Equipment from '../models/Equipment.js';
import AssetCounter from '../models/AssetCounter.js';

dotenv.config();

const audit = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  console.log('=== ÉTAT ACTUEL ===');
  
  const total = await Equipment.countDocuments();
  const eq = await Equipment.find().select('assetId category name').sort({ assetId: 1 }).lean();
  const counter = await AssetCounter.findById('equipment_asset_id');
  
  console.log('Total équipements:', total);
  console.log('Compteur sequence:', counter ? counter.sequence : 'null');
  console.log('\nÉquipements existants:');
  eq.forEach(e => console.log(`  ${e.assetId} - ${e.category} - ${e.name}`));
  
  await mongoose.disconnect();
  process.exit(0);
};

audit();
