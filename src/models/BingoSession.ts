import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBingoWinner {
  participantId?: mongoose.Types.ObjectId;
  fullName: string;
  email?: string;
  companyName?: string;
  designation?: string;
  completedAt: Date;
  timeTakenSeconds?: number;
  cardPhotoUrl?: string;
  rank?: number;
  emailSent?: boolean;
  emailSentAt?: Date;
}

export interface IBingoSession extends Document {
  sessionNumber: number;
  title: string;
  status: "waiting" | "running" | "paused" | "stopped" | "completed";
  winner?: IBingoWinner;
  winners: IBingoWinner[];
  startedAt: Date;
  endedAt?: Date;
  timeLimitMinutes: number;
  totalParticipants: number;
  totalCompleted: number;
  totalCardsScanned: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientBingoSession {
  _id: string;
  sessionNumber: number;
  title: string;
  status: "waiting" | "running" | "paused" | "stopped" | "completed";
  winner?: {
    participantId?: string;
    fullName: string;
    email?: string;
    companyName?: string;
    designation?: string;
    completedAt: string | Date;
    timeTakenSeconds?: number;
    cardPhotoUrl?: string;
    rank?: number;
    emailSent?: boolean;
    emailSentAt?: string | Date;
  };
  winners?: Array<{
    participantId?: string;
    fullName: string;
    email?: string;
    companyName?: string;
    designation?: string;
    completedAt: string | Date;
    timeTakenSeconds?: number;
    cardPhotoUrl?: string;
    rank?: number;
    emailSent?: boolean;
    emailSentAt?: string | Date;
  }>;
  startedAt: string | Date;
  endedAt?: string | Date;
  timeLimitMinutes: number;
  totalParticipants: number;
  totalCompleted: number;
  totalCardsScanned: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const BingoWinnerSchema = new Schema<IBingoWinner>(
  {
    participantId: { type: Schema.Types.ObjectId, ref: "BingoParticipant" },
    fullName: { type: String, required: true },
    email: { type: String, default: "" },
    companyName: { type: String, default: "" },
    designation: { type: String, default: "" },
    completedAt: { type: Date, default: Date.now },
    timeTakenSeconds: { type: Number, default: 0 },
    cardPhotoUrl: { type: String, default: "" },
    rank: { type: Number, default: 1 },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date },
  },
  { _id: false }
);

const BingoSessionSchema = new Schema<IBingoSession>(
  {
    sessionNumber: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ["waiting", "running", "paused", "stopped", "completed"],
      default: "running",
      index: true,
    },
    winner: { type: BingoWinnerSchema, default: null },
    winners: { type: [BingoWinnerSchema], default: [] },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    timeLimitMinutes: { type: Number, default: 120 },
    totalParticipants: { type: Number, default: 0 },
    totalCompleted: { type: Number, default: 0 },
    totalCardsScanned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

if (mongoose.models.BingoSession) {
  delete (mongoose.models as any).BingoSession;
}

const BingoSession: Model<IBingoSession> =
  mongoose.model<IBingoSession>("BingoSession", BingoSessionSchema);

export default BingoSession;
