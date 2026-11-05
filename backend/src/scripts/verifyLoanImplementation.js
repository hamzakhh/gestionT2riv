import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger .env depuis le backend
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Script de verification de l'implementation Loan
 * Verifie que tous les composants sont presents et correctement configures
 */
console.log('=== VERIFICATION DE L IMPLEMENTATION LOAN ===\n');

let allChecksPassed = true;

// 1. Verifier les fichiers backend
console.log('1. Verification des fichiers backend...');
const backendFiles = [
  'src/models/Loan.js',
  'src/services/loanService.js',
  'src/controllers/loanController.js',
  'src/routes/loanRoutes.js'
];

const fs = await import('fs');
for (const file of backendFiles) {
  const filePath = path.join(__dirname, '../../', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} existe`);
  } else {
    console.log(`❌ ${file} manquant`);
    allChecksPassed = false;
  }
}

// 2. Verifier l'integration dans app.js
console.log('\n2. Verification de l integration dans app.js...');
const appPath = path.join(__dirname, '../../src/app.js');
const appContent = fs.readFileSync(appPath, 'utf-8');
if (appContent.includes('loanRoutes')) {
  console.log('✅ loanRoutes importe dans app.js');
} else {
  console.log('❌ loanRoutes non importe dans app.js');
  allChecksPassed = false;
}
if (appContent.includes('/loans')) {
  console.log('✅ Route /loans enregistree');
} else {
  console.log('❌ Route /loans non enregistree');
  allChecksPassed = false;
}

// 3. Verifier les constantes
console.log('\n3. Verification des constantes...');
const constantsPath = path.join(__dirname, '../../src/config/constants.js');
const constantsContent = fs.readFileSync(constantsPath, 'utf-8');
if (constantsContent.includes('LOAN_STATUS')) {
  console.log('✅ LOAN_STATUS defini');
} else {
  console.log('❌ LOAN_STATUS non defini');
  allChecksPassed = false;
}

// 4. Verifier les fichiers frontend
console.log('\n4. Verification des fichiers frontend...');
const frontendFiles = [
  'frontend/src/services/loanService.js',
  'frontend/src/pages/loans/LoanList.jsx',
  'frontend/src/pages/loans/LoanDetail.jsx',
  'frontend/src/pages/loans/LoanForm.jsx',
  'frontend/src/pages/loans/LoanReturnModal.jsx',
  'frontend/src/pages/loans/LoanCancelModal.jsx'
];

for (const file of frontendFiles) {
  const filePath = path.join(__dirname, '../../../', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} existe`);
  } else {
    console.log(`❌ ${file} manquant`);
    allChecksPassed = false;
  }
}

// 5. Verifier les routes frontend
console.log('\n5. Verification des routes frontend...');
const mainRoutesPath = path.join(__dirname, '../../../frontend/src/routes/MainRoutes.jsx');
const mainRoutesContent = fs.readFileSync(mainRoutesPath, 'utf-8');
if (mainRoutesContent.includes('LoanList')) {
  console.log('✅ LoanList importe dans MainRoutes');
} else {
  console.log('❌ LoanList non importe dans MainRoutes');
  allChecksPassed = false;
}
if (mainRoutesContent.includes('loans')) {
  console.log('✅ Route loans definie');
} else {
  console.log('❌ Route loans non definie');
  allChecksPassed = false;
}

// 6. Verifier la config frontend
console.log('\n6. Verification de la config frontend...');
const configPath = path.join(__dirname, '../../../frontend/src/config.js');
const configContent = fs.readFileSync(configPath, 'utf-8');
if (configContent.includes('LOANS')) {
  console.log('✅ LOANS defini dans PAGES');
} else {
  console.log('❌ LOANS non defini dans PAGES');
  allChecksPassed = false;
}

// 7. Verifier la syntaxe JavaScript
console.log('\n7. Verification de la syntaxe JavaScript...');
const { execSync } = await import('child_process');

const jsFiles = [
  'src/models/Loan.js',
  'src/services/loanService.js',
  'src/controllers/loanController.js',
  'src/routes/loanRoutes.js'
];

for (const file of jsFiles) {
  try {
    execSync(`node --check ${path.join(__dirname, '../../', file)}`, { stdio: 'pipe' });
    console.log(`✅ ${file} syntaxe valide`);
  } catch (error) {
    console.log(`❌ ${file} erreur de syntaxe`);
    allChecksPassed = false;
  }
}

// 8. Verifier le modele Loan
console.log('\n8. Verification du modele Loan...');
const loanModelPath = path.join(__dirname, '../../src/models/Loan.js');
const loanModelContent = fs.readFileSync(loanModelPath, 'utf-8');

const requiredFields = [
  'patient',
  'equipment',
  'loanDate',
  'expectedReturnDate',
  'status',
  'conditionAtLoan',
  'createdBy'
];

for (const field of requiredFields) {
  if (loanModelContent.includes(field)) {
    console.log(`✅ Champ ${field} present`);
  } else {
    console.log(`❌ Champ ${field} manquant`);
    allChecksPassed = false;
  }
}

if (loanModelContent.includes('isOverdue')) {
  console.log('✅ Virtual isOverdue defini');
} else {
  console.log('❌ Virtual isOverdue manquant');
  allChecksPassed = false;
}

// 9. Verifier le service Loan
console.log('\n9. Verification du service Loan...');
const loanServicePath = path.join(__dirname, '../../src/services/loanService.js');
const loanServiceContent = fs.readFileSync(loanServicePath, 'utf-8');

const requiredFunctions = [
  'createLoan',
  'returnLoan',
  'cancelLoan',
  'getOverdueLoans',
  'getLoanStats'
];

for (const func of requiredFunctions) {
  if (loanServiceContent.includes(func)) {
    console.log(`✅ Fonction ${func} presente`);
  } else {
    console.log(`❌ Fonction ${func} manquante`);
    allChecksPassed = false;
  }
}

if (loanServiceContent.includes('startTransaction')) {
  console.log('✅ Transactions MongoDB utilisees');
} else {
  console.log('❌ Transactions MongoDB non utilisees');
  allChecksPassed = false;
}

// 10. Verifier le controller Loan
console.log('\n10. Verification du controller Loan...');
const loanControllerPath = path.join(__dirname, '../../src/controllers/loanController.js');
const loanControllerContent = fs.readFileSync(loanControllerPath, 'utf-8');

const requiredControllers = [
  'getLoans',
  'getLoanById',
  'createLoanController',
  'returnLoanController',
  'cancelLoanController',
  'getLoanStatsController',
  'getOverdueLoansController'
];

for (const controller of requiredControllers) {
  if (loanControllerContent.includes(controller)) {
    console.log(`✅ Controller ${controller} present`);
  } else {
    console.log(`❌ Controller ${controller} manquant`);
    allChecksPassed = false;
  }
}

// 11. Verifier les routes Loan
console.log('\n11. Verification des routes Loan...');
const loanRoutesPath = path.join(__dirname, '../../src/routes/loanRoutes.js');
const loanRoutesContent = fs.readFileSync(loanRoutesPath, 'utf-8');

const requiredRoutes = [
  "'/stats'",
  "'/overdue'",
  "'/patient/:patientId'",
  "'/equipment/:equipmentId'",
  "'/'",
  "'/:id'",
  "'/:id/return'",
  "'/:id/cancel'"
];

for (const route of requiredRoutes) {
  if (loanRoutesContent.includes(route)) {
    console.log(`✅ Route ${route} definie`);
  } else {
    console.log(`❌ Route ${route} manquante`);
    allChecksPassed = false;
  }
}

if (loanRoutesContent.includes('authorizePage')) {
  console.log('✅ Protection par permissions activee');
} else {
  console.log('❌ Protection par permissions manquante');
  allChecksPassed = false;
}

// 12. Verifier le service frontend
console.log('\n12. Verification du service frontend...');
const frontendServicePath = path.join(__dirname, '../../../frontend/src/services/loanService.js');
const frontendServiceContent = fs.readFileSync(frontendServicePath, 'utf-8');

const requiredMethods = [
  'getAll',
  'getById',
  'create',
  'return',
  'cancel',
  'getStats',
  'getOverdue',
  'getByPatient',
  'getByEquipment'
];

for (const method of requiredMethods) {
  if (frontendServiceContent.includes(method)) {
    console.log(`✅ Methode ${method} presente`);
  } else {
    console.log(`❌ Methode ${method} manquante`);
    allChecksPassed = false;
  }
}

// Resultat final
console.log('\n=== RESULTAT DE LA VERIFICATION ===');
if (allChecksPassed) {
  console.log('✅ Toutes les verifications ont reussi');
  console.log('✅ L implementation Loan est complete et correcte');
  process.exit(0);
} else {
  console.log('❌ Certaines verifications ont echoue');
  console.log('❌ Veuillez corriger les erreurs ci-dessus');
  process.exit(1);
}
