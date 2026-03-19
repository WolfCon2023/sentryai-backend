import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolioCompany extends Document {
  name: string;
  website: string;
  sector: string;
  stage: string;
  investmentDate: string;
  investmentAmount: string;
  ownership: string;
  status: 'active' | 'exited' | 'written-off';
  description: string;
  headquarters: string;
  employees: string;
  founded: string;
  lastUpdated: string;
  about: Record<string, unknown>;
  investmentMemo: Record<string, unknown>;
  marketOpportunity: Record<string, unknown>;
  customersAndPricing: Record<string, unknown>;
  productDetails: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioCompanySchema = new Schema<IPortfolioCompany>(
  {
    name: { type: String, required: true },
    website: { type: String, required: true },
    sector: { type: String, required: true },
    stage: { type: String, required: true },
    investmentDate: { type: String, required: true },
    investmentAmount: { type: String, required: true },
    ownership: { type: String, required: true },
    status: { type: String, enum: ['active', 'exited', 'written-off'], default: 'active' },
    description: { type: String, required: true },
    headquarters: { type: String, required: true },
    employees: { type: String, required: true },
    founded: { type: String, required: true },
    lastUpdated: { type: String, required: true },
    about: { type: Schema.Types.Mixed, default: {} },
    investmentMemo: { type: Schema.Types.Mixed, default: {} },
    marketOpportunity: { type: Schema.Types.Mixed, default: {} },
    customersAndPricing: { type: Schema.Types.Mixed, default: {} },
    productDetails: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = { ...ret, id: ret._id.toString() } as Record<string, unknown>;
        delete obj._id;
        delete obj.__v;
        return obj;
      },
    },
  },
);

export default mongoose.model<IPortfolioCompany>('PortfolioCompany', portfolioCompanySchema);
