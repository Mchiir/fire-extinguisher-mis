import mongoose from 'mongoose';
import { NOTIFICATION_STATUS, DEFAULT_STATUS } from '../constants/statuses.js';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    extinguisherId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(NOTIFICATION_STATUS),
      default: DEFAULT_STATUS,
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
