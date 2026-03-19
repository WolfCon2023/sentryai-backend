import mongoose, { Schema, Document } from 'mongoose';
import { RunType } from '../types/index.js';

export interface IRunOutput extends Document {
  runId: mongoose.Types.ObjectId;
  dealId: mongoose.Types.ObjectId;
  companyName: string;
  type: RunType;
  output: Record<string, unknown>;
  overallConfidence: number;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const runOutputSchema = new Schema<IRunOutput>(
  {
    runId: { type: Schema.Types.ObjectId, ref: 'Run', required: true, unique: true },
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal', required: true, index: true },
    companyName: { type: String, required: true },
    type: { type: String, enum: ['quick', 'full'], required: true },
    output: { type: Schema.Types.Mixed, required: true },
    overallConfidence: { type: Number, default: 0 },
    generatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = { ...ret, id: ret._id.toString() } as Record<string, unknown>;
        obj.runId = (obj.runId as mongoose.Types.ObjectId)?.toString?.() ?? obj.runId;
        obj.dealId = (obj.dealId as mongoose.Types.ObjectId)?.toString?.() ?? obj.dealId;
        delete obj._id;
        delete obj.__v;
        return obj;
      },
    },
  },
);

export default mongoose.model<IRunOutput>('RunOutput', runOutputSchema);
