import mongoose, { Schema, Document } from 'mongoose';
import { DealStage, DealStatus } from '../types/index.js';

export interface IDeal extends Document {
  companyName: string;
  companyUrl: string;
  sector: string;
  stage: DealStage;
  status: DealStatus;
  notes?: string;
  ownerId: mongoose.Types.ObjectId;
  ownerName: string;
  lastRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const dealSchema = new Schema<IDeal>(
  {
    companyName: { type: String, required: true, trim: true },
    companyUrl: { type: String, required: true, trim: true },
    sector: { type: String, required: true },
    stage: {
      type: String,
      enum: ['preliminary', 'diligence', 'ic-prep', 'closed', 'passed'],
      default: 'preliminary',
    },
    status: {
      type: String,
      enum: ['idle', 'running', 'memo-ready', 'needs-review'],
      default: 'idle',
    },
    notes: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ownerName: { type: String, required: true },
    lastRunAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = { ...ret, id: ret._id.toString() } as Record<string, unknown>;
        obj.ownerId = (obj.ownerId as mongoose.Types.ObjectId)?.toString?.() ?? obj.ownerId;
        delete obj._id;
        delete obj.__v;
        return obj;
      },
    },
  },
);

export default mongoose.model<IDeal>('Deal', dealSchema);
