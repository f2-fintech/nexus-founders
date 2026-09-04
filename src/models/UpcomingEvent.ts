import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUpcomingEvent extends Document {
  title: string;
  day: string;
  month: string;
  eventDate: Date;
  desc: string;
  address: string;
  btnText: string;
  registrationLink: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const UpcomingEventSchema = new Schema<IUpcomingEvent>(
  {
    title: { type: String, required: true, trim: true },
    day: { type: String, required: true, trim: true },
    month: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true },
    desc: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    btnText: { type: String, default: "See More" },
    registrationLink: { type: String, default: "/events/register" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const UpcomingEvent: Model<IUpcomingEvent> =
  mongoose.models.UpcomingEvent ||
  mongoose.model<IUpcomingEvent>("UpcomingEvent", UpcomingEventSchema);

export default UpcomingEvent;
