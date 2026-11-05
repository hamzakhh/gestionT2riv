import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger .env depuis le backend
dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { createLoan, returnLoan, cancelLoan, getOverdueLoans, getLoanStats } from '../services/loanService.js';
import Loan from '../models/Loan.js';
import Patient from '../models/Patient.js';
import Equipment from '../models/Equipment.js';
import User from '../models/User.js';
import { LOAN_STATUS, EQUIPMENT_STATUS, EQUIPMENT_CONDITION } from '../config/constants.js';

/**
 * Script de test réel du système Loan
 */
console.log('=== TESTS RÉELS DU SYSTÈME LOAN ===\n');

let testResults = [];
let testPatient;
let testEquipment;
let testUser;
let testLoan;

// Fonction utilitaire pour enregistrer les résultats
const recordResult = (testName, status, details = '') => {
  testResults.push({ test: testName, status, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${testName}: ${status}${details ? ' - ' + details : ''}`);
};

// Fonction utilitaire pour nettoyer les données de test
const cleanupTestData = async () => {
  try {
    await Loan.deleteMany({ isLegacyData: false });
    console.log('🧹 Nettoyage des données de test Loan');
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error.message);
  }
};

try {
  // Connexion à MongoDB
  console.log('1. Connexion à MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connecté\n');

  // Nettoyer les données de test précédentes
  await cleanupTestData();

  // Créer ou récupérer un utilisateur de test
  console.log('2. Création utilisateur de test...');
  testUser = await User.findOne({ email: 'loan.test@example.com' });
  if (!testUser) {
    testUser = await User.create({
      username: 'loantestuser',
      firstName: 'Loan',
      lastName: 'Test',
      email: 'loan.test@example.com',
      password: 'password123',
      role: 'admin',
      pagePermissions: ['loans', 'equipment', 'patients']
    });
    console.log('✅ Utilisateur de test créé');
  } else {
    console.log('✅ Utilisateur de test existant récupéré');
  }

  // Créer un patient de test
  console.log('\n3. Création patient de test...');
  testPatient = await Patient.create({
    firstName: 'Test',
    lastName: 'Patient',
    phone: '1234567890',
    address: '123 Test Street',
    guardianFirstName: 'Test',
    guardianLastName: 'Guardian',
    patientType: 'général',
    borrowedEquipment: [],
    activeLoans: 0
  });
  console.log('✅ Patient de test créé:', testPatient._id);

  // Créer un équipement de test disponible
  console.log('\n4. Création équipement de test...');
  testEquipment = await Equipment.create({
    name: 'Test Equipment Loan',
    assetId: 'TEST-LOAN-001',
    serialNumber: 'SNLOAN001',
    category: 'Médical',
    type: 'wheelchair',
    condition: EQUIPMENT_CONDITION.GOOD,
    status: EQUIPMENT_STATUS.AVAILABLE
  });
  console.log('✅ Équipement de test créé:', testEquipment._id);

  // === TEST 1: Vérification du modèle Loan ===
  console.log('\n=== TEST 1: VÉRIFICATION MODÈLE LOAN ===');
  const loanSchema = Loan.schema;
  const requiredFields = ['patient', 'equipment', 'loanDate', 'expectedReturnDate', 'status', 'conditionAtLoan', 'createdBy'];
  let modelCheck = true;
  for (const field of requiredFields) {
    if (!loanSchema.paths[field]) {
      console.log(`❌ Champ ${field} manquant`);
      modelCheck = false;
    }
  }
  if (modelCheck) {
    recordResult('Modèle Loan champs requis', 'PASS', 'Tous les champs présents');
  } else {
    recordResult('Modèle Loan champs requis', 'FAIL', 'Champs manquants');
  }

  // Vérification statuts
  const statusEnum = loanSchema.paths.status.enumValues;
  if (statusEnum.includes('active') && statusEnum.includes('returned') && statusEnum.includes('cancelled') && !statusEnum.includes('overdue')) {
    recordResult('Modèle Loan statuts', 'PASS', 'Statuts corrects sans overdue');
  } else {
    recordResult('Modèle Loan statuts', 'FAIL', 'Statuts incorrects');
  }

  // === TEST 2: Vérification Equipment ===
  console.log('\n=== TEST 2: VÉRIFICATION EQUIPMENT ===');
  const equipmentSchema = Equipment.schema;
  const equipmentStatusEnum = equipmentSchema.paths.status.enumValues;
  if (equipmentStatusEnum.includes('available') && equipmentStatusEnum.includes('maintenance') && 
      equipmentStatusEnum.includes('decommissioned') && equipmentStatusEnum.includes('lost') && 
      !equipmentStatusEnum.includes('loaned')) {
    recordResult('Equipment statuts', 'PASS', 'Statuts corrects sans loaned');
  } else {
    recordResult('Equipment statuts', 'FAIL', 'Statuts incorrects ou présence de loaned');
  }

  // === TEST 3: Vérification Transactions ===
  console.log('\n=== TEST 3: VÉRIFICATION TRANSACTIONS ===');
  const fs = await import('fs');
  const loanServicePath = path.join(__dirname, '../services/loanService.js');
  const loanServiceContent = fs.readFileSync(loanServicePath, 'utf-8');
  
  if (loanServiceContent.includes('startSession') && loanServiceContent.includes('startTransaction') && 
      loanServiceContent.includes('commitTransaction') && loanServiceContent.includes('abortTransaction')) {
    recordResult('Transactions MongoDB', 'PASS', 'Transactions correctement implémentées');
  } else {
    recordResult('Transactions MongoDB', 'FAIL', 'Transactions manquantes');
  }

  // === TEST 4: Création de prêt ===
  console.log('\n=== TEST 4: CRÉATION DE PRÊT ===');
  try {
    const loanData = {
      patient: testPatient._id,
      equipment: testEquipment._id,
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      conditionAtLoan: EQUIPMENT_CONDITION.GOOD,
      notes: 'Test loan creation'
    };

    testLoan = await createLoan(loanData, testUser._id);
    
    // Vérifications
    if (testLoan.status === LOAN_STATUS.ACTIVE) {
      recordResult('Création Loan statut', 'PASS', 'Status = active');
    } else {
      recordResult('Création Loan statut', 'FAIL', `Status = ${testLoan.status}`);
    }

    if (testLoan.patient.toString() === testPatient._id.toString()) {
      recordResult('Création Loan patient', 'PASS', 'Patient correct');
    } else {
      recordResult('Création Loan patient', 'FAIL', 'Patient incorrect');
    }

    if (testLoan.equipment.toString() === testEquipment._id.toString()) {
      recordResult('Création Loan equipment', 'PASS', 'Equipment correct');
    } else {
      recordResult('Création Loan equipment', 'FAIL', 'Equipment incorrect');
    }

    // Vérifier Patient cache
    const updatedPatient = await Patient.findById(testPatient._id);
    if (updatedPatient.borrowedEquipment.includes(testEquipment._id.toString())) {
      recordResult('Patient cache borrowedEquipment', 'PASS', 'Équipement ajouté');
    } else {
      recordResult('Patient cache borrowedEquipment', 'FAIL', 'Équipement non ajouté');
    }

    if (updatedPatient.activeLoans === 1) {
      recordResult('Patient cache activeLoans', 'PASS', 'activeLoans = 1');
    } else {
      recordResult('Patient cache activeLoans', 'FAIL', `activeLoans = ${updatedPatient.activeLoans}`);
    }

    // Vérifier Equipment status
    const updatedEquipment = await Equipment.findById(testEquipment._id);
    if (updatedEquipment.status === EQUIPMENT_STATUS.AVAILABLE) {
      recordResult('Equipment status inchangé', 'PASS', 'Status reste available');
    } else {
      recordResult('Equipment status inchangé', 'FAIL', `Status = ${updatedEquipment.status}`);
    }

  } catch (error) {
    recordResult('Création Loan', 'FAIL', error.message);
  }

  // === TEST 5: Test disponibilité (double prêt) ===
  console.log('\n=== TEST 5: TEST DISPONIBILITÉ (DOUBLE PRÊT) ===');
  try {
    const duplicateLoanData = {
      patient: testPatient._id,
      equipment: testEquipment._id,
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      conditionAtLoan: EQUIPMENT_CONDITION.GOOD
    };

    try {
      await createLoan(duplicateLoanData, testUser._id);
      recordResult('Double prêt prévention', 'FAIL', 'Deuxième prêt créé (ne devrait pas arriver)');
    } catch (error) {
      if (error.message === 'EQUIPMENT_ALREADY_LOANED') {
        recordResult('Double prêt prévention', 'PASS', 'Erreur métier correcte');
      } else {
        recordResult('Double prêt prévention', 'FAIL', `Erreur incorrecte: ${error.message}`);
      }
    }

    // Vérifier qu'un seul Loan actif existe
    const activeLoans = await Loan.countDocuments({ equipment: testEquipment._id, status: LOAN_STATUS.ACTIVE });
    if (activeLoans === 1) {
      recordResult('Double prêt vérification DB', 'PASS', 'Un seul Loan actif');
    } else {
      recordResult('Double prêt vérification DB', 'FAIL', `${activeLoans} Loans actifs`);
    }

  } catch (error) {
    recordResult('Test disponibilité', 'FAIL', error.message);
  }

  // === TEST 6: Test concurrence ===
  console.log('\n=== TEST 6: TEST CONCURRENCE ===');
  try {
    // Créer un autre équipement pour le test de concurrence
    const testEquipment2 = await Equipment.create({
      name: 'Test Equipment Loan 2',
      assetId: 'TEST-LOAN-002',
      serialNumber: 'SNLOAN002',
      category: 'Médical',
      type: 'wheelchair',
      condition: EQUIPMENT_CONDITION.GOOD,
      status: EQUIPMENT_STATUS.AVAILABLE
    });

    const loanData = {
      patient: testPatient._id,
      equipment: testEquipment2._id,
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      conditionAtLoan: EQUIPMENT_CONDITION.GOOD
    };

    // Simuler deux créations simultanées
    const [loan1, loan2] = await Promise.allSettled([
      createLoan(loanData, testUser._id),
      createLoan(loanData, testUser._id)
    ]);

    const successCount = [loan1, loan2].filter(result => result.status === 'fulfilled').length;
    const failureCount = [loan1, loan2].filter(result => result.status === 'rejected').length;

    if (successCount === 1 && failureCount === 1) {
      recordResult('Concurrence résultat', 'PASS', 'Un succès, un échec');
    } else {
      recordResult('Concurrence résultat', 'FAIL', `${successCount} succès, ${failureCount} échecs`);
    }

    // Vérifier qu'un seul Loan actif existe
    const activeLoans = await Loan.countDocuments({ equipment: testEquipment2._id, status: LOAN_STATUS.ACTIVE });
    if (activeLoans === 1) {
      recordResult('Concurrence vérification DB', 'PASS', 'Un seul Loan actif');
    } else {
      recordResult('Concurrence vérification DB', 'FAIL', `${activeLoans} Loans actifs`);
    }

    // Nettoyer
    await Equipment.findByIdAndDelete(testEquipment2._id);

  } catch (error) {
    recordResult('Test concurrence', 'FAIL', error.message);
  }

  // === TEST 7: Test Return ===
  console.log('\n=== TEST 7: TEST RETURN ===');
  try {
    // Nettoyer d'abord tous les loans existants pour ce test
    await Loan.deleteMany({ patient: testPatient._id });
    await Patient.findByIdAndUpdate(testPatient._id, {
      borrowedEquipment: [],
      activeLoans: 0
    });

    // Créer un nouveau loan pour le test return
    const returnLoanData = {
      patient: testPatient._id,
      equipment: testEquipment._id,
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      conditionAtLoan: EQUIPMENT_CONDITION.GOOD
    };

    testLoan = await createLoan(returnLoanData, testUser._id);

    const returnData = {
      conditionAtReturn: EQUIPMENT_CONDITION.GOOD,
      returnNotes: 'Test return'
    };

    const returnedLoan = await returnLoan(testLoan._id, returnData, testUser._id);

    if (returnedLoan.status === LOAN_STATUS.RETURNED) {
      recordResult('Return statut', 'PASS', 'Status = returned');
    } else {
      recordResult('Return statut', 'FAIL', `Status = ${returnedLoan.status}`);
    }

    if (returnedLoan.actualReturnDate !== null) {
      recordResult('Return actualReturnDate', 'PASS', 'Date de retour définie');
    } else {
      recordResult('Return actualReturnDate', 'FAIL', 'Date de retour non définie');
    }

    if (returnedLoan.returnedBy.toString() === testUser._id.toString()) {
      recordResult('Return returnedBy', 'PASS', 'Utilisateur correct');
    } else {
      recordResult('Return returnedBy', 'FAIL', 'Utilisateur incorrect');
    }

    // Vérifier Patient cache
    const patientAfterReturn = await Patient.findById(testPatient._id);
    if (!patientAfterReturn.borrowedEquipment.includes(testEquipment._id.toString())) {
      recordResult('Return Patient cache cleanup', 'PASS', 'Équipement retiré');
    } else {
      recordResult('Return Patient cache cleanup', 'FAIL', 'Équipement encore présent');
    }

    if (patientAfterReturn.activeLoans === 0) {
      recordResult('Return Patient activeLoans', 'PASS', 'activeLoans = 0');
    } else {
      recordResult('Return Patient activeLoans', 'FAIL', `activeLoans = ${patientAfterReturn.activeLoans}`);
    }

  } catch (error) {
    recordResult('Test Return', 'FAIL', error.message);
  }

  // === TEST 8: Test Double Return ===
  console.log('\n=== TEST 8: TEST DOUBLE RETURN ===');
  try {
    // Créer un nouveau loan pour le test double return
    await Patient.findByIdAndUpdate(testPatient._id, {
      borrowedEquipment: [],
      activeLoans: 0
    });

    const doubleReturnLoanData = {
      patient: testPatient._id,
      equipment: testEquipment._id,
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      conditionAtLoan: EQUIPMENT_CONDITION.GOOD
    };

    const doubleReturnLoan = await createLoan(doubleReturnLoanData, testUser._id);

    const returnData = {
      conditionAtReturn: EQUIPMENT_CONDITION.GOOD
    };

    try {
      await returnLoan(doubleReturnLoan._id, returnData, testUser._id);
      recordResult('Double return prévention', 'FAIL', 'Deuxième return réussi (ne devrait pas arriver)');
    } catch (error) {
      if (error.message === 'LOAN_ALREADY_RETURNED') {
        recordResult('Double return prévention', 'PASS', 'Erreur métier correcte');
      } else {
        recordResult('Double return prévention', 'FAIL', `Erreur incorrecte: ${error.message}`);
      }
    }

    // Vérifier que le Loan reste returned
    const loanAfterDoubleReturn = await Loan.findById(doubleReturnLoan._id);
    if (loanAfterDoubleReturn.status === LOAN_STATUS.RETURNED) {
      recordResult('Double return statut inchangé', 'PASS', 'Status reste returned');
    } else {
      recordResult('Double return statut inchangé', 'FAIL', `Status = ${loanAfterDoubleReturn.status}`);
    }

  } catch (error) {
    recordResult('Test Double Return', 'FAIL', error.message);
  }

  // === TEST 9: Test Cancel ===
  console.log('\n=== TEST 9: TEST CANCEL ===');
  try {
    // Créer un nouveau Loan pour le test cancel
    const cancelLoanData = {
      patient: testPatient._id,
      equipment: testEquipment._id,
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      conditionAtLoan: EQUIPMENT_CONDITION.GOOD
    };

    const loanToCancel = await createLoan(cancelLoanData, testUser._id);

    const cancelData = {
      cancellationReason: 'Test cancellation'
    };

    const cancelledLoan = await cancelLoan(loanToCancel._id, cancelData, testUser._id);

    if (cancelledLoan.status === LOAN_STATUS.CANCELLED) {
      recordResult('Cancel statut', 'PASS', 'Status = cancelled');
    } else {
      recordResult('Cancel statut', 'FAIL', `Status = ${cancelledLoan.status}`);
    }

    if (cancelledLoan.cancelledDate !== null) {
      recordResult('Cancel cancelledDate', 'PASS', 'Date d\'annulation définie');
    } else {
      recordResult('Cancel cancelledDate', 'FAIL', 'Date d\'annulation non définie');
    }

    if (cancelledLoan.cancelledBy.toString() === testUser._id.toString()) {
      recordResult('Cancel cancelledBy', 'PASS', 'Utilisateur correct');
    } else {
      recordResult('Cancel cancelledBy', 'FAIL', 'Utilisateur incorrect');
    }

    if (cancelledLoan.cancellationReason === 'Test cancellation') {
      recordResult('Cancel cancellationReason', 'PASS', 'Raison correcte');
    } else {
      recordResult('Cancel cancellationReason', 'FAIL', 'Raison incorrecte');
    }

    // Vérifier Patient cache
    const patientAfterCancel = await Patient.findById(testPatient._id);
    if (!patientAfterCancel.borrowedEquipment.includes(testEquipment._id.toString())) {
      recordResult('Cancel Patient cache cleanup', 'PASS', 'Équipement retiré');
    } else {
      recordResult('Cancel Patient cache cleanup', 'FAIL', 'Équipement encore présent');
    }

    // Vérifier qu'un nouvel emprunt est possible
    const newLoanData = {
      patient: testPatient._id,
      equipment: testEquipment._id,
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      conditionAtLoan: EQUIPMENT_CONDITION.GOOD
    };

    const newLoan = await createLoan(newLoanData, testUser._id);
    if (newLoan.status === LOAN_STATUS.ACTIVE) {
      recordResult('Cancel nouvel emprunt possible', 'PASS', 'Nouveau prêt créé après cancel');
    } else {
      recordResult('Cancel nouvel emprunt possible', 'FAIL', 'Nouveau prêt non créé');
    }

    testLoan = newLoan; // Mettre à jour pour les tests suivants

  } catch (error) {
    recordResult('Test Cancel', 'FAIL', error.message);
  }

  // === TEST 10: Test Cancel sans raison ===
  console.log('\n=== TEST 10: TEST CANCEL SANS RAISON ===');
  try {
    const cancelData = {};

    try {
      await cancelLoan(testLoan._id, cancelData, testUser._id);
      recordResult('Cancel sans raison prévention', 'FAIL', 'Cancel réussi sans raison (ne devrait pas arriver)');
    } catch (error) {
      if (error.message === 'CANCELLATION_REASON_REQUIRED') {
        recordResult('Cancel sans raison prévention', 'PASS', 'Erreur métier correcte');
      } else {
        recordResult('Cancel sans raison prévention', 'FAIL', `Erreur incorrecte: ${error.message}`);
      }
    }

    // Vérifier que le Loan reste actif
    const loanAfterFailedCancel = await Loan.findById(testLoan._id);
    if (loanAfterFailedCancel.status === LOAN_STATUS.ACTIVE) {
      recordResult('Cancel sans raison statut inchangé', 'PASS', 'Status reste active');
    } else {
      recordResult('Cancel sans raison statut inchangé', 'FAIL', `Status = ${loanAfterFailedCancel.status}`);
    }

  } catch (error) {
    recordResult('Test Cancel sans raison', 'FAIL', error.message);
  }

  // === TEST 11: Test Overdue ===
  console.log('\n=== TEST 11: TEST OVERDUE ===');
  try {
    // Créer un Loan avec une date passée (bypass validation)
    const overdueLoanDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 jours dans le passé
    const overdueReturnDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // 14 jours dans le passé

    // D'abord retourner le loan actif
    await returnLoan(testLoan._id, { conditionAtReturn: EQUIPMENT_CONDITION.GOOD }, testUser._id);

    // Créer directement le loan avec date passée (bypass validation)
    const overdueLoan = await Loan.create([{
      patient: testPatient._id,
      equipment: testEquipment._id,
      loanDate: overdueLoanDate,
      expectedReturnDate: overdueReturnDate,
      conditionAtLoan: EQUIPMENT_CONDITION.GOOD,
      status: LOAN_STATUS.ACTIVE,
      createdBy: testUser._id
    }], { validateBeforeSave: false });

    const overdueLoanDoc = overdueLoan[0];

    // Mettre à jour le cache Patient manuellement (car nous avons bypassé le service)
    await Patient.findByIdAndUpdate(testPatient._id, {
      $push: { borrowedEquipment: testEquipment._id },
      $inc: { activeLoans: 1 }
    });

    // Vérifier le statut
    if (overdueLoanDoc.status === LOAN_STATUS.ACTIVE) {
      recordResult('Overdue statut', 'PASS', 'Status = active (pas overdue)');
    } else {
      recordResult('Overdue statut', 'FAIL', `Status = ${overdueLoanDoc.status}`);
    }

    // Vérifier le virtual isOverdue
    if (overdueLoanDoc.isOverdue === true) {
      recordResult('Overdue virtual isOverdue', 'PASS', 'isOverdue = true');
    } else {
      recordResult('Overdue virtual isOverdue', 'FAIL', `isOverdue = ${overdueLoanDoc.isOverdue}`);
    }

    // Tester GET /api/loans/overdue
    const overdueLoans = await getOverdueLoans();
    if (overdueLoans.some(loan => loan._id.toString() === overdueLoanDoc._id.toString())) {
      recordResult('Overdue API endpoint', 'PASS', 'Loan trouvé dans overdue');
    } else {
      recordResult('Overdue API endpoint', 'FAIL', 'Loan non trouvé dans overdue');
    }

    testLoan = overdueLoanDoc; // Mettre à jour pour les tests suivants

  } catch (error) {
    recordResult('Test Overdue', 'FAIL', error.message);
  }

  // === TEST 12: Test Historique ===
  console.log('\n=== TEST 12: TEST HISTORIQUE ===');
  try {
    // Nettoyer les loans existants
    await Loan.deleteMany({ patient: testPatient._id });
    await Patient.findByIdAndUpdate(testPatient._id, {
      borrowedEquipment: [],
      activeLoans: 0
    });

    // Créer quelques loans pour l'historique
    const historyLoan1 = await createLoan({
      patient: testPatient._id,
      equipment: testEquipment._id,
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      conditionAtLoan: EQUIPMENT_CONDITION.GOOD
    }, testUser._id);

    await returnLoan(historyLoan1._id, { conditionAtReturn: EQUIPMENT_CONDITION.GOOD }, testUser._id);

    const historyLoan2 = await createLoan({
      patient: testPatient._id,
      equipment: testEquipment._id,
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      conditionAtLoan: EQUIPMENT_CONDITION.GOOD
    }, testUser._id);

    await cancelLoan(historyLoan2._id, { cancellationReason: 'Test' }, testUser._id);

    // Vérifier que les Loans sont toujours visibles
    const allLoans = await Loan.find({ patient: testPatient._id });
    if (allLoans.length === 2) {
      recordResult('Historique visibilité', 'PASS', '2 loans historiques visibles');
    } else {
      recordResult('Historique visibilité', 'FAIL', `${allLoans.length} loans (attendu 2)`);
    }

    // Vérifier les statuts
    const returnedLoan = allLoans.find(l => l.status === LOAN_STATUS.RETURNED);
    const cancelledLoan = allLoans.find(l => l.status === LOAN_STATUS.CANCELLED);

    if (returnedLoan && cancelledLoan) {
      recordResult('Historique statuts', 'PASS', 'Loans returned et cancelled présents');
    } else {
      recordResult('Historique statuts', 'FAIL', 'Statuts incorrects');
    }

    // Créer un loan actif pour les tests suivants
    testLoan = await createLoan({
      patient: testPatient._id,
      equipment: testEquipment._id,
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      conditionAtLoan: EQUIPMENT_CONDITION.GOOD
    }, testUser._id);

  } catch (error) {
    recordResult('Test Historique', 'FAIL', error.message);
  }

  // === TEST 13: Test Permissions ===
  console.log('\n=== TEST 13: TEST PERMISSIONS ===');
  try {
    const loanRoutesPath = path.join(__dirname, '../routes/loanRoutes.js');
    const loanRoutesContent = fs.readFileSync(loanRoutesPath, 'utf-8');

    if (loanRoutesContent.includes('protect') && loanRoutesContent.includes('authorizePage')) {
      recordResult('Permissions middleware', 'PASS', 'protect et authorizePage présents');
    } else {
      recordResult('Permissions middleware', 'FAIL', 'Middleware manquant');
    }

  } catch (error) {
    recordResult('Test Permissions', 'FAIL', error.message);
  }

  // === TEST 14: Test Routes ===
  console.log('\n=== TEST 14: TEST ROUTES ===');
  try {
    const loanRoutesPath = path.join(__dirname, '../routes/loanRoutes.js');
    const loanRoutesContent = fs.readFileSync(loanRoutesPath, 'utf-8');

    const requiredRoutes = ['/stats', '/overdue', '/patient/:patientId', '/equipment/:equipmentId'];
    let routesCheck = true;
    for (const route of requiredRoutes) {
      if (!loanRoutesContent.includes(route)) {
        console.log(`❌ Route ${route} manquante`);
        routesCheck = false;
      }
    }

    if (routesCheck) {
      recordResult('Routes spécifiques avant /:id', 'PASS', 'Toutes les routes spécifiques présentes');
    } else {
      recordResult('Routes spécifiques avant /:id', 'FAIL', 'Routes manquantes');
    }

  } catch (error) {
    recordResult('Test Routes', 'FAIL', error.message);
  }

  // === TEST 15: Index MongoDB ===
  console.log('\n=== TEST 15: INDEX MONGODB ===');
  try {
    const loanModelPath = path.join(__dirname, '../models/Loan.js');
    const loanModelContent = fs.readFileSync(loanModelPath, 'utf-8');

    const hasUniquePartialIndex = loanModelContent.includes('unique: true') && 
                                      loanModelContent.includes('partialFilterExpression') &&
                                      loanModelContent.includes('status: LOAN_STATUS.ACTIVE');

    if (hasUniquePartialIndex) {
      recordResult('Index unique partiel', 'PASS', 'Index de protection contre double prêt présent');
    } else {
      recordResult('Index unique partiel', 'FAIL', 'Index de protection manquant');
    }

  } catch (error) {
    recordResult('Test Index MongoDB', 'FAIL', error.message);
  }

  // === TEST 16: Test Logs ===
  console.log('\n=== TEST 16: TEST LOGS ===');
  try {
    const loanServicePath = path.join(__dirname, '../services/loanService.js');
    const loanServiceContent = fs.readFileSync(loanServicePath, 'utf-8');

    const hasLogger = loanServiceContent.includes('logger.');
    const hasConsoleLog = loanServiceContent.includes('console.log') || loanServiceContent.includes('console.error');

    if (hasLogger && !hasConsoleLog) {
      recordResult('Logs Winston', 'PASS', 'Utilisation de logger, pas de console.log');
    } else if (hasLogger && hasConsoleLog) {
      recordResult('Logs Winston', 'FAIL', 'Présence de console.log/console.error');
    } else {
      recordResult('Logs Winston', 'FAIL', 'Logger non utilisé');
    }

  } catch (error) {
    recordResult('Test Logs', 'FAIL', error.message);
  }

  // Nettoyage final
  console.log('\n=== NETTOYAGE FINAL ===');
  await cleanupTestData();
  await Patient.findByIdAndDelete(testPatient._id);
  await Equipment.findByIdAndDelete(testEquipment._id);
  console.log('✅ Données de test nettoyées');

  // Fermer la connexion
  await mongoose.connection.close();
  console.log('✅ Connexion MongoDB fermée');

} catch (error) {
  console.error('Erreur fatale:', error.message);
  process.exit(1);
}

// === RAPPORT FINAL ===
console.log('\n' + '='.repeat(50));
console.log('RAPPORT FINAL DES TESTS');
console.log('='.repeat(50) + '\n');

let passCount = 0;
let failCount = 0;

testResults.forEach(result => {
  if (result.status === 'PASS') passCount++;
  if (result.status === 'FAIL') failCount++;
  console.log(`${result.status === 'PASS' ? '✅' : '❌'} ${result.test}: ${result.status}`);
  if (result.details) {
    console.log(`   ${result.details}`);
  }
});

console.log('\n' + '-'.repeat(50));
console.log(`TOTAL: ${testResults.length} tests`);
console.log(`PASS: ${passCount}`);
console.log(`FAIL: ${failCount}`);
console.log('-'.repeat(50));

if (failCount === 0) {
  console.log('\n✅ TOUS LES TESTS RÉUSSIS');
  process.exit(0);
} else {
  console.log('\n❌ CERTAINS TESTS ONT ÉCHOUÉ');
  process.exit(1);
}
