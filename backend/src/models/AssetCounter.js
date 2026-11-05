import mongoose from 'mongoose';

const assetCounterSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    enum: ['medical', 'bureautique']
  },
  sequence: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Index unique pour garantir un compteur par catégorie
assetCounterSchema.index({ key: 1 }, { unique: true });

export default mongoose.model('AssetCounter', assetCounterSchema);
