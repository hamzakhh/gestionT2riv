import mongoose from 'mongoose';

const zakatSchema = new mongoose.Schema({
  // Informations sur le donateur
  donorName: {
    type: String,
    required: [true, 'Le nom du donateur est requis'],
    trim: true,
  },
  donorPhone: {
    type: String,
    trim: true,
  },
  donorEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  donorAddress: {
    type: String,
    trim: true,
  },
  
  // Type et montant de Zakat
  zakatType: {
    type: String,
    required: [true, 'Le type de Zakat est requis'],
    enum: ['zakat_fitr', 'zakat_mal', 'ramadan_aid'],
  },
  amount: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [0, 'Le montant doit être positif'],
  },
  currency: {
    type: String,
    default: 'DZD',
  },
  
  // Statut de distribution
  status: {
    type: String,
    required: true,
    enum: ['pending', 'distributed', 'cancelled'],
    default: 'pending',
  },
  
  // Informations de distribution
  distributedTo: {
    type: String,
    trim: true,
  },
  distributionDate: {
    type: Date,
  },
  distributionNotes: {
    type: String,
    trim: true,
  },
  
  // Bénéficiaire
  beneficiaryType: {
    type: String,
    enum: ['individual', 'family', 'organization'],
    default: 'individual',
  },
  beneficiaryInfo: {
    name: { type: String, trim: true },
    familySize: { type: Number, min: 1 },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  
  // Méthode de paiement
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'check', 'online'],
    default: 'cash',
  },
  paymentReference: {
    type: String,
    trim: true,
  },
  
  // Référence au donateur (si existant dans le système)
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
  },
  
  // Utilisateur qui a créé l'enregistrement
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Notes additionnelles
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index pour la recherche et les rapports
zakatSchema.index({ zakatType: 1, createdAt: -1 });
zakatSchema.index({ status: 1, createdAt: -1 });
zakatSchema.index({ donorName: 1, createdAt: -1 });
zakatSchema.index({ createdAt: -1 });

// Validation personnalisée
zakatSchema.pre('save', function(next) {
  // Si le statut est "distributed", vérifier les informations de distribution
  if (this.status === 'distributed') {
    if (!this.distributedTo) {
      return next(new Error('Le nom du bénéficiaire est requis pour la distribution'));
    }
    if (!this.distributionDate) {
      this.distributionDate = new Date();
    }
  }
  
  next();
});

// Méthode statique pour générer un numéro de référence
zakatSchema.statics.generateReference = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = Date.now().toString(36).toUpperCase();
  return `ZAK-${year}${month}${day}-${time}`;
};

// Méthode d'instance pour obtenir le libellé du type
zakatSchema.methods.getZakatTypeLabel = function() {
  const labels = {
    'zakat_fitr': 'Zakat Al-Fitr',
    'zakat_mal': 'Zakat Al-Mal',
    'ramadan_aid': 'Aide Ramadan'
  };
  return labels[this.zakatType] || this.zakatType;
};

// Méthode d'instance pour obtenir le libellé du statut
zakatSchema.methods.getStatusLabel = function() {
  const labels = {
    'pending': 'En attente',
    'distributed': 'Distribué',
    'cancelled': 'Annulé'
  };
  return labels[this.status] || this.status;
};

export default mongoose.model('Zakat', zakatSchema);
