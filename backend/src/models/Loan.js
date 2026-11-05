import mongoose from 'mongoose';
import { LOAN_STATUS, EQUIPMENT_CONDITION } from '../config/constants.js';

const loanSchema = new mongoose.Schema({
  // Références
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Le patient est requis'],
    index: true
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: [true, 'L\'équipement est requis']
  },

  // Dates
  loanDate: {
    type: Date,
    required: [true, 'La date de prêt est requise'],
    default: Date.now,
    index: true
  },
  expectedReturnDate: {
    type: Date,
    required: [true, 'La date de retour attendue est requise'],
    validate: {
      validator: function(value) {
        return value > this.loanDate;
      },
      message: 'La date de retour doit être postérieure à la date de prêt'
    },
    index: true
  },
  actualReturnDate: {
    type: Date,
    default: null
  },
  cancelledDate: {
    type: Date,
    default: null
  },

  // Statut
  status: {
    type: String,
    enum: Object.values(LOAN_STATUS),
    required: true,
    default: LOAN_STATUS.ACTIVE,
    index: true
  },

  // Condition
  conditionAtLoan: {
    type: String,
    enum: Object.values(EQUIPMENT_CONDITION),
    required: [true, 'La condition au prêt est requise']
  },
  conditionAtReturn: {
    type: String,
    enum: Object.values(EQUIPMENT_CONDITION),
    default: null
  },

  // Notes
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Les notes ne peuvent dépasser 1000 caractères']
  },
  returnNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Les notes de retour ne peuvent dépasser 1000 caractères']
  },
  cancellationReason: {
    type: String,
    trim: true,
    required: function() {
      return this.status === LOAN_STATUS.CANCELLED;
    },
    maxlength: [500, 'La raison d\'annulation ne peut dépasser 500 caractères']
  },

  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le créateur est requis']
  },
  returnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Méta-données pour migration legacy
  isLegacyData: {
    type: Boolean,
    default: false,
    index: true
  },
  legacySource: {
    type: String,
    enum: ['patient_borrowedEquipment', null],
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual pour calculer si en retard
loanSchema.virtual('isOverdue').get(function() {
  if (this.status !== LOAN_STATUS.ACTIVE) return false;
  return new Date() > this.expectedReturnDate;
});

// Index unique partiel pour empêcher deux Loans actifs sur le même équipement
loanSchema.index(
  { equipment: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: LOAN_STATUS.ACTIVE }
  }
);

// Index pour filtres par patient
loanSchema.index({ patient: 1, status: 1 });

// Index pour prêts en retard (calculé)
loanSchema.index({ status: 1, expectedReturnDate: 1 });

// Index pour historique patient (tri par date)
loanSchema.index({ patient: 1, loanDate: -1 });

// Index pour historique equipment (tri par date)
loanSchema.index({ equipment: 1, loanDate: -1 });

// Index composé pour requêtes complexes
loanSchema.index({ patient: 1, status: 1, loanDate: -1 });

export default mongoose.model('Loan', loanSchema);
