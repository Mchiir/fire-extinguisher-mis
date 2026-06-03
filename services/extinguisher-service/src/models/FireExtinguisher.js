import mongoose from 'mongoose';
import { EXTINGUISHER_STATUS, DEFAULT_STATUS } from '../constants/statuses.js';

const fireExtinguisherSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    installationDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(EXTINGUISHER_STATUS),
      default: DEFAULT_STATUS,
    },
  },
  { timestamps: true }
);

fireExtinguisherSchema.index({ status: 1 });
fireExtinguisherSchema.index({ type: 1 });
fireExtinguisherSchema.index({ expiryDate: 1 });
fireExtinguisherSchema.index({ serialNumber: 'text', location: 'text' });

export default mongoose.model('FireExtinguisher', fireExtinguisherSchema);
