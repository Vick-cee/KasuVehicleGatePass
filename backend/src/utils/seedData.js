import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import VehiclePass from '../models/VehiclePass.js';
import Gate from '../models/Gate.js';
import GateOfficer from '../models/GateOfficer.js';
import ScanLog from '../models/ScanLog.js';
import AuditLog from '../models/AuditLog.js';
import { generatePassToken, generatePassNumber, generateQRCodeDataUrl } from '../services/qrService.js';

export const seedDatabase = async (force = false) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0 && !force) {
      console.log(`Database already populated with ${userCount} users. Skipping seed.`);
      return;
    }

    console.log('🌱 Seeding University Vehicle Gate Pass database with realistic demo data...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      VehiclePass.deleteMany({}),
      Gate.deleteMany({}),
      GateOfficer.deleteMany({}),
      ScanLog.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Password123!', salt);

    // 1. Create Users
    const adminUser = await User.create({
      fullName: 'Dr. Eleanor Vance',
      email: 'admin@university.edu',
      phone: '+1 (555) 019-2834',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      idNumber: 'ADM-DIR-001',
      department: 'Campus Security & Transportation Authority',
      status: 'ACTIVE',
    });

    const officer1User = await User.create({
      fullName: 'Officer Marcus Brody',
      email: 'officer1@university.edu',
      phone: '+1 (555) 012-9843',
      passwordHash: defaultPasswordHash,
      role: 'GATE_OFFICER',
      idNumber: 'SEC-101',
      department: 'Campus Security Patrol',
      status: 'ACTIVE',
    });

    const officer2User = await User.create({
      fullName: 'Officer Sarah Jenkins',
      email: 'officer2@university.edu',
      phone: '+1 (555) 014-7721',
      passwordHash: defaultPasswordHash,
      role: 'GATE_OFFICER',
      idNumber: 'SEC-102',
      department: 'Campus Security Patrol',
      status: 'ACTIVE',
    });

    const studentUser = await User.create({
      fullName: 'Alexander Hayes',
      email: 'student@university.edu',
      phone: '+1 (555) 234-5678',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      idNumber: 'STU-2024-8841',
      department: 'Computer Science & Engineering',
      status: 'ACTIVE',
    });

    const student2User = await User.create({
      fullName: 'Maya Lin',
      email: 'student2@university.edu',
      phone: '+1 (555) 345-6789',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      idNumber: 'STU-2025-1102',
      department: 'Mechanical & Aerospace Engineering',
      status: 'ACTIVE',
    });

    const staffUser = await User.create({
      fullName: 'Prof. David Miller',
      email: 'staff@university.edu',
      phone: '+1 (555) 456-7890',
      passwordHash: defaultPasswordHash,
      role: 'STAFF',
      idNumber: 'FAC-9014',
      department: 'Department of Physics & Astronomy',
      status: 'ACTIVE',
    });

    const visitorUser = await User.create({
      fullName: 'Dr. Robert Sterling',
      email: 'visitor@university.edu',
      phone: '+1 (555) 678-9012',
      passwordHash: defaultPasswordHash,
      role: 'VISITOR',
      idNumber: 'VIS-2026-042',
      visitorPurpose: 'Keynote Lecture on Next-Gen Artificial Intelligence',
      visitorHost: 'Prof. David Miller / Physics Dept',
      status: 'ACTIVE',
    });

    // 2. Create Kaduna State University Gates (Two Gates: Entry and Exit)
    const gateEntry = await Gate.create({
      name: 'KASU Main Entry Gate',
      code: 'GATE-ENTRY',
      location: 'Tafawa Balewa Way / Main Campus Inbound Boulevard',
      status: 'ACTIVE',
      description: 'Designated primary university entry checkpoint for students, faculty, staff, and visitors.',
      operatingHours: '24/7',
    });

    const gateExit = await Gate.create({
      name: 'KASU Main Exit Gate',
      code: 'GATE-EXIT',
      location: 'Tafawa Balewa Way / Main Campus Outbound Boulevard',
      status: 'ACTIVE',
      description: 'Designated primary university exit checkpoint for outbound vehicle clearance.',
      operatingHours: '24/7',
    });

    // 3. Assign Gate Officers
    await GateOfficer.create({
      userId: officer1User._id,
      assignedGateId: gateEntry._id,
      badgeNumber: 'KASU-SEC-101',
      shift: 'MORNING',
      status: 'ON_DUTY',
    });

    await GateOfficer.create({
      userId: officer2User._id,
      assignedGateId: gateExit._id,
      badgeNumber: 'KASU-SEC-102',
      shift: 'AFTERNOON',
      status: 'ON_DUTY',
    });

    // 4. Create Sample Vehicles & Passes
    // A. Approved Student Vehicle
    const studentVehicle1 = await Vehicle.create({
      ownerId: studentUser._id,
      registrationNumber: 'UNI-789-ST',
      vehicleType: 'CAR',
      make: 'Toyota',
      model: 'RAV4 Hybrid',
      colour: 'Deep Nautical Blue',
      registeredYear: 2023,
      status: 'APPROVED',
      notes: 'Student annual residential permit',
    });

    const studentToken1 = generatePassToken();
    const studentPass1 = await VehiclePass.create({
      vehicleId: studentVehicle1._id,
      ownerId: studentUser._id,
      passNumber: 'UPASS-2026-7891',
      qrToken: studentToken1,
      status: 'ACTIVE',
      passType: 'STUDENT_ANNUAL',
      issuedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
      approvedBy: adminUser._id,
      approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      qrCodeDataUrl: await generateQRCodeDataUrl(studentToken1),
    });

    // B. Pending Student Vehicle
    const studentVehicle2 = await Vehicle.create({
      ownerId: studentUser._id,
      registrationNumber: 'STU-440-CS',
      vehicleType: 'MOTORCYCLE',
      make: 'Kawasaki',
      model: 'Ninja 400',
      colour: 'Metallic Lime Green',
      registeredYear: 2024,
      status: 'PENDING',
      notes: 'Second vehicle for daily commuter travel',
    });

    // C. Approved Staff Vehicle
    const staffVehicle = await Vehicle.create({
      ownerId: staffUser._id,
      registrationNumber: 'FAC-404-OK',
      vehicleType: 'CAR',
      make: 'Tesla',
      model: 'Model 3 Long Range',
      colour: 'Pearl White Multi-Coat',
      registeredYear: 2024,
      status: 'APPROVED',
      notes: 'Faculty reserved parking permit (Lot B)',
    });

    const staffToken = generatePassToken();
    const staffPass = await VehiclePass.create({
      vehicleId: staffVehicle._id,
      ownerId: staffUser._id,
      passNumber: 'UPASS-2026-4048',
      qrToken: staffToken,
      status: 'ACTIVE',
      passType: 'STAFF_PERMANENT',
      issuedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000),
      approvedBy: adminUser._id,
      approvedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      qrCodeDataUrl: await generateQRCodeDataUrl(staffToken),
    });

    // D. Approved Visitor Vehicle (Temporary Pass)
    const visitorVehicle = await Vehicle.create({
      ownerId: visitorUser._id,
      registrationNumber: 'VIS-880-NY',
      vehicleType: 'CAR',
      make: 'BMW',
      model: '330i xDrive',
      colour: 'Mineral Gray Metallic',
      registeredYear: 2023,
      status: 'APPROVED',
      notes: 'Visitor Pass - Invited Keynote Speaker',
    });

    const visitorToken = generatePassToken();
    const visitorPass = await VehiclePass.create({
      vehicleId: visitorVehicle._id,
      ownerId: visitorUser._id,
      passNumber: 'UPASS-2026-8803',
      qrToken: visitorToken,
      status: 'ACTIVE',
      passType: 'VISITOR_TEMPORARY',
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days remaining
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      qrCodeDataUrl: await generateQRCodeDataUrl(visitorToken),
    });

    // E. Pending Visitor Registration
    const visitor2User = await User.create({
      fullName: 'Carlos Mendez (KASU Telecom Contractor)',
      email: 'contractor@KASUtelecom.com',
      phone: '+1 (555) 789-0123',
      passwordHash: defaultPasswordHash,
      role: 'VISITOR',
      idNumber: 'CNT-901',
      visitorPurpose: 'Campus Fiber Network Infrastructure Upgrade',
      visitorHost: 'Campus Network Operations Center (NOC)',
      status: 'ACTIVE',
    });

    const pendingContractorVehicle = await Vehicle.create({
      ownerId: visitor2User._id,
      registrationNumber: 'COMM-912-TX',
      vehicleType: 'VAN',
      make: 'Ford',
      model: 'Transit 250 Cargo',
      colour: 'Oxford White',
      registeredYear: 2022,
      status: 'PENDING',
      notes: 'Commercial telecom technician maintenance van',
    });

    // F. Suspended Pass Vehicle
    const suspendedVehicle = await Vehicle.create({
      ownerId: student2User._id,
      registrationNumber: 'SUS-555-ZZ',
      vehicleType: 'CAR',
      make: 'Subaru',
      model: 'Outback Wilderness',
      colour: 'Autumn Green Metallic',
      registeredYear: 2021,
      status: 'SUSPENDED',
      rejectionReason: '',
      notes: 'Temporary parking disciplinary hold',
    });

    const suspendedToken = generatePassToken();
    await VehiclePass.create({
      vehicleId: suspendedVehicle._id,
      ownerId: student2User._id,
      passNumber: 'UPASS-2026-5551',
      qrToken: suspendedToken,
      status: 'SUSPENDED',
      passType: 'STUDENT_ANNUAL',
      issuedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
      approvedBy: adminUser._id,
      approvedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      suspensionReason: 'Pass temporarily suspended due to unpaid parking citations in fire lane',
      qrCodeDataUrl: await generateQRCodeDataUrl(suspendedToken),
    });

    // G. Rejected Vehicle
    await Vehicle.create({
      ownerId: student2User._id,
      registrationNumber: 'REJ-999-XX',
      vehicleType: 'CAR',
      make: 'Ford',
      model: 'Mustang GT',
      colour: 'Race Red',
      registeredYear: 2018,
      status: 'REJECTED',
      rejectionReason: 'Exhaust noise level exceeds campus noise regulations; missing mandatory proof of insurance',
      notes: '',
    });

    // 5. Create Realistic Sample Scan Logs
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const yesterdayMorning = new Date(Date.now() - 26 * 60 * 60 * 1000);
    const yesterdayEvening = new Date(Date.now() - 18 * 60 * 60 * 1000);

    await ScanLog.create([
      {
        passId: studentPass1._id,
        vehicleId: studentVehicle1._id,
        ownerId: studentUser._id,
        gateId: gateEntry._id,
        officerId: officer1User._id,
        direction: 'ENTRY',
        verificationStatus: 'VALID',
        licensePlate: studentVehicle1.registrationNumber,
        ownerName: studentUser.fullName,
        ownerRole: studentUser.role,
        vehicleType: studentVehicle1.vehicleType,
        vehicleMakeModel: `${studentVehicle1.make} ${studentVehicle1.model}`,
        scannedAt: twoHoursAgo,
      },
      {
        passId: staffPass._id,
        vehicleId: staffVehicle._id,
        ownerId: staffUser._id,
        gateId: gateEntry._id,
        officerId: officer1User._id,
        direction: 'ENTRY',
        verificationStatus: 'VALID',
        licensePlate: staffVehicle.registrationNumber,
        ownerName: staffUser.fullName,
        ownerRole: staffUser.role,
        vehicleType: staffVehicle.vehicleType,
        vehicleMakeModel: `${staffVehicle.make} ${staffVehicle.model}`,
        scannedAt: oneHourAgo,
      },
      {
        passId: visitorPass._id,
        vehicleId: visitorVehicle._id,
        ownerId: visitorUser._id,
        gateId: gateEntry._id,
        officerId: officer1User._id,
        direction: 'ENTRY',
        verificationStatus: 'VALID',
        licensePlate: visitorVehicle.registrationNumber,
        ownerName: visitorUser.fullName,
        ownerRole: visitorUser.role,
        vehicleType: visitorVehicle.vehicleType,
        vehicleMakeModel: `${visitorVehicle.make} ${visitorVehicle.model}`,
        scannedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        passId: studentPass1._id,
        vehicleId: studentVehicle1._id,
        ownerId: studentUser._id,
        gateId: gateEntry._id,
        officerId: officer1User._id,
        direction: 'ENTRY',
        verificationStatus: 'VALID',
        licensePlate: studentVehicle1.registrationNumber,
        ownerName: studentUser.fullName,
        ownerRole: studentUser.role,
        vehicleType: studentVehicle1.vehicleType,
        vehicleMakeModel: `${studentVehicle1.make} ${studentVehicle1.model}`,
        scannedAt: yesterdayMorning,
      },
      {
        passId: studentPass1._id,
        vehicleId: studentVehicle1._id,
        ownerId: studentUser._id,
        gateId: gateExit._id,
        officerId: officer2User._id,
        direction: 'EXIT',
        verificationStatus: 'VALID',
        licensePlate: studentVehicle1.registrationNumber,
        ownerName: studentUser.fullName,
        ownerRole: studentUser.role,
        vehicleType: studentVehicle1.vehicleType,
        vehicleMakeModel: `${studentVehicle1.make} ${studentVehicle1.model}`,
        scannedAt: yesterdayEvening,
      },
    ]);

    // 6. Create Audit Logs
    await AuditLog.create([
      {
        actorId: adminUser._id,
        actorName: adminUser.fullName,
        actorRole: adminUser.role,
        action: 'SYSTEM_INITIALIZED',
        targetType: 'SYSTEM',
        targetId: 'INIT',
        details: { message: 'Initial seed configuration applied successfully.' },
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        actorId: adminUser._id,
        actorName: adminUser.fullName,
        actorRole: adminUser.role,
        action: 'VEHICLE_APPROVED',
        targetType: 'VEHICLE',
        targetId: studentVehicle1._id.toString(),
        details: { plate: studentVehicle1.registrationNumber, passNumber: studentPass1.passNumber },
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        actorId: adminUser._id,
        actorName: adminUser.fullName,
        actorRole: adminUser.role,
        action: 'VEHICLE_APPROVED',
        targetType: 'VEHICLE',
        targetId: staffVehicle._id.toString(),
        details: { plate: staffVehicle.registrationNumber, passNumber: staffPass.passNumber },
        timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        actorId: adminUser._id,
        actorName: adminUser.fullName,
        actorRole: adminUser.role,
        action: 'PASS_SUSPENDED',
        targetType: 'PASS',
        targetId: suspendedVehicle._id.toString(),
        details: { plate: suspendedVehicle.registrationNumber, reason: 'Fire lane parking violations' },
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        actorId: adminUser._id,
        actorName: adminUser.fullName,
        actorRole: adminUser.role,
        action: 'OFFICER_ASSIGNED',
        targetType: 'OFFICER',
        targetId: officer1User._id.toString(),
        details: { officer: officer1User.fullName, gate: 'Main Campus Gate' },
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('✅ Database seeded successfully with demo users, vehicles, passes, gates, and scan logs!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};
