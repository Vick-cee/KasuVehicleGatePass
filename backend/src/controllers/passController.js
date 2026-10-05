import VehiclePass from '../models/VehiclePass.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';

export const getPassByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const pass = await VehiclePass.findOne({ qrToken: token })
      .populate('ownerId', 'fullName email phone role idNumber department visitorPurpose visitorHost')
      .populate('vehicleId');

    if (!pass) {
      return res.status(404).json({
        success: false,
        isValid: false,
        status: 'NOT_FOUND',
        message: 'Pass not found or invalid QR code token',
      });
    }

    const isExpired = new Date() > new Date(pass.expiresAt);
    let resolvedStatus = pass.status;
    if (isExpired && pass.status === 'ACTIVE') {
      resolvedStatus = 'EXPIRED';
    }

    const isValid = resolvedStatus === 'ACTIVE' && !isExpired && pass.vehicleId.status === 'APPROVED';

    res.status(200).json({
      success: true,
      isValid,
      passStatus: resolvedStatus,
      pass,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPassById = async (req, res) => {
  try {
    const pass = await VehiclePass.findById(req.params.id)
      .populate('ownerId', 'fullName email phone role idNumber department visitorPurpose visitorHost')
      .populate('vehicleId')
      .populate('approvedBy', 'fullName');

    if (!pass) {
      return res.status(404).json({ success: false, message: 'Pass not found' });
    }

    // Role check
    if (req.user.role !== 'ADMIN' && req.user.role !== 'GATE_OFFICER' && !pass.ownerId._id.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this pass' });
    }

    res.status(200).json({
      success: true,
      pass,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
