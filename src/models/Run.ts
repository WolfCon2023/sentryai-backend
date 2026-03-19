import mongoose, { Schema, Document } from 'mongoose';
import { RunType, RunStatus, AgentInfo } from '../types/index.js';

export interface IRun extends Document {
  dealId: mongoose.Types.ObjectId;
  type: RunType;
  status: RunStatus;
  progress: number;
  agents: AgentInfo[];
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  triggeredBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const agentSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'running', 'complete', 'error'], default: 'pending' },
    progress: { type: Number, default: 0 },
    error: { type: String },
  },
  { _id: false },
);

const runSchema = new Schema<IRun>(
  {
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal', required: true, index: true },
    type: { type: String, enum: ['quick', 'full'], required: true },
    status: { type: String, enum: ['running', 'completed', 'failed'], default: 'running' },
    progress: { type: Number, default: 0 },
    agents: { type: [agentSchema], default: [] },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    duration: { type: Number },
    triggeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = { ...ret, id: ret._id.toString() } as Record<string, unknown>;
        obj.dealId = (obj.dealId as mongoose.Types.ObjectId)?.toString?.() ?? obj.dealId;
        obj.triggeredBy = (obj.triggeredBy as mongoose.Types.ObjectId)?.toString?.() ?? obj.triggeredBy;
        delete obj._id;
        delete obj.__v;
        return obj;
      },
    },
  },
);

export default mongoose.model<IRun>('Run', runSchema);
