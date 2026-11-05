import mongoose from 'mongoose';
import { EQUIPMENT_STATUS, EQUIPMENT_CONDITION } from '../config/constants.js';
import AssetCounter from './AssetCounter.js';

const equipmentSchema = new mongoose.Schema({
  assetId: {
    type: String,
    required: [true, 'L\'Asset ID est requis'],
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Le nom de l\'équipement est requis'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: ['Médical', 'Bureautique'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Le type d\'équipement est requis'],
    trim: true,
  },
  serialNumber: {
    type: String,
    required: false,
    trim: true,
  },
  status: {
    type: String,
    enum: Object.values(EQUIPMENT_STATUS),
    default: EQUIPMENT_STATUS.AVAILABLE,
  },
  condition: {
    type: String,
    enum: Object.values(EQUIPMENT_CONDITION),
    default: EQUIPMENT_CONDITION.GOOD,
  },
  purchaseDate: {
    type: Date,
  },
  purchasePrice: {
    type: Number,
    min: 0,
  },
    entryDate: {
    type: Date,
    default: null
  },
  maintenanceHistory: [{
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      min: 0,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  images: [String],
  notes: String,
  assignedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index pour la recherche
equipmentSchema.index({ name: 'text', category: 'text', serialNumber: 'text' });

// Index unique pour assetId (plus sparse car le champ est required)
equipmentSchema.index({ assetId: 1 }, { unique: true });

// Index sparse pour serialNumber (permet plusieurs null et unicité si fourni)
equipmentSchema.index({ serialNumber: 1 }, { unique: true, sparse: true });

// Index composé pour recherche combinée
equipmentSchema.index({ assetId: 1, serialNumber: 1 });

// Pre-save hook pour empêcher la modification d'assetId après création
equipmentSchema.pre('save', function(next) {
  if (this.isModified('assetId') && !this.isNew) {
    return next(new Error('L\'Asset ID ne peut pas être modifié après création'));
  }
  next();
});

// Méthode statique pour générer le prochain Asset ID de manière atomique
equipmentSchema.statics.generateNextAssetId = async function(category) {
  try {
    // Déterminer le préfixe et la clé du compteur selon la catégorie
    const prefix = category === 'Bureautique' ? 'BUR' : 'MAT';
    const key = category === 'Bureautique' ? 'bureautique' : 'medical';
    
    // Utiliser findOneAndUpdate avec $inc pour une incrémentation atomique séquentielle
    const counter = await AssetCounter.findOneAndUpdate(
      { key },
      { $inc: { sequence: 1 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    // Formater l'Asset ID avec padding à 6 chiffres
    const assetId = `${prefix}-${String(counter.sequence).padStart(6, '0')}`;
    
    return assetId;
  } catch (error) {
    throw new Error(`Erreur lors de la génération de l'Asset ID: ${error.message}`);
  }
};

export default mongoose.model('Equipment', equipmentSchema);
