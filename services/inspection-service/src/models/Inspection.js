import mongoose from 'mongoose';
import { INSPECTION_STATUS, DEFAULT_STATUS, INSPECTION_STATUS_VALUES } from '../constants/statuses.js';

const inspectionSchema = new mongoose.Schema(
  {
    extinguisherId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'FireExtinguisher',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    inspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: INSPECTION_STATUS_VALUES,
      default: DEFAULT_STATUS,
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

inspectionSchema.index({ requestedBy: 1, status: 1 });
inspectionSchema.index({ inspectorId: 1, status: 1 });
inspectionSchema.index({ extinguisherId: 1 });
inspectionSchema.index({ scheduledDate: 1 });

const Inspection = mongoose.model('Inspection', inspectionSchema);

export default Inspection;
