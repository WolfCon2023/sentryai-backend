import mongoose, { Schema, Document } from 'mongoose';
import { FileParsingStatus } from '../types/index.js';

export interface IDealFile extends Document {
  dealId: mongoose.Types.ObjectId;
  fileName: string;
  fileType: string;
  fileSize: number;
  r2Key: string;
  uploadedBy: string;
  uploadedById: mongoose.Types.ObjectId;
  parsingStatus: FileParsingStatus;
  parsingError?: string;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const dealFileSchema = new Schema<IDealFile>(
  {
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal', required: true, index: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    r2Key: { type: String, default: '' },
    uploadedBy: { type: String, required: true },
    uploadedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parsingStatus: {
      type: String,
      enum: ['queued', 'parsing', 'ready', 'failed'],
      default: 'queued',
    },
    parsingError: { type: String },
    chunkCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = { ...ret, id: ret._id.toString() } as Record<string, unknown>;
        obj.dealId = (obj.dealId as mongoose.Types.ObjectId)?.toString?.() ?? obj.dealId;
        obj.uploadedAt = obj.createdAt;
        delete obj._id;
        delete obj.__v;
        delete obj.r2Key;
        delete obj.uploadedById;
        return obj;
      },
    },
  },
);

export default mongoose.model<IDealFile>('DealFile', dealFileSchema);
