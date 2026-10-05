import mongoose from 'mongoose';
import { createMemoryModel } from '../utils/dbStore.js';

const vehiclePassSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle ID is required'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
    },
    passNumber: {
      type: String,
      required: [true, 'Pass number is required'],
      unique: true,
      trim: true,
    },
    qrToken: {
      type: String,
      required: [true, 'QR token is required'],
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED'],
      default: 'ACTIVE',
    },
    passType: {
      type: String,
      enum: ['STUDENT_ANNUAL', 'STAFF_PERMANENT', 'VISITOR_TEMPORARY', 'SPECIAL_PASS'],
      default: 'STUDENT_ANNUAL',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Pass expiry date is required'],
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
      default: Date.now,
    },
    qrCodeDataUrl: {
      type: String,
      default: '',
    },
    suspensionReason: {
      type: String,
      default: '',
    },
    campusStatus: {
      type: String,
      enum: ['OUTSIDE', 'INSIDE'],
      default: 'OUTSIDE',
    },
    lastAction: {
      type: String,
      enum: ['NONE', 'CHECKED_IN', 'CHECKED_OUT'],
      default: 'NONE',
    },
    lastScannedAt: {
      type: Date,
      default: null,
    },
    lastGateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gate',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const MongoosePassModel = mongoose.models.VehiclePass || mongoose.model('VehiclePass', vehiclePassSchema);
const MemoryPassModel = createMemoryModel('vehiclepasses');

const VehiclePassProxy = new Proxy(MongoosePassModel, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryPassModel[prop] !== undefined ? MemoryPassModel[prop] : target[prop];
  },
});

export default VehiclePassProxy;
