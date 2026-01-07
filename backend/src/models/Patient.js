import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { LOAN_STATUS } from '../config/constants.js';

const patientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'L\'adresse est requise'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    trim: true
  },
  guardianFirstName: {
    type: String,
    required: [true, 'Le prénom du tuteur est requis'],
    trim: true
  },
  guardianLastName: {
    type: String,
    required: [true, 'Le nom du tuteur est requis'],
    trim: true
  },
  patientType: {
    type: String,
    enum: ['général', 'spécifique'],
    required: [true, 'Le type de patient est requis']
  },
  specificEquipment: {
    type: String,
    enum: ['', 'lit', 'matelas', 'concentrateur d\'oxygène'],
    default: ''
  },
  entryDate: {
    type: Date
  },
  exitDate: {
    type: Date
  },
  
  // Référence aux équipements empruntés
  borrowedEquipment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  }],
  
  // Historique des prêts
  loanHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan'
  }],
  
  // Statut des prêts actifs
  activeLoans: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(value) {
        return value >= 0;
      },
      message: 'activeLoans ne peut pas être négatif'
    }
  },
  files: [
    {
      type: String
    }
  ]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
});

// Index for search
patientSchema.index({ firstName: 'text', lastName: 'text', phone: 'text' });

// Add pagination plugin
patientSchema.plugin(mongoosePaginate);

// Middleware pour mettre à jour les statistiques des prêts
patientSchema.pre('save', function(next) {
  // Corriger activeLoans négatif avant toute validation
  if (this.activeLoans < 0) {
    console.log(`Correction automatique: activeLoans était ${this.activeLoans}, mise à 0`);
    this.activeLoans = 0;
  }
  
  if (this.isModified('borrowedEquipment')) {
    // S'assurer que borrowedEquipment est un tableau
    const equipmentCount = Array.isArray(this.borrowedEquipment) ? this.borrowedEquipment.length : 0;
    // S'assurer que activeLoans n'est jamais négatif
    this.activeLoans = Math.max(0, equipmentCount);
    console.log(`Patient ${this._id}: activeLoans mis à jour à ${this.activeLoans} (borrowedEquipment: ${equipmentCount})`);
  }
  next();
});

// Middleware de validation pour corriger les valeurs négatives
patientSchema.pre('validate', function(next) {
  if (this.activeLoans < 0) {
    console.log(`Correction dans pre-validate: activeLoans était ${this.activeLoans}, mise à 0`);
    this.activeLoans = 0;
  }
  next();
});

// Méthode pour ajouter un équipement emprunté
patientSchema.methods.addBorrowedEquipment = async function(equipmentId) {
  if (!this.borrowedEquipment.includes(equipmentId)) {
    this.borrowedEquipment.push(equipmentId);
    await this.save();
  }
};

// Méthode pour retirer un équipement emprunté
patientSchema.methods.removeBorrowedEquipment = async function(equipmentId) {
  this.borrowedEquipment = this.borrowedEquipment.filter(
    eqId => !eqId.equals(equipmentId)
  );
  await this.save();
};

// Méthode pour ajouter un prêt à l'historique
patientSchema.methods.addLoanToHistory = async function(loanId) {
  if (!this.loanHistory.includes(loanId)) {
    this.loanHistory.push(loanId);
    await this.save();
  }
};

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
