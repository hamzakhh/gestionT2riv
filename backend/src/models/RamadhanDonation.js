import mongoose from 'mongoose';

const ramadhanDonationSchema = new mongoose.Schema({
  // Informations sur le produit
  productName: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    trim: true,
  },
  
  // Informations financières
  unitPrice: {
    type: Number,
    required: [true, 'Le prix unitaire est requis'],
    min: [0, 'Le prix unitaire doit être positif'],
  },
  quantity: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [0, 'La quantité doit être positive'],
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Le total doit être positif'],
  },
  currency: {
    type: String,
    default: 'DZD',
  },
  
  // Destination et distribution
  destination: {
    type: String,
    enum: ['association', 'restaurant', 'kouffa'],
    default: 'association',
  },
  distributedQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  assignedToRestaurant: {
    type: Number,
    default: 0,
    min: 0,
  },
  assignedToKouffa: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Métadonnées
  donationDate: {
    type: Date,
    required: [true, 'La date de don est requise'],
    default: Date.now,
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true, // Permet d'avoir des valeurs null/undefined
  },
  notes: {
    type: String,
    trim: true,
  },
  
  // Référence au donateur (optionnel pour l'instant)
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
}, {
  timestamps: true,
});

// Index pour la recherche et les rapports
ramadhanDonationSchema.index({ productName: 1, donationDate: -1 });
ramadhanDonationSchema.index({ category: 1, donationDate: -1 });
ramadhanDonationSchema.index({ destination: 1, donationDate: -1 });
ramadhanDonationSchema.index({ donationDate: -1 });

// Validation personnalisée
ramadhanDonationSchema.pre('save', function(next) {
  // Calculer le total si non spécifié
  if (!this.totalPrice) {
    this.totalPrice = this.unitPrice * this.quantity;
  }
  
  // Valider que les quantités distribuées ne dépassent pas la quantité totale
  const totalAssigned = this.distributedQuantity + this.assignedToRestaurant + this.assignedToKouffa;
  if (totalAssigned > this.quantity) {
    return next(new Error('La quantité totale distribuée ne peut pas dépasser la quantité disponible'));
  }
  
  next();
});

// Méthode statique pour générer un numéro de reçu
ramadhanDonationSchema.statics.generateReceiptNumber = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = Date.now().toString(36).toUpperCase();
  return `RAM-${year}${month}${day}-${time}`;
};

// Méthode d'instance pour obtenir la quantité restante
ramadhanDonationSchema.methods.getRemainingQuantity = function() {
  return this.quantity - this.distributedQuantity - this.assignedToRestaurant - this.assignedToKouffa;
};

// Méthode d'instance pour obtenir la valeur restante
ramadhanDonationSchema.methods.getRemainingValue = function() {
  return this.getRemainingQuantity() * this.unitPrice;
};

export default mongoose.model('RamadhanDonation', ramadhanDonationSchema);
