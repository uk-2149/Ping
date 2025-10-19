// Channel.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IChannel extends Document {
  name: string;
  description?: string;
  serverid: mongoose.Types.ObjectId;
  subChannels: mongoose.Types.ObjectId[]; // references SubChannel documents
  createdAt?: Date;
  updatedAt?: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    name: { type: String, required: true },
    description: { type: String },
    serverid: { type: Schema.Types.ObjectId, ref: "Server", required: true },
    subChannels: [{ type: Schema.Types.ObjectId, ref: "SubChannel" }],
  },
  { timestamps: true }
);

export default mongoose.model<IChannel>("Channel", channelSchema);
