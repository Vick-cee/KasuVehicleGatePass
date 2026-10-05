import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';
import User from '../models/User.js';
import GateOfficer from '../models/GateOfficer.js';
import Gate from '../models/Gate.js';
import { logAuditEvent } from '../utils/auditLogger.js';

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      role = 'STUDENT',
      idNumber = '',
      department = '',
      visitorPurpose = '',
      visitorHost = '',
    } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, phone number, and password are required',
      });
    }

    const allowedRegisterRoles = ['STUDENT', 'STAFF', 'VISITOR'];
    if (!allowedRegisterRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Public registration is only permitted for Student, Staff, and Visitor accounts',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists',
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
      actor: user,
      action: 'USER_REGISTERED',
      targetType: 'USER',
      targetId: user._id,
      details: { email: user.email, role: user.role, fullName: user.fullName },
      ipAddress: req.ip,
    });

    const token = generateToken(user._id, user.role);

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.status.toLowerCase()}. Please contact system administrators.`,
      });
    }

    let officerProfile = null;
    if (user.role === 'GATE_OFFICER') {
      officerProfile = await GateOfficer.findOne({ userId: user._id }).populate('assignedGateId');
    }

    const token = generateToken(user._id, user.role);

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse,
      officerProfile,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    let officerProfile = null;
    if (user.role === 'GATE_OFFICER') {
      officerProfile = await GateOfficer.findOne({ userId: user._id }).populate('assignedGateId');
    }

    res.status(200).json({
      success: true,
      user,
      officerProfile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, department, visitorPurpose, visitorHost, idNumber } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (fullName) user.fullName = fullName.trim();
    if (phone) user.phone = phone.trim();
    if (department !== undefined) user.department = department.trim();
    if (visitorPurpose !== undefined) user.visitorPurpose = visitorPurpose.trim();
    if (visitorHost !== undefined) user.visitorHost = visitorHost.trim();
    if (idNumber !== undefined) user.idNumber = idNumber.trim();

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  // Simulated password reset response
  res.status(200).json({
    success: true,
    message: `If an account with email ${email} exists, password reset instructions have been dispatched. For demo accounts, you can log in directly with the default password: Password123!`,
  });
};
