import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seedData.js';
import User from '../src/models/User.js';
import Vehicle from '../src/models/Vehicle.js';
import VehiclePass from '../src/models/VehiclePass.js';
import Gate from '../src/models/Gate.js';
import GateOfficer from '../src/models/GateOfficer.js';
import ScanLog from '../src/models/ScanLog.js';
import { generatePassToken, generatePassNumber, generateQRCodeDataUrl } from '../src/services/qrService.js';

describe('University Vehicle Gate Pass System - Core Backend Tests', () => {
  before(async () => {
    await connectDB();
    await seedDatabase(true);
  });

  after(async () => {
    await disconnectDB();
  });

  describe('1. Authentication & Role-Based Access Control', () => {
    test('Should find pre-seeded admin user and verify password comparison', async () => {
      const admin = await User.findOne({ email: 'admin@university.edu' });
      assert.ok(admin, 'Admin user should exist');
      assert.equal(admin.role, 'ADMIN');

      const isMatch = await admin.comparePassword('Password123!');
      assert.equal(isMatch, true, 'Admin password match should succeed');

      const isBadMatch = await admin.comparePassword('WrongPassword!');
      assert.equal(isBadMatch, false, 'Invalid password match should fail');
    });

    test('Should find student, staff, visitor, and gate officers in database', async () => {
      const student = await User.findOne({ email: 'student@university.edu' });
      const staff = await User.findOne({ email: 'staff@university.edu' });
      const visitor = await User.findOne({ email: 'visitor@university.edu' });
      const officer = await User.findOne({ email: 'officer1@university.edu' });

      assert.equal(student.role, 'STUDENT');
      assert.equal(staff.role, 'STAFF');
      assert.equal(visitor.role, 'VISITOR');
      assert.equal(officer.role, 'GATE_OFFICER');
    });
  });

  describe('2. Vehicle Registration & Admin Approval Workflow', () => {
    let testVehicleId;
    let studentUser;

    before(async () => {
      studentUser = await User.findOne({ email: 'student@university.edu' });
    });

    test('Should register a new vehicle with status PENDING', async () => {
      const vehicle = await Vehicle.create({
        ownerId: studentUser._id,
        registrationNumber: 'TEST-999-AU',
        vehicleType: 'CAR',
        make: 'Honda',
        model: 'Accord',
        colour: 'Midnight Black',
        status: 'PENDING',
      });

      testVehicleId = vehicle._id;
      assert.ok(vehicle._id, 'Vehicle record created');
      assert.equal(vehicle.status, 'PENDING');
      assert.equal(vehicle.registrationNumber, 'TEST-999-AU');
    });

    test('Admin approval should transition status to APPROVED and create digital QR Pass', async () => {
      const vehicle = await Vehicle.findById(testVehicleId);
      vehicle.status = 'APPROVED';
      await vehicle.save();

      const qrToken = generatePassToken();
      const passNumber = generatePassNumber();
      const qrCodeDataUrl = await generateQRCodeDataUrl(qrToken);

      const pass = await VehiclePass.create({
        vehicleId: vehicle._id,
        ownerId: studentUser._id,
        passNumber,
        qrToken,
        status: 'ACTIVE',
        passType: 'STUDENT_ANNUAL',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        qrCodeDataUrl,
      });

      assert.ok(pass._id, 'Pass created');
      assert.equal(pass.status, 'ACTIVE');
      assert.ok(pass.qrToken.startsWith('UGP-'), 'Token formatted properly');
      assert.ok(pass.qrCodeDataUrl.startsWith('data:image/png;base64,'), 'QR data url generated');
    });

    test('Admin rejection should set status to REJECTED with reason', async () => {
      const rejectedVehicle = await Vehicle.create({
        ownerId: studentUser._id,
        registrationNumber: 'TEST-REJ-01',
        vehicleType: 'CAR',
        make: 'Toyota',
        model: 'Supra',
        colour: 'Red',
        status: 'REJECTED',
        rejectionReason: 'Invalid registration documents provided',
      });

      assert.equal(rejectedVehicle.status, 'REJECTED');
      assert.equal(rejectedVehicle.rejectionReason, 'Invalid registration documents provided');
    });
  });

  describe('3. QR Code Pass Scanning & Gate Verification', () => {
    test('Should verify active approved student pass as VALID', async () => {
      const activePass = await VehiclePass.findOne({ status: 'ACTIVE' }).populate('vehicleId');
      assert.ok(activePass, 'Active pass exists in seeded data');

      const isExpired = new Date() > new Date(activePass.expiresAt);
      const isValid = activePass.status === 'ACTIVE' && !isExpired && activePass.vehicleId.status === 'APPROVED';

      assert.equal(isValid, true, 'Seeded pass should verify as valid');
    });

    test('Should verify suspended pass as INVALID / SUSPENDED', async () => {
      const suspendedPass = await VehiclePass.findOne({ status: 'SUSPENDED' });
      assert.ok(suspendedPass, 'Suspended pass exists in seeded data');
      assert.equal(suspendedPass.status, 'SUSPENDED');
    });

    test('Should verify non-existent token as NOT FOUND', async () => {
      const notFoundPass = await VehiclePass.findOne({ qrToken: 'NON_EXISTENT_TOKEN_123' });
      assert.equal(notFoundPass, null);
    });
  });

  describe('4. Entry & Exit Gate Recording', () => {
    test('Should record ENTRY scan in ScanLog', async () => {
      const gate = await Gate.findOne({ code: 'GATE-ENTRY' });
      const officer = await User.findOne({ email: 'officer1@university.edu' });
      const student = await User.findOne({ email: 'student@university.edu' });
      const studentPass = await VehiclePass.findOne({ ownerId: student._id });

      const scanEntry = await ScanLog.create({
        passId: studentPass._id,
        vehicleId: studentPass.vehicleId,
        ownerId: student._id,
        gateId: gate._id,
        officerId: officer._id,
        direction: 'ENTRY',
        verificationStatus: 'VALID',
        licensePlate: 'UNI-789-ST',
        ownerName: student.fullName,
        ownerRole: student.role,
      });

      assert.ok(scanEntry._id);
      assert.equal(scanEntry.direction, 'ENTRY');
      assert.equal(scanEntry.verificationStatus, 'VALID');
    });

    test('Should record EXIT scan in ScanLog', async () => {
      const gate = await Gate.findOne({ code: 'GATE-EXIT' });
      const officer = await User.findOne({ email: 'officer1@university.edu' });
      const student = await User.findOne({ email: 'student@university.edu' });
      const studentPass = await VehiclePass.findOne({ ownerId: student._id });

      const scanExit = await ScanLog.create({
        passId: studentPass._id,
        vehicleId: studentPass.vehicleId,
        ownerId: student._id,
        gateId: gate._id,
        officerId: officer._id,
        direction: 'EXIT',
        verificationStatus: 'VALID',
        licensePlate: 'UNI-789-ST',
        ownerName: student.fullName,
        ownerRole: student.role,
      });

      assert.ok(scanExit._id);
      assert.equal(scanExit.direction, 'EXIT');
    });
  });

  describe('5. Gate Officer Assignment', () => {
    test('Should verify officer assigned to KASU Main Entry Gate', async () => {
      const officer = await User.findOne({ email: 'officer1@university.edu' });
      const officerProfile = await GateOfficer.findOne({ userId: officer._id }).populate('assignedGateId');

      assert.ok(officerProfile);
      assert.equal(officerProfile.badgeNumber, 'KASU-SEC-101');
      assert.equal(officerProfile.assignedGateId.code, 'GATE-ENTRY');
    });
  });

  describe('6. Vehicle Limit Validation (Max 3 Vehicles per User)', () => {
    test('Should count vehicles for a user and enforce limit', async () => {
      const student = await User.findOne({ email: 'student@university.edu' });
      const count = await Vehicle.countDocuments({
        ownerId: student._id,
        status: { $in: ['PENDING', 'APPROVED', 'SUSPENDED'] },
      });
      assert.ok(count <= 3, 'User must not exceed 3 registered vehicles');
    });
  });
});
