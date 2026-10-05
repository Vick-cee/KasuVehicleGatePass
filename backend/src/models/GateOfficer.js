import mongoose from 'mongoose';
import { createMemoryModel } from '../utils/dbStore.js';

const gateOfficerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    assignedGateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gate',
      default: null,
    },
    badgeNumber: {
      type: String,
      required: [true, 'Badge number is required'],
      unique: true,
      trim: true,
    },
    shift: {
      type: String,
      enum: ['MORNING', 'AFTERNOON', 'NIGHT', 'ROTATING'],
      default: 'MORNING',
    },
    status: {
      type: String,
      enum: ['ON_DUTY', 'OFF_DUTY', 'ON_LEAVE'],
      default: 'ON_DUTY',
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseOfficerModel = mongoose.models.GateOfficer || mongoose.model('GateOfficer', gateOfficerSchema);
const MemoryOfficerModel = createMemoryModel('gateofficers');

const GateOfficerProxy = new Proxy(MongooseOfficerModel, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryOfficerModel[prop] !== undefined ? MemoryOfficerModel[prop] : target[prop];
  },
});

export default GateOfficerProxy;
