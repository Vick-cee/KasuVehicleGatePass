import mongoose from 'mongoose';
import { createMemoryModel } from '../utils/dbStore.js';

const vehicleSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
    },
    registrationNumber: {
      type: String,
      required: [true, 'Vehicle registration number (license plate) is required'],
      uppercase: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['CAR', 'MOTORCYCLE', 'VAN', 'BICYCLE_ESCOOTER', 'DELIVERY_TRUCK', 'OTHER'],
      default: 'CAR',
      required: true,
    },
    make: {
      type: String,
      required: [true, 'Vehicle make is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    colour: {
      type: String,
      required: [true, 'Vehicle colour is required'],
      trim: true,
    },
    registeredYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    identificationDocument: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseVehicleModel = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
const MemoryVehicleModel = createMemoryModel('vehicles');

const VehicleProxy = new Proxy(MongooseVehicleModel, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryVehicleModel[prop] !== undefined ? MemoryVehicleModel[prop] : target[prop];
  },
});

export default VehicleProxy;
