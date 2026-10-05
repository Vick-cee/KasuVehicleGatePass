import mongoose from 'mongoose';
import { createMemoryModel } from '../utils/dbStore.js';

const gateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Gate name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Gate code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Gate location description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
      default: 'ACTIVE',
    },
    description: {
      type: String,
      default: '',
    },
    operatingHours: {
      type: String,
      default: '24/7',
    },
  },
  {
    timestamps: true,
  }
);

const MongooseGateModel = mongoose.models.Gate || mongoose.model('Gate', gateSchema);
const MemoryGateModel = createMemoryModel('gates');

const GateProxy = new Proxy(MongooseGateModel, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryGateModel[prop] !== undefined ? MemoryGateModel[prop] : target[prop];
  },
});

export default GateProxy;
