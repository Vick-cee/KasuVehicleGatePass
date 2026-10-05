import mongoose from 'mongoose';
import { createMemoryModel } from '../utils/dbStore.js';

const scanLogSchema = new mongoose.Schema(
  {
    passId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VehiclePass',
      default: null,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    gateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gate',
      required: [true, 'Gate ID is required'],
    },
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Officer ID is required'],
    },
    direction: {
      type: String,
      enum: ['ENTRY', 'EXIT'],
      required: [true, 'Direction (ENTRY or EXIT) is required'],
    },
    verificationStatus: {
      type: String,
      enum: ['VALID', 'INVALID', 'SUSPENDED', 'EXPIRED', 'REJECTED', 'GATE_MISMATCH'],
      required: true,
    },
    failureReason: {
      type: String,
      default: '',
    },
    qrTokenScanned: {
      type: String,
      default: '',
    },
    licensePlate: {
      type: String,
      default: '',
      uppercase: true,
    },
    ownerName: {
      type: String,
      default: '',
    },
    ownerRole: {
      type: String,
      default: '',
    },
    vehicleType: {
      type: String,
      default: '',
    },
    vehicleMakeModel: {
      type: String,
      default: '',
    },
    scannedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseScanLogModel = mongoose.models.ScanLog || mongoose.model('ScanLog', scanLogSchema);
const MemoryScanLogModel = createMemoryModel('scanlogs');

const ScanLogProxy = new Proxy(MongooseScanLogModel, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryScanLogModel[prop] !== undefined ? MemoryScanLogModel[prop] : target[prop];
  },
});

export default ScanLogProxy;
