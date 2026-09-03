import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteContent extends Document {
  key: string;
  value: string;
  type: "text" | "html" | "image" | "url";
  section: string;
  label: string;
  updatedBy?: string;
  updatedAt: Date;
}

const SiteContentSchema = new Schema<ISiteContent>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: String, required: true },
    type: { type: String, enum: ["text", "html", "image", "url"], default: "text" },
    section: { type: String, required: true },
    label: { type: String, required: true },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

const SiteContent: Model<ISiteContent> = mongoose.models.SiteContent || mongoose.model<ISiteContent>("SiteContent", SiteContentSchema);
export default SiteContent;