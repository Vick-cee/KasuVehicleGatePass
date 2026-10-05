import mongoose from 'mongoose';
import { createMemoryModel } from '../utils/dbStore.js';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actorName: {
      type: String,
      default: 'System',
    },
    actorRole: {
      type: String,
      default: 'SYSTEM',
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
    },
    targetType: {
      type: String,
      required: true,
      trim: true,
    },
    targetId: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseAuditModel = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
const MemoryAuditModel = createMemoryModel('auditlogs');

const AuditLogProxy = new Proxy(MongooseAuditModel, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryAuditModel[prop] !== undefined ? MemoryAuditModel[prop] : target[prop];
  },
});

export default AuditLogProxy;
