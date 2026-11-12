import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMatchedPartner {
  submissionId?: mongoose.Types.ObjectId | string;
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  matchedCategory: string;
  notes?: string;
  matchedAt: Date;
}

export interface IMatchPointSubmission extends Document {
  matchPointId: string;
  fullName: string;
  email: string;
  phone?: string;
  organisationType?: string;
  companyName: string;
  designation: string;
  category: "Visitor" | "Exhibitor" | "Founder / Co-Founder" | "Investor" | "Service Provider" | "Enterprise Partner" | "Other";
  city?: string;
  linkedinUrl?: string;
  websiteUrl?: string;

  // What you do & Offer
  aboutCompany: string;
  usps: string[];
  offeringsDescription?: string;

  // What you are looking for (Needs)
  needCategories: string[];
  lookingForDetails?: string;
  urgency: "Immediate" | "Next 1-2 Months" | "Exploring Options";
  keywords: string[];

  // Admin & Matchmaking status
  status: "pending" | "analyzed" | "matched" | "emailed" | "archived";
  matchedWith: IMatchedPartner[];
  adminNotes?: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientMatchPointSubmission {
  _id: string;
  matchPointId: string;
  fullName: string;
  email: string;
  phone?: string;
  organisationType?: string;
  companyName: string;
  designation: string;
  category: string;
  city?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  aboutCompany: string;
  usps: string[];
  offeringsDescription?: string;
  needCategories: string[];
  lookingForDetails?: string;
  urgency: string;
  keywords: string[];
  status: "pending" | "analyzed" | "matched" | "emailed" | "archived";
  matchedWith?: IMatchedPartner[];
  adminNotes?: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

const MatchedPartnerSchema = new Schema<IMatchedPartner>(
  {
    submissionId: { type: Schema.Types.ObjectId, ref: "MatchPointSubmission" },
    companyName: { type: String, required: true },
    contactName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    matchedCategory: { type: String, required: true },
    notes: { type: String, default: "" },
    matchedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const MatchPointSubmissionSchema = new Schema<IMatchPointSubmission>(
  {
    matchPointId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: "", trim: true },
    organisationType: { type: String, default: "", trim: true, index: true },
    companyName: { type: String, required: true, trim: true, index: true },
    designation: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "Visitor",
        "Exhibitor",
        "Founder / Co-Founder",
        "Investor",
        "Service Provider",
        "Enterprise Partner",
        "Other",
      ],
      default: "Visitor",
      index: true,
    },
    city: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    websiteUrl: { type: String, default: "" },

    // What they do & USPs
    aboutCompany: { type: String, required: true, trim: true },
    usps: [{ type: String, trim: true }],
    offeringsDescription: { type: String, default: "" },

    // What they need
    needCategories: [{ type: String, trim: true, index: true }],
    lookingForDetails: { type: String, default: "", trim: true },
    urgency: {
      type: String,
      enum: ["Immediate", "Immediate Need", "Next 1-2 Months", "Exploring Options"],
      default: "Immediate",
    },
    keywords: [{ type: String, trim: true, lowercase: true, index: true }],

    // Admin workflow
    status: {
      type: String,
      enum: ["pending", "analyzed", "matched", "emailed", "archived"],
      default: "pending",
      index: true,
    },
    matchedWith: [MatchedPartnerSchema],
    adminNotes: { type: String, default: "" },
    source: { type: String, default: "QR-Venue" },
  },
  { timestamps: true }
);

// Text index for intelligent full-text matching search
MatchPointSubmissionSchema.index({
  companyName: "text",
  aboutCompany: "text",
  offeringsDescription: "text",
  lookingForDetails: "text",
  keywords: "text",
  usps: "text",
});

// Clear stale cached model during dev reload so schema updates apply
if (mongoose.models && mongoose.models.MatchPointSubmission) {
  delete (mongoose.models as any).MatchPointSubmission;
}
if ((mongoose as any).modelSchemas && (mongoose as any).modelSchemas.MatchPointSubmission) {
  delete (mongoose as any).modelSchemas.MatchPointSubmission;
}

const MatchPointSubmission: Model<IMatchPointSubmission> =
  mongoose.models.MatchPointSubmission ||
  mongoose.model<IMatchPointSubmission>("MatchPointSubmission", MatchPointSubmissionSchema);

export default MatchPointSubmission;
