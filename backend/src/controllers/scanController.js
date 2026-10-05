import VehiclePass from '../models/VehiclePass.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import Gate from '../models/Gate.js';
import GateOfficer from '../models/GateOfficer.js';
import ScanLog from '../models/ScanLog.js';
import { logAuditEvent } from '../utils/auditLogger.js';

// In-memory cooldown cache to prevent accidental double-scans within 5 seconds
const recentScansCache = new Map();

export const verifyAndRecordScan = async (req, res) => {
  try {
    const { qrToken, direction = 'ENTRY', gateId } = req.body;

    if (!qrToken) {
      return res.status(400).json({
        success: false,
        isValid: false,
        verificationStatus: 'INVALID',
        message: 'QR Code token is required for verification',
      });
    }

    if (!['ENTRY', 'EXIT'].includes(direction)) {
      return res.status(400).json({
        success: false,
        message: 'Direction must be either ENTRY or EXIT',
      });
    }

    // Determine the active gate (supports explicit gateId, assigned gate, or direction-based fallback)
    let gate = null;
    let officer = null;

    if (gateId) {
      gate = await Gate.findById(gateId);
    }

    if (!gate && req.user.role === 'GATE_OFFICER') {
      officer = await GateOfficer.findOne({ userId: req.user._id }).populate('assignedGateId');
      if (officer && officer.assignedGateId && officer.assignedGateId.status === 'ACTIVE') {
        // If direction matches officer assignment or no explicit gate requested
        gate = officer.assignedGateId;
      }
    }

    // Fallback based on direction (GATE-ENTRY or GATE-EXIT)
    if (!gate) {
      const targetCode = direction === 'ENTRY' ? 'GATE-ENTRY' : 'GATE-EXIT';
      gate = await Gate.findOne({ code: targetCode, status: 'ACTIVE' });
      if (!gate) {
        gate = await Gate.findOne({ status: 'ACTIVE' });
      }
    }

    if (!gate || gate.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        isValid: false,
        verificationStatus: 'GATE_MISMATCH',
        message: 'No active gate found for verification.',
      });
    }

    const targetGateId = gate._id;

    // Cooldown check for duplicate frame detection
    const cacheKey = `${qrToken}-${direction}-${targetGateId}`;
    const lastScanTime = recentScansCache.get(cacheKey);
    const now = Date.now();

    if (lastScanTime && now - lastScanTime < 4000) {
      return res.status(429).json({
        success: false,
        isDuplicate: true,
        message: 'Duplicate scan ignored (cooldown active). Please wait a few moments.',
      });
    }
    recentScansCache.set(cacheKey, now);

    // Clean old cooldown entries periodically
    if (recentScansCache.size > 500) {
      for (const [k, time] of recentScansCache.entries()) {
        if (now - time > 15000) recentScansCache.delete(k);
      }
    }

    // Clean token string
    const cleanToken = qrToken.trim();

    // Query pass in database
    const pass = await VehiclePass.findOne({ qrToken: cleanToken })
      .populate('vehicleId')
      .populate('ownerId', 'fullName email phone role idNumber department visitorPurpose visitorHost status');

    let isValid = false;
    let verificationStatus = 'VALID';
    let failureReason = '';

    if (!pass) {
      verificationStatus = 'INVALID';
      failureReason = 'QR code token not found in database or pass has not been issued.';
    } else if (!pass.vehicleId) {
      verificationStatus = 'INVALID';
      failureReason = 'No vehicle profile associated with this pass.';
    } else if (pass.status === 'SUSPENDED') {
      verificationStatus = 'SUSPENDED';
      failureReason = `Pass is currently SUSPENDED. Reason: ${pass.suspensionReason || 'Administrative hold'}.`;
    } else if (pass.status === 'REVOKED') {
      verificationStatus = 'INVALID';
      failureReason = 'Pass has been revoked by administration.';
    } else if (new Date() > new Date(pass.expiresAt)) {
      verificationStatus = 'EXPIRED';
      failureReason = `Pass expired on ${new Date(pass.expiresAt).toLocaleDateString()}. Renewal required.`;
    } else if (pass.vehicleId.status === 'REJECTED') {
      verificationStatus = 'REJECTED';
      failureReason = `Vehicle registration was REJECTED: ${pass.vehicleId.rejectionReason || 'Not approved'}.`;
    } else if (pass.vehicleId.status !== 'APPROVED') {
      verificationStatus = 'INVALID';
      failureReason = `Vehicle registration status is ${pass.vehicleId.status} (Awaiting approval).`;
    } else if (pass.ownerId.status !== 'ACTIVE') {
      verificationStatus = 'INVALID';
      failureReason = `Owner account is ${pass.ownerId.status}. Access denied.`;
    } else {
      isValid = true;
      verificationStatus = 'VALID';
    }

    // Check-in / Check-out movement determination
    let movementAction = direction === 'ENTRY' ? 'CHECKED_IN' : 'CHECKED_OUT';
    let movementMessage = direction === 'ENTRY' ? 'VEHICLE CHECKED IN — ENTRY AUTHORIZED' : 'VEHICLE CHECKED OUT — EXIT CLEARED';

    if (isValid && pass) {
      if (direction === 'ENTRY') {
        pass.campusStatus = 'INSIDE';
        pass.lastAction = 'CHECKED_IN';
        movementAction = 'CHECKED_IN';
        movementMessage = 'CHECKED IN — ENTRY GRANTED';
      } else {
        pass.campusStatus = 'OUTSIDE';
        pass.lastAction = 'CHECKED_OUT';
        movementAction = 'CHECKED_OUT';
        movementMessage = 'CHECKED OUT — EXIT GRANTED';
      }
      pass.lastScannedAt = new Date();
      pass.lastGateId = gate._id;
      await pass.save();
    }

    // Record the scan in ScanLog
    const scanLog = await ScanLog.create({
      passId: pass?._id || null,
      vehicleId: pass?.vehicleId?._id || null,
      ownerId: pass?.ownerId?._id || null,
      gateId: gate._id,
      officerId: req.user._id,
      direction,
      verificationStatus,
      failureReason,
      qrTokenScanned: cleanToken,
      licensePlate: pass?.vehicleId?.registrationNumber || 'UNKNOWN',
      ownerName: pass?.ownerId?.fullName || 'UNKNOWN',
      ownerRole: pass?.ownerId?.role || 'UNKNOWN',
      vehicleType: pass?.vehicleId?.vehicleType || 'UNKNOWN',
      vehicleMakeModel: pass?.vehicleId ? `${pass.vehicleId.make} ${pass.vehicleId.model}` : 'UNKNOWN',
      scannedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      isValid,
      verificationStatus,
      movementAction,
      movementMessage,
      campusStatus: pass?.campusStatus || 'OUTSIDE',
      failureReason,
      direction,
      gate: {
        id: gate._id,
        name: gate.name,
        code: gate.code,
      },
      officer: {
        id: req.user._id,
        name: req.user.fullName,
      },
      passDetails: pass
        ? {
            id: pass._id,
            passNumber: pass.passNumber,
            passType: pass.passType,
            expiresAt: pass.expiresAt,
            status: pass.status,
            campusStatus: pass.campusStatus,
            lastAction: pass.lastAction,
          }
        : null,
      vehicleDetails: pass?.vehicleId
        ? {
            id: pass.vehicleId._id,
            registrationNumber: pass.vehicleId.registrationNumber,
            vehicleType: pass.vehicleId.vehicleType,
            make: pass.vehicleId.make,
            model: pass.vehicleId.model,
            colour: pass.vehicleId.colour,
          }
        : null,
      ownerDetails: pass?.ownerId
        ? {
            id: pass.ownerId._id,
            fullName: pass.ownerId.fullName,
            email: pass.ownerId.email,
            phone: pass.ownerId.phone,
            role: pass.ownerId.role,
            idNumber: pass.ownerId.idNumber,
            department: pass.ownerId.department,
            visitorPurpose: pass.ownerId.visitorPurpose,
            visitorHost: pass.ownerId.visitorHost,
          }
        : null,
      scanLogId: scanLog._id,
      scannedAt: scanLog.scannedAt,
    });
  } catch (error) {
    console.error('Scan Verification Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during scan verification',
    });
  }
};

export const getOfficerShiftLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;

    const logs = await ScanLog.find({ officerId: req.user._id })
      .populate('gateId', 'name code')
      .populate('passId', 'passNumber')
      .sort({ scannedAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllScanLogs = async (req, res) => {
  try {
    const {
      gateId,
      direction,
      verificationStatus,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};

    if (gateId && gateId !== 'ALL') {
      filter.gateId = gateId;
    }
    if (direction && direction !== 'ALL') {
      filter.direction = direction;
    }
    if (verificationStatus && verificationStatus !== 'ALL') {
      filter.verificationStatus = verificationStatus;
    }

    if (startDate || endDate) {
      filter.scannedAt = {};
      if (startDate) filter.scannedAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.scannedAt.$lte = end;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { licensePlate: searchRegex },
        { ownerName: searchRegex },
        { vehicleMakeModel: searchRegex },
      ];
    }

    const total = await ScanLog.countDocuments(filter);
    const logs = await ScanLog.find(filter)
      .populate('gateId', 'name code')
      .populate('officerId', 'fullName')
      .populate('passId', 'passNumber')
      .sort({ scannedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserGateActivity = async (req, res) => {
  try {
    const logs = await ScanLog.find({ ownerId: req.user._id })
      .populate('gateId', 'name code location')
      .populate('passId', 'passNumber')
      .sort({ scannedAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
