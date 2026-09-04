import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFounder extends Document {
  name: string;
  role: string;
  company: string;
  photo: string;
  linkedin?: string;
  instagram?: string;
  googleplus?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FounderSchema = new Schema<IFounder>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    photo: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    instagram: { type: String, default: "" },
    googleplus: { type: String, default: "" },
    twitter: { type: String, default: "" },
    facebook: { type: String, default: "" },
    youtube: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index matches the primary query: active filter + order+createdAt sort
FounderSchema.index({ active: 1, order: 1, createdAt: 1 });
// Text index enables fast server-side search (faster than regex $or scans)
FounderSchema.index({ name: "text", company: "text", role: "text" });

const Founder: Model<IFounder> = mongoose.models.Founder || mongoose.model<IFounder>("Founder", FounderSchema);
export default Founder;