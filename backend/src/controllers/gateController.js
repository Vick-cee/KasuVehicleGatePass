import Gate from '../models/Gate.js';
import GateOfficer from '../models/GateOfficer.js';
import User from '../models/User.js';
import ScanLog from '../models/ScanLog.js';
import bcrypt from 'bcryptjs';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getAllGates = async (req, res) => {
  try {
    const gates = await Gate.find().sort({ createdAt: 1 });

    // Enrich with assigned officers count and today's scan count
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const enrichedGates = await Promise.all(
      gates.map(async (gate) => {
        const officerCount = await GateOfficer.countDocuments({ assignedGateId: gate._id, status: 'ON_DUTY' });
        const todayScans = await ScanLog.countDocuments({
          gateId: gate._id,
          scannedAt: { $gte: startOfToday },
        });

        const gObj = gate.toObject();
        gObj.activeOfficersCount = officerCount;
        gObj.todayScansCount = todayScans;
        return gObj;
      })
    );

    res.status(200).json({
      success: true,
      gates: enrichedGates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGateById = async (req, res) => {
  try {
    const gate = await Gate.findById(req.params.id);
    if (!gate) {
      return res.status(404).json({ success: false, message: 'Gate not found' });
    }

    const assignedOfficers = await GateOfficer.find({ assignedGateId: gate._id }).populate('userId', 'fullName email phone');

    res.status(200).json({
      success: true,
      gate,
      assignedOfficers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGate = async (req, res) => {
  try {
    const { name, code, location, description = '', operatingHours = '24/7' } = req.body;

    if (!name || !code || !location) {
      return res.status(400).json({
        success: false,
        message: 'Gate name, code, and location are required',
      });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await Gate.findOne({ code: cleanCode });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Gate code '${cleanCode}' is already registered`,
      });
    }

    const gate = await Gate.create({
      name: name.trim(),
      code: cleanCode,
      location: location.trim(),
      description: description.trim(),
      operatingHours: operatingHours.trim(),
      status: 'ACTIVE',
    });

    await logAuditEvent({
      actor: req.user,
      action: 'GATE_CREATED',
      targetType: 'GATE',
      targetId: gate._id,
      details: { name: gate.name, code: gate.code, location: gate.location },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Gate '${gate.name}' created successfully`,
      gate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGate = async (req, res) => {
  try {
    const { name, location, status, description, operatingHours } = req.body;

    const gate = await Gate.findById(req.params.id);
    if (!gate) {
      return res.status(404).json({ success: false, message: 'Gate not found' });
    }

    if (name) gate.name = name.trim();
    if (location) gate.location = location.trim();
    if (status) gate.status = status;
    if (description !== undefined) gate.description = description.trim();
    if (operatingHours) gate.operatingHours = operatingHours.trim();

    await gate.save();

    await logAuditEvent({
      actor: req.user,
      action: 'GATE_UPDATED',
      targetType: 'GATE',
      targetId: gate._id,
      details: { name: gate.name, status: gate.status },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Gate '${gate.name}' updated successfully`,
      gate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOfficers = async (req, res) => {
  try {
    const officers = await GateOfficer.find()
      .populate('userId', 'fullName email phone status')
      .populate('assignedGateId', 'name code location status');

    res.status(200).json({
      success: true,
      officers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOfficer = async (req, res) => {
  try {
    const { fullName, email, phone, password, badgeNumber, assignedGateId, shift = 'MORNING' } = req.body;

    if (!fullName || !email || !phone || !password || !badgeNumber) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, phone, password, and badge number are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email address already in use' });
    }

    const existingBadge = await GateOfficer.findOne({ badgeNumber: badgeNumber.toUpperCase().trim() });
    if (existingBadge) {
      return res.status(409).json({ success: false, message: `Badge number '${badgeNumber}' already assigned` });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role: 'GATE_OFFICER',
      status: 'ACTIVE',
    });

    const officer = await GateOfficer.create({
      userId: user._id,
      badgeNumber: badgeNumber.toUpperCase().trim(),
      assignedGateId: assignedGateId || null,
      shift,
      status: 'ON_DUTY',
    });

    const populatedOfficer = await GateOfficer.findById(officer._id)
      .populate('userId', 'fullName email phone status')
      .populate('assignedGateId', 'name code location');

    await logAuditEvent({
      actor: req.user,
      action: 'OFFICER_CREATED',
      targetType: 'OFFICER',
      targetId: officer._id,
      details: { name: fullName, badgeNumber, assignedGateId },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Gate Officer ${fullName} created successfully`,
      officer: populatedOfficer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignOfficerToGate = async (req, res) => {
  try {
    const { officerId } = req.params;
    const { gateId, shift, status } = req.body;

    const officer = await GateOfficer.findById(officerId).populate('userId');
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Gate officer profile not found' });
    }

    if (gateId) {
      const gate = await Gate.findById(gateId);
      if (!gate) {
        return res.status(404).json({ success: false, message: 'Target gate not found' });
      }
      officer.assignedGateId = gate._id;
    } else if (gateId === null) {
      officer.assignedGateId = null;
    }

    if (shift) officer.shift = shift;
    if (status) officer.status = status;

    await officer.save();

    const updatedOfficer = await GateOfficer.findById(officer._id)
      .populate('userId', 'fullName email phone status')
      .populate('assignedGateId', 'name code location status');

    await logAuditEvent({
      actor: req.user,
      action: 'OFFICER_ASSIGNED',
      targetType: 'OFFICER',
      targetId: officer._id,
      details: { officerName: officer.userId?.fullName, assignedGateId: gateId, shift },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Gate officer assignment updated successfully',
      officer: updatedOfficer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOfficerAssignedGate = async (req, res) => {
  try {
    const officer = await GateOfficer.findOne({ userId: req.user._id }).populate('assignedGateId');
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer profile not found' });
    }

    res.status(200).json({
      success: true,
      officer,
      assignedGate: officer.assignedGateId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
