import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IBankerProfile {
  bankName: string;
  designation: string;
  institutionType?: string; // "Bank" | "NBFC" | "Fintech" | "Other financial institute"
  experience?: string;
  department?: string;
  city?: string;
  phone?: string;
  ticketSizeMin?: string;
  ticketSizeMax?: string;
  bio?: string;
  linkedinUrl?: string;
  isVerified?: boolean;
  avatar?: string;
  onlineStatus?: boolean;
  lastSeen?: Date;
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: "admin" | "founder" | "banker";
  bankerProfile?: IBankerProfile;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: true },
    role: { type: String, enum: ["admin", "founder", "banker"], default: "founder" },
    bankerProfile: {
      bankName: { type: String, trim: true },
      designation: { type: String, trim: true },
      institutionType: { type: String, trim: true, default: "Bank" },
      experience: { type: String, trim: true },
      department: { type: String, trim: true },
      city: { type: String, trim: true },
      phone: { type: String, trim: true },
      ticketSizeMin: { type: String, trim: true },
      ticketSizeMax: { type: String, trim: true },
      bio: { type: String, trim: true },
      linkedinUrl: { type: String, trim: true },
      isVerified: { type: Boolean, default: true },
      avatar: { type: String },
      onlineStatus: { type: Boolean, default: false },
      lastSeen: { type: Date },
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as any).User;
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;