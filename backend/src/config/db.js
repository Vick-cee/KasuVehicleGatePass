import mongoose from 'mongoose';

let isUsingEmbeddedEngine = false;

export const connectDB = async () => {
  const customUri = process.env.MONGODB_URI;

  if (customUri) {
    try {
      console.log(`Connecting to specified MongoDB URI: ${customUri.replace(/\/\/.*@/, '//***:***@')}...`);
      await mongoose.connect(customUri, { serverSelectionTimeoutMS: 2000 });
      console.log('✅ Connected to MongoDB via environment URI.');
      return;
    } catch (err) {
      console.warn('⚠️ Could not connect to MONGODB_URI, falling back to embedded datastore...');
    }
  }

  // If in test environment or no explicit URI, use fast embedded memory store
  if (process.env.NODE_ENV === 'test' || process.env.USE_EMBEDDED === 'true') {
    console.log('ℹ️ Using High-Performance Embedded In-Memory Data Store.');
    isUsingEmbeddedEngine = true;
    return;
  }

  // Attempt local default MongoDB
  try {
    const localUri = 'mongodb://127.0.0.1:27017/university_gate_pass';
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 1000 });
    console.log('✅ Connected to local MongoDB instance.');
    return;
  } catch (err) {
    console.log('ℹ️ Local MongoDB instance not active. Using High-Performance Embedded In-Memory Data Store.');
    isUsingEmbeddedEngine = true;
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

export const isEmbedded = () => isUsingEmbeddedEngine;
