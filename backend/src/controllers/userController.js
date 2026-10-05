import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import VehiclePass from '../models/VehiclePass.js';
import bcrypt from 'bcryptjs';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (role && role !== 'ALL') filter.role = role;
    if (status && status !== 'ALL') filter.status = status;

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { idNumber: searchRegex },
        { department: searchRegex },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Enrich with vehicles count
    const enriched = await Promise.all(
      users.map(async (u) => {
        const vehicleCount = await Vehicle.countDocuments({ ownerId: u._id });
        const userObj = u.toObject();
        userObj.vehiclesCount = vehicleCount;
        return userObj;
      })
    );

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      users: enriched,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const vehicles = await Vehicle.find({ ownerId: user._id });
    const vehicleIds = vehicles.map((v) => v._id);
    const passes = await VehiclePass.find({ vehicleId: { $in: vehicleIds } });

    res.status(200).json({
      success: true,
      user,
      vehicles,
      passes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password = 'Password123!',
      role = 'STUDENT',
      idNumber = '',
      department = '',
      visitorPurpose = '',
      visitorHost = '',
    } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and phone number are required',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'User with this email address already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role,
      idNumber: idNumber.trim(),
      department: department.trim(),
      visitorPurpose: visitorPurpose.trim(),
      visitorHost: visitorHost.trim(),
      status: 'ACTIVE',
    });

    await logAuditEvent({
      actor: req.user,
      action: 'USER_CREATED',
      targetType: 'USER',
      targetId: user._id,
      details: { email: user.email, role: user.role, fullName: user.fullName },
      ipAddress: req.ip,
    });

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(201).json({
      success: true,
      message: `User '${user.fullName}' created successfully`,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    await logAuditEvent({
      actor: req.user,
      action: 'USER_STATUS_UPDATED',
      targetType: 'USER',
      targetId: user._id,
      details: { email: user.email, status },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
