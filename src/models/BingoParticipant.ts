import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBingoTile {
  tileNumber: number;
  completed: boolean;
  cardPhotoUrl?: string;
  contactName?: string;
  contactCompany?: string;
  completedAt?: Date;
}

export interface IBingoParticipant extends Document {
  sessionId?: mongoose.Types.ObjectId;
  sessionNumber?: number;
  fullName: string;
  email: string;
  designation?: string;
  companyName?: string;
  category: "Exhibitor" | "Visitor" | "Co-Exhibitor" | "Organiser";
  ownVisitingCardUrl?: string;
  sessionToken: string;
  status: "playing" | "completed" | "disqualified";
  isWinner?: boolean;
  winnerRank?: number;
  winnerEmailSentAt?: Date;
  startedAt: Date;
  completedAt?: Date;
  timeTakenSeconds?: number;
  completedCount: number;
  progressPercent: number;
  tiles: IBingoTile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientBingoParticipant {
  _id: string;
  sessionId?: string;
  sessionNumber?: number;
  fullName: string;
  email: string;
  designation?: string;
  companyName?: string;
  category: "Exhibitor" | "Visitor" | "Co-Exhibitor" | "Organiser";
  ownVisitingCardUrl?: string;
  sessionToken: string;
  status: "playing" | "completed" | "disqualified";
  isWinner?: boolean;
  winnerRank?: number;
  winnerEmailSentAt?: string | Date;
  startedAt: string | Date;
  completedAt?: string | Date;
  timeTakenSeconds?: number;
  completedCount: number;
  progressPercent: number;
  tiles: IBingoTile[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const BingoTileSchema = new Schema<IBingoTile>(
  {
    tileNumber: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    cardPhotoUrl: { type: String, default: "" },
    contactName: { type: String, default: "" },
    contactCompany: { type: String, default: "" },
    completedAt: { type: Date },
  },
  { _id: false }
);

const BingoParticipantSchema = new Schema<IBingoParticipant>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "BingoSession", index: true },
    sessionNumber: { type: Number, default: 1, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    designation: { type: String, default: "" },
    companyName: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Exhibitor", "Visitor", "Co-Exhibitor", "Organiser"],
      default: "Visitor",
    },
    ownVisitingCardUrl: { type: String, default: "" },
    sessionToken: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["playing", "completed", "disqualified"],
      default: "playing",
    },
    isWinner: { type: Boolean, default: false, index: true },
    winnerRank: { type: Number },
    winnerEmailSentAt: { type: Date },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    timeTakenSeconds: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },
    progressPercent: { type: Number, default: 0 },
    tiles: { type: [BingoTileSchema], default: [] },
  },
  { timestamps: true }
);

// Compound index so a user can participate across different sessions
BingoParticipantSchema.index({ email: 1, sessionId: 1 });

if (mongoose.models.BingoParticipant) {
  delete (mongoose.models as any).BingoParticipant;
}

const BingoParticipant: Model<IBingoParticipant> =
  mongoose.model<IBingoParticipant>("BingoParticipant", BingoParticipantSchema);

export default BingoParticipant;
