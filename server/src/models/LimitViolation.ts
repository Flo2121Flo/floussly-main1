import mongoose, { Document, Schema } from 'mongoose';

export interface ILimitViolation extends Document {
  userId: string;
  limitType: string;
  currentValue: number;
  limitValue: number;
  timestamp: Date;
  resolved?: boolean;
  resolvedBy?: string;
  resolutionNote?: string;
  resolutionTimestamp?: Date;
}

const LimitViolationSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  limitType: {
    type: String,
    required: true,
    enum: ['DAILY_AMOUNT', 'MONTHLY_AMOUNT', 'TRANSACTION_COUNT', 'VELOCITY', 'PER_TRANSACTION']
  },
  currentValue: {
    type: Number,
    required: true
  },
  limitValue: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: String,
    ref: 'User'
  },
  resolutionNote: {
    type: String
  },
  resolutionTimestamp: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
LimitViolationSchema.index({ userId: 1, timestamp: -1 });
LimitViolationSchema.index({ limitType: 1, timestamp: -1 });
LimitViolationSchema.index({ resolved: 1, timestamp: -1 });

export const LimitViolation = mongoose.model<ILimitViolation>('LimitViolation', LimitViolationSchema); 