import mongoose from 'mongoose';
import { MAINTENANCE_ACTION_VALUES } from '../constants/actions.js';

const maintenanceRecordSchema = new mongoose.Schema(
  {
    extinguisherId: {
      type: String,
      required: true,
      trim: true,
    },
    inspectionId: {
      type: String,
      trim: true,
    },
    inspectorId: {
      type: String,
      required: true,
      trim: true,
    },
    actionTaken: {
      type: String,
      enum: MAINTENANCE_ACTION_VALUES,
      required: true,
    },
    conditionFound: {
      type: String,
      required: true,
      trim: true,
    },
    maintenanceDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

maintenanceRecordSchema.index({ extinguisherId: 1, maintenanceDate: -1 });
maintenanceRecordSchema.index({ inspectorId: 1, maintenanceDate: -1 });
maintenanceRecordSchema.index({ inspectionId: 1 });
maintenanceRecordSchema.index({ maintenanceDate: -1 });

export default mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
