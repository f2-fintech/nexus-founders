import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBingoConfig extends Document {
  key: string;
  isGameActive: boolean;
  gameState: "running" | "paused" | "stopped";
  activeSessionId?: mongoose.Types.ObjectId;
  currentSessionNumber: number;
  eventTitle: string;
  timeLimitMinutes: number;
  allowRegistration: boolean;
  roundNumber: number;
  updatedAt: Date;
}

const BingoConfigSchema = new Schema<IBingoConfig>(
  {
    key: { type: String, default: "sff_bingo_config", unique: true },
    isGameActive: { type: Boolean, default: true },
    gameState: {
      type: String,
      enum: ["running", "paused", "stopped"],
      default: "running",
    },
    activeSessionId: { type: Schema.Types.ObjectId, ref: "BingoSession" },
    currentSessionNumber: { type: Number, default: 1 },
    eventTitle: { type: String, default: "SFF Nexus Networking Bingo" },
    timeLimitMinutes: { type: Number, default: 120 },
    allowRegistration: { type: Boolean, default: true },
    roundNumber: { type: Number, default: 1 },
  },
  { timestamps: true }
);

if (mongoose.models.BingoConfig) {
  delete (mongoose.models as any).BingoConfig;
}

const BingoConfig: Model<IBingoConfig> =
  mongoose.model<IBingoConfig>("BingoConfig", BingoConfigSchema);

export default BingoConfig;
