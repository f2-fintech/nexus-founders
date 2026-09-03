import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJoinSubmission extends Document {
  fullName: string;
  companyName: string;
  designation: string;
  email: string;
  linkedin?: string;
  instagram?: string;
  challenges: string;
  risks: string;
  businessStage: string;
  financialStatus: string;
  milestone: string;
  visionImpact: string;
  uniqueStrengths: string;
  supportNeeded: string;
  valueContribution: string;
  status: "pending" | "reviewed" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const JoinSubmissionSchema = new Schema<IJoinSubmission>(
  {
    fullName: { type: String, required: true },
    companyName: { type: String, required: true },
    designation: { type: String, required: true },
    email: { type: String, required: true },
    linkedin: { type: String, default: "" },
    instagram: { type: String, default: "" },
    challenges: { type: String, required: true },
    risks: { type: String, required: true },
    businessStage: { type: String, required: true },
    financialStatus: { type: String, required: true },
    milestone: { type: String, required: true },
    visionImpact: { type: String, required: true },
    uniqueStrengths: { type: String, required: true },
    supportNeeded: { type: String, required: true },
    valueContribution: { type: String, required: true },
    status: { type: String, enum: ["pending", "reviewed", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

const JoinSubmission: Model<IJoinSubmission> =
  mongoose.models.JoinSubmission ||
  mongoose.model<IJoinSubmission>("JoinSubmission", JoinSubmissionSchema);

export default JoinSubmission;
