import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeamMember extends Document {
  name: string;
  designation: string;
  description: string;
  photo: string;
  socialLinks: {
    linkedin?: string;
    email?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
    facebook?: string;
    youtube?: string;
  };
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    description: { type: String, default: "" },
    photo: { type: String, default: "/images/avatar-placeholder.webp" },
    socialLinks: {
      linkedin: { type: String, default: "" },
      email: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      website: { type: String, default: "" },
      facebook: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index on order for fast sorted fetches
TeamMemberSchema.index({ order: 1 });

const TeamMember: Model<ITeamMember> =
  mongoose.models.TeamMember || mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);

export default TeamMember;
