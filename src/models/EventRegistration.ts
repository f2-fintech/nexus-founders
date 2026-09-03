import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEventRegistration extends Document {
  name: string;
  contactNo: string;
  email: string;
  companyName: string;
  designation: string;
  eventEdition?: string;
  status: "pending" | "confirmed" | "attended" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    name: { type: String, required: true },
    contactNo: { type: String, required: true },
    email: { type: String, required: true },
    companyName: { type: String, required: true },
    designation: { type: String, required: true },
    eventEdition: { type: String, default: "Nexus Founders Community Event" },
    status: { type: String, enum: ["pending", "confirmed", "attended", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

const EventRegistration: Model<IEventRegistration> =
  mongoose.models.EventRegistration ||
  mongoose.model<IEventRegistration>("EventRegistration", EventRegistrationSchema);

export default EventRegistration;
