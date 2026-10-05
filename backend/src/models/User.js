import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createMemoryModel } from '../utils/dbStore.js';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: ['STUDENT', 'STAFF', 'VISITOR', 'ADMIN', 'GATE_OFFICER'],
      default: 'STUDENT',
      required: true,
    },
    idNumber: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    visitorPurpose: {
      type: String,
      trim: true,
      default: '',
    },
    visitorHost: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const MongooseUserModel = mongoose.models.User || mongoose.model('User', userSchema);
const MemoryUserModel = createMemoryModel('users');

const UserProxy = new Proxy(MongooseUserModel, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryUserModel[prop] !== undefined ? MemoryUserModel[prop] : target[prop];
  },
});

export default UserProxy;
