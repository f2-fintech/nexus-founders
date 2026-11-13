import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBankerMessage extends Document {
  conversationId: string;
  senderId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BankerMessageSchema = new Schema<IBankerMessage>(
  {
    conversationId: { type: String, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 4000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BankerMessageSchema.index({ conversationId: 1, createdAt: 1 });

const BankerMessage: Model<IBankerMessage> =
  mongoose.models.BankerMessage ||
  mongoose.model<IBankerMessage>("BankerMessage", BankerMessageSchema);

export default BankerMessage;
