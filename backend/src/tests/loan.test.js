import mongoose from 'mongoose';
import { describe, test, beforeAll, afterAll, beforeEach, expect } from '@jest/globals';
import {
  createLoan,
  returnLoan,
  cancelLoan,
  getOverdueLoans,
  getLoanStats,
  getLoansByPatient,
  getLoansByEquipment
} from '../services/loanService.js';
import Loan from '../models/Loan.js';
import Patient from '../models/Patient.js';
import Equipment from '../models/Equipment.js';
import User from '../models/User.js';
import { LOAN_STATUS, EQUIPMENT_STATUS, EQUIPMENT_CONDITION } from '../config/constants.js';

describe('Loan Service Tests', () => {
  let testPatient;
  let testEquipment;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up collections
    await Loan.deleteMany({});
    await Equipment.deleteMany({});
    await Patient.deleteMany({});
    await User.deleteMany({});

    // Create test user
    testUser = await User.create({
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Create test patient
    testPatient = await Patient.create({
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      address: '123 Test Street',
      borrowedEquipment: [],
      activeLoans: 0
    });

    // Create test equipment
    testEquipment = await Equipment.create({
      name: 'Test Equipment',
      assetId: 'TEST-001',
      serialNumber: 'SN12345',
      category: 'mobility',
      type: 'wheelchair',
      condition: EQUIPMENT_CONDITION.GOOD,
      status: EQUIPMENT_STATUS.AVAILABLE
    });
  });

  describe('createLoan', () => {
    test('should create a loan successfully', async () => {
      const loanData = {
        patient: testPatient._id,
        equipment: testEquipment._id,
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD,
        notes: 'Test loan'
      };

      const loan = await createLoan(loanData, testUser._id);

      expect(loan).toBeDefined();
      expect(loan.status).toBe(LOAN_STATUS.ACTIVE);
      expect(loan.patient.toString()).toBe(testPatient._id.toString());
      expect(loan.equipment.toString()).toBe(testEquipment._id.toString());
      expect(loan.createdBy.toString()).toBe(testUser._id.toString());

      // Verify patient cache updated
      const updatedPatient = await Patient.findById(testPatient._id);
      expect(updatedPatient.borrowedEquipment).toContain(testEquipment._id.toString());
      expect(updatedPatient.activeLoans).toBe(1);
    });

    test('should fail if patient not found', async () => {
      const fakePatientId = new mongoose.Types.ObjectId();
      const loanData = {
        patient: fakePatientId,
        equipment: testEquipment._id,
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD
      };

      await expect(createLoan(loanData, testUser._id)).rejects.toThrow('PATIENT_NOT_FOUND');
    });

    test('should fail if equipment not found', async () => {
      const fakeEquipmentId = new mongoose.Types.ObjectId();
      const loanData = {
        patient: testPatient._id,
        equipment: fakeEquipmentId,
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD
      };

      await expect(createLoan(loanData, testUser._id)).rejects.toThrow('EQUIPMENT_NOT_FOUND');
    });

    test('should fail if equipment is in maintenance', async () => {
      await Equipment.findByIdAndUpdate(testEquipment._id, { status: EQUIPMENT_STATUS.MAINTENANCE });

      const loanData = {
        patient: testPatient._id,
        equipment: testEquipment._id,
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD
      };

      await expect(createLoan(loanData, testUser._id)).rejects.toThrow('EQUIPMENT_IN_MAINTENANCE');
    });

    test('should fail if equipment is lost', async () => {
      await Equipment.findByIdAndUpdate(testEquipment._id, { status: EQUIPMENT_STATUS.LOST });

      const loanData = {
        patient: testPatient._id,
        equipment: testEquipment._id,
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD
      };

      await expect(createLoan(loanData, testUser._id)).rejects.toThrow('EQUIPMENT_LOST');
    });

    test('should fail if equipment is decommissioned', async () => {
      await Equipment.findByIdAndUpdate(testEquipment._id, { status: EQUIPMENT_STATUS.DECOMMISSIONED });

      const loanData = {
        patient: testPatient._id,
        equipment: testEquipment._id,
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD
      };

      await expect(createLoan(loanData, testUser._id)).rejects.toThrow('EQUIPMENT_DECOMMISSIONED');
    });

    test('should fail if equipment is already loaned', async () => {
      // Create first loan
      await createLoan({
        patient: testPatient._id,
        equipment: testEquipment._id,
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD
      }, testUser._id);

      // Try to create second loan
      const loanData = {
        patient: testPatient._id,
        equipment: testEquipment._id,
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD
      };

      await expect(createLoan(loanData, testUser._id)).rejects.toThrow('EQUIPMENT_ALREADY_LOANED');
    });

    test('should fail if return date is invalid', async () => {
      const loanData = {
        patient: testPatient._id,
        equipment: testEquipment._id,
        expectedReturnDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD
      };

      await expect(createLoan(loanData, testUser._id)).rejects.toThrow('INVALID_RETURN_DATE');
    });
  });

  describe('returnLoan', () => {
    beforeEach(async () => {
      // Create a test loan
      await createLoan({
        patient: testPatient._id,
        equipment: testEquipment._id,
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD
      }, testUser._id);
    });

    test('should return a loan successfully', async () => {
      const loan = await Loan.findOne({ status: LOAN_STATUS.ACTIVE });
      const returnData = {
        conditionAtReturn: EQUIPMENT_CONDITION.GOOD,
        returnNotes: 'Returned in good condition'
      };

      const returnedLoan = await returnLoan(loan._id, returnData, testUser._id);

      expect(returnedLoan.status).toBe(LOAN_STATUS.RETURNED);
      expect(returnedLoan.conditionAtReturn).toBe(EQUIPMENT_CONDITION.GOOD);
      expect(returnedLoan.returnNotes).toBe('Returned in good condition');
      expect(returnedLoan.returnedBy.toString()).toBe(testUser._id.toString());
      expect(returnedLoan.actualReturnDate).toBeDefined();

      // Verify patient cache updated
      const updatedPatient = await Patient.findById(testPatient._id);
      expect(updatedPatient.borrowedEquipment).not.toContain(testEquipment._id.toString());
      expect(updatedPatient.activeLoans).toBe(0);
    });

    test('should fail if loan not found', async () => {
      const fakeLoanId = new mongoose.Types.ObjectId();
      const returnData = {
        conditionAtReturn: EQUIPMENT_CONDITION.GOOD
      };

      await expect(returnLoan(fakeLoanId, returnData, testUser._id)).rejects.toThrow('LOAN_NOT_FOUND');
    });

    test('should fail if loan already returned', async () => {
      const loan = await Loan.findOne({ status: LOAN_STATUS.ACTIVE });
      await returnLoan(loan._id, { conditionAtReturn: EQUIPMENT_CONDITION.GOOD }, testUser._id);

      await expect(returnLoan(loan._id, { conditionAtReturn: EQUIPMENT_CONDITION.GOOD }, testUser._id))
        .rejects.toThrow('LOAN_ALREADY_RETURNED');
    });

    test('should fail if loan already cancelled', async () => {
      const loan = await Loan.findOne({ status: LOAN_STATUS.ACTIVE });
      await cancelLoan(loan._id, { cancellationReason: 'Test cancellation' }, testUser._id);

      await expect(returnLoan(loan._id, { conditionAtReturn: EQUIPMENT_CONDITION.GOOD }, testUser._id))
        .rejects.toThrow('LOAN_ALREADY_CANCELLED');
    });
  });

  describe('cancelLoan', () => {
    beforeEach(async () => {
      // Create a test loan
      await createLoan({
        patient: testPatient._id,
        equipment: testEquipment._id,
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD
      }, testUser._id);
    });

    test('should cancel a loan successfully', async () => {
      const loan = await Loan.findOne({ status: LOAN_STATUS.ACTIVE });
      const cancelData = {
        cancellationReason: 'Patient cancelled request'
      };

      const cancelledLoan = await cancelLoan(loan._id, cancelData, testUser._id);

      expect(cancelledLoan.status).toBe(LOAN_STATUS.CANCELLED);
      expect(cancelledLoan.cancellationReason).toBe('Patient cancelled request');
      expect(cancelledLoan.cancelledBy.toString()).toBe(testUser._id.toString());
      expect(cancelledLoan.cancelledDate).toBeDefined();

      // Verify patient cache updated
      const updatedPatient = await Patient.findById(testPatient._id);
      expect(updatedPatient.borrowedEquipment).not.toContain(testEquipment._id.toString());
      expect(updatedPatient.activeLoans).toBe(0);
    });

    test('should fail if cancellation reason is missing', async () => {
      const loan = await Loan.findOne({ status: LOAN_STATUS.ACTIVE });

      await expect(cancelLoan(loan._id, {}, testUser._id)).rejects.toThrow('CANCELLATION_REASON_REQUIRED');
    });

    test('should fail if loan not found', async () => {
      const fakeLoanId = new mongoose.Types.ObjectId();

      await expect(cancelLoan(fakeLoanId, { cancellationReason: 'Test' }, testUser._id))
        .rejects.toThrow('LOAN_NOT_FOUND');
    });

    test('should fail if loan already returned', async () => {
      const loan = await Loan.findOne({ status: LOAN_STATUS.ACTIVE });
      await returnLoan(loan._id, { conditionAtReturn: EQUIPMENT_CONDITION.GOOD }, testUser._id);

      await expect(cancelLoan(loan._id, { cancellationReason: 'Test' }, testUser._id))
        .rejects.toThrow('LOAN_ALREADY_RETURNED');
    });

    test('should fail if loan already cancelled', async () => {
      const loan = await Loan.findOne({ status: LOAN_STATUS.ACTIVE });
      await cancelLoan(loan._id, { cancellationReason: 'First cancellation' }, testUser._id);

      await expect(cancelLoan(loan._id, { cancellationReason: 'Second cancellation' }, testUser._id))
        .rejects.toThrow('LOAN_ALREADY_CANCELLED');
    });
  });

  describe('getOverdueLoans', () => {
    test('should return overdue loans', async () => {
      // Create an overdue loan
      await Loan.create({
        patient: testPatient._id,
        equipment: testEquipment._id,
        loanDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        expectedReturnDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD,
        status: LOAN_STATUS.ACTIVE,
        createdBy: testUser._id
      });

      // Create a non-overdue loan
      await Loan.create({
        patient: testPatient._id,
        equipment: testEquipment._id,
        loanDate: new Date(),
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD,
        status: LOAN_STATUS.ACTIVE,
        createdBy: testUser._id
      });

      const overdueLoans = await getOverdueLoans();
      expect(overdueLoans).toHaveLength(1);
      expect(overdueLoans[0].status).toBe(LOAN_STATUS.ACTIVE);
    });
  });

  describe('getLoanStats', () => {
    test('should return correct statistics', async () => {
      // Create active loan
      await Loan.create({
        patient: testPatient._id,
        equipment: testEquipment._id,
        loanDate: new Date(),
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD,
        status: LOAN_STATUS.ACTIVE,
        createdBy: testUser._id
      });

      // Create returned loan
      await Loan.create({
        patient: testPatient._id,
        equipment: testEquipment._id,
        loanDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        expectedReturnDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        actualReturnDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD,
        conditionAtReturn: EQUIPMENT_CONDITION.GOOD,
        status: LOAN_STATUS.RETURNED,
        createdBy: testUser._id,
        returnedBy: testUser._id
      });

      // Create cancelled loan
      await Loan.create({
        patient: testPatient._id,
        equipment: testEquipment._id,
        loanDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        cancelledDate: new Date(),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD,
        status: LOAN_STATUS.CANCELLED,
        createdBy: testUser._id,
        cancelledBy: testUser._id,
        cancellationReason: 'Test'
      });

      const stats = await getLoanStats();
      expect(stats.total).toBe(3);
      expect(stats.active).toBe(1);
      expect(stats.returned).toBe(1);
      expect(stats.cancelled).toBe(1);
    });
  });

  describe('getLoansByPatient', () => {
    test('should return loans for a patient', async () => {
      await Loan.create({
        patient: testPatient._id,
        equipment: testEquipment._id,
        loanDate: new Date(),
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD,
        status: LOAN_STATUS.ACTIVE,
        createdBy: testUser._id
      });

      const loans = await getLoansByPatient(testPatient._id);
      expect(loans).toHaveLength(1);
      expect(loans[0].patient._id.toString()).toBe(testPatient._id.toString());
    });
  });

  describe('getLoansByEquipment', () => {
    test('should return loans for equipment', async () => {
      await Loan.create({
        patient: testPatient._id,
        equipment: testEquipment._id,
        loanDate: new Date(),
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD,
        status: LOAN_STATUS.ACTIVE,
        createdBy: testUser._id
      });

      const loans = await getLoansByEquipment(testEquipment._id);
      expect(loans).toHaveLength(1);
      expect(loans[0].equipment._id.toString()).toBe(testEquipment._id.toString());
    });
  });

  describe('Concurrency Tests', () => {
    test('should prevent concurrent loans on same equipment', async () => {
      const loanData = {
        patient: testPatient._id,
        equipment: testEquipment._id,
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditionAtLoan: EQUIPMENT_CONDITION.GOOD
      };

      // Try to create two loans simultaneously
      const [loan1, loan2] = await Promise.allSettled([
        createLoan(loanData, testUser._id),
        createLoan(loanData, testUser._id)
      ]);

      // One should succeed, one should fail
      const successCount = [loan1, loan2].filter(result => result.status === 'fulfilled').length;
      const failureCount = [loan1, loan2].filter(result => result.status === 'rejected').length;

      expect(successCount).toBe(1);
      expect(failureCount).toBe(1);

      // Verify only one active loan exists
      const activeLoans = await Loan.countDocuments({ equipment: testEquipment._id, status: LOAN_STATUS.ACTIVE });
      expect(activeLoans).toBe(1);
    });
  });
});
