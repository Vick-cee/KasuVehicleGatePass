import Vehicle from '../models/Vehicle.js';
import VehiclePass from '../models/VehiclePass.js';
import User from '../models/User.js';
import { generatePassToken, generatePassNumber, generateQRCodeDataUrl } from '../services/qrService.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const registerVehicle = async (req, res) => {
  try {
    const {
      registrationNumber,
      vehicleType = 'CAR',
      make,
      model,
      colour,
      registeredYear,
      identificationDocument = '',
      notes = '',
    } = req.body;

    if (!registrationNumber || !make || !model || !colour) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle registration number (license plate), make, model, and colour are required',
      });
    }

    const cleanPlate = registrationNumber.toUpperCase().trim();

    // Check maximum 3 vehicles limit per owner
    const userVehicleCount = await Vehicle.countDocuments({
      ownerId: req.user._id,
      status: { $in: ['PENDING', 'APPROVED', 'SUSPENDED'] },
    });

    if (userVehicleCount >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum vehicle registration limit reached. You can register at most 3 vehicles per account.',
      });
    }

    // Check if plate already registered and active/pending
    const existingVehicle = await Vehicle.findOne({
      registrationNumber: cleanPlate,
      status: { $in: ['PENDING', 'APPROVED'] },
    });

    if (existingVehicle) {
      return res.status(409).json({
        success: false,
        message: `A registration for license plate ${cleanPlate} already exists with status '${existingVehicle.status}'.`,
      });
    }

    const vehicle = await Vehicle.create({
      ownerId: req.user._id,
      registrationNumber: cleanPlate,
      vehicleType,
      make: make.trim(),
      model: model.trim(),
      colour: colour.trim(),
      registeredYear: registeredYear || new Date().getFullYear(),
      identificationDocument: identificationDocument.trim(),
      notes: notes.trim(),
      status: 'PENDING',
    });

    await logAuditEvent({
      actor: req.user,
      action: 'VEHICLE_REGISTERED',
      targetType: 'VEHICLE',
      targetId: vehicle._id,
      details: { plate: cleanPlate, make, model, type: vehicleType },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully. Awaiting administrator approval.',
      vehicle,
    });
  } catch (error) {
    console.error('Vehicle Registration Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during vehicle registration',
    });
  }
};

export const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ ownerId: req.user._id }).sort({ createdAt: -1 });

    // Attach pass details if available
    const vehicleIds = vehicles.map((v) => v._id);
    const passes = await VehiclePass.find({ vehicleId: { $in: vehicleIds } });

    const passMap = {};
    passes.forEach((p) => {
      passMap[p.vehicleId.toString()] = p;
    });

    const result = vehicles.map((v) => {
      const vObj = v.toObject();
      vObj.pass = passMap[v._id.toString()] || null;
      return vObj;
    });

    res.status(200).json({
      success: true,
      vehicles: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('ownerId', 'fullName email phone role idNumber department visitorPurpose visitorHost');
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Role check: non-admin can only view their own vehicle
    if (req.user.role !== 'ADMIN' && req.user.role !== 'GATE_OFFICER' && !vehicle.ownerId._id.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this vehicle profile' });
    }

    const pass = await VehiclePass.findOne({ vehicleId: vehicle._id });

    res.status(200).json({
      success: true,
      vehicle,
      pass,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllVehicles = async (req, res) => {
  try {
    const { status, vehicleType, search, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (vehicleType && vehicleType !== 'ALL') {
      filter.vehicleType = vehicleType;
    }

    let query = Vehicle.find(filter).populate('ownerId', 'fullName email phone role idNumber department visitorPurpose visitorHost');

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { registrationNumber: searchRegex },
        { make: searchRegex },
        { model: searchRegex },
        { colour: searchRegex },
      ];
    }

    const total = await Vehicle.countDocuments(filter);
    const vehicles = await Vehicle.find(filter)
      .populate('ownerId', 'fullName email phone role idNumber department visitorPurpose visitorHost')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const vehicleIds = vehicles.map((v) => v._id);
    const passes = await VehiclePass.find({ vehicleId: { $in: vehicleIds } });
    const passMap = {};
    passes.forEach((p) => {
      passMap[p.vehicleId.toString()] = p;
    });

    const enriched = vehicles.map((v) => {
      const vObj = v.toObject();
      vObj.pass = passMap[v._id.toString()] || null;
      return vObj;
    });

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      vehicles: enriched,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingApprovals = async (req, res) => {
  try {
    const pendingVehicles = await Vehicle.find({ status: 'PENDING' })
      .populate('ownerId', 'fullName email phone role idNumber department visitorPurpose visitorHost')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: pendingVehicles.length,
      vehicles: pendingVehicles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { customExpiryDate, passType } = req.body;

    const vehicle = await Vehicle.findById(id).populate('ownerId');
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle record not found' });
    }

    vehicle.status = 'APPROVED';
    vehicle.rejectionReason = '';
    await vehicle.save();

    // Determine pass expiry
    let expiresAt = new Date();
    if (customExpiryDate) {
      expiresAt = new Date(customExpiryDate);
    } else if (vehicle.ownerId.role === 'VISITOR') {
      // Visitor default: 7 days
      expiresAt.setDate(expiresAt.getDate() + 7);
    } else {
      // Student / Staff default: 1 year
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Determine pass type
    let resolvedPassType = passType;
    if (!resolvedPassType) {
      if (vehicle.ownerId.role === 'VISITOR') resolvedPassType = 'VISITOR_TEMPORARY';
      else if (vehicle.ownerId.role === 'STAFF') resolvedPassType = 'STAFF_PERMANENT';
      else resolvedPassType = 'STUDENT_ANNUAL';
    }

    const qrToken = generatePassToken();
    const passNumber = generatePassNumber();
    const qrCodeDataUrl = await generateQRCodeDataUrl(qrToken);

    // Create or update pass
    let pass = await VehiclePass.findOne({ vehicleId: vehicle._id });
    if (pass) {
      pass.qrToken = qrToken;
      pass.passNumber = passNumber;
      pass.status = 'ACTIVE';
      pass.passType = resolvedPassType;
      pass.expiresAt = expiresAt;
      pass.issuedAt = new Date();
      pass.approvedBy = req.user._id;
      pass.approvedAt = new Date();
      pass.qrCodeDataUrl = qrCodeDataUrl;
      pass.suspensionReason = '';
      await pass.save();
    } else {
      pass = await VehiclePass.create({
        vehicleId: vehicle._id,
        ownerId: vehicle.ownerId._id,
        passNumber,
        qrToken,
        status: 'ACTIVE',
        passType: resolvedPassType,
        issuedAt: new Date(),
        expiresAt,
        approvedBy: req.user._id,
        approvedAt: new Date(),
        qrCodeDataUrl,
      });
    }

    await logAuditEvent({
      actor: req.user,
      action: 'VEHICLE_APPROVED',
      targetType: 'VEHICLE',
      targetId: vehicle._id,
      details: {
        plate: vehicle.registrationNumber,
        passNumber,
        owner: vehicle.ownerId.fullName,
        expiresAt,
      },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Vehicle ${vehicle.registrationNumber} approved successfully. Digital QR Pass generated.`,
      vehicle,
      pass,
    });
  } catch (error) {
    console.error('Approve Vehicle Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to approve vehicle' });
  }
};

export const rejectVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A clear reason for rejection is required',
      });
    }

    const vehicle = await Vehicle.findById(id).populate('ownerId');
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle record not found' });
    }

    vehicle.status = 'REJECTED';
    vehicle.rejectionReason = reason.trim();
    await vehicle.save();

    // Revoke any existing pass
    await VehiclePass.updateMany({ vehicleId: vehicle._id }, { status: 'REVOKED' });

    await logAuditEvent({
      actor: req.user,
      action: 'VEHICLE_REJECTED',
      targetType: 'VEHICLE',
      targetId: vehicle._id,
      details: { plate: vehicle.registrationNumber, reason: reason.trim(), owner: vehicle.ownerId.fullName },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Vehicle ${vehicle.registrationNumber} has been rejected.`,
      vehicle,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const suspendPass = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Administrative suspension' } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    vehicle.status = 'SUSPENDED';
    await vehicle.save();

    const pass = await VehiclePass.findOne({ vehicleId: vehicle._id });
    if (pass) {
      pass.status = 'SUSPENDED';
      pass.suspensionReason = reason;
      await pass.save();
    }

    await logAuditEvent({
      actor: req.user,
      action: 'PASS_SUSPENDED',
      targetType: 'PASS',
      targetId: pass?._id || vehicle._id,
      details: { plate: vehicle.registrationNumber, reason },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Pass for vehicle ${vehicle.registrationNumber} has been suspended.`,
      vehicle,
      pass,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reactivatePass = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    vehicle.status = 'APPROVED';
    await vehicle.save();

    const pass = await VehiclePass.findOne({ vehicleId: vehicle._id });
    if (pass) {
      pass.status = 'ACTIVE';
      pass.suspensionReason = '';
      await pass.save();
    }

    await logAuditEvent({
      actor: req.user,
      action: 'PASS_REACTIVATED',
      targetType: 'PASS',
      targetId: pass?._id || vehicle._id,
      details: { plate: vehicle.registrationNumber },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Pass for vehicle ${vehicle.registrationNumber} has been reactivated.`,
      vehicle,
      pass,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
