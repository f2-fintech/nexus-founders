import mongoose, { Schema, Document, Model } from "mongoose";

export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface IBankerConnection extends Document {
  requesterId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  status: ConnectionStatus;
  introMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BankerConnectionSchema = new Schema<IBankerConnection>(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    introMessage: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// Compound index so a user cannot send duplicate requests to the same banker
BankerConnectionSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

const BankerConnection: Model<IBankerConnection> =
  mongoose.models.BankerConnection ||
  mongoose.model<IBankerConnection>("BankerConnection", BankerConnectionSchema);

export default BankerConnection;
